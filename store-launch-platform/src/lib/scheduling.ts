
import { PrismaClient } from '../generated/client'
import { addDays, subDays, isWeekend, addBusinessDays, differenceInCalendarDays } from 'date-fns'

const prisma = new PrismaClient()

// --- Date Math ---

export function calculateDate(baseDate: Date, offset: number, rule: string): Date {
  let result = new Date(baseDate)
  if (rule === 'BUSINESS_DAYS_MON_FRI') {
    result = addBusinessDays(result, offset)
  } else {
    result = addDays(result, offset)
  }
  return result
}

// --- Generator ---

export async function generateStoreTimeline(storeId: string, templateId: string) {
  // 1. Fetch Store Anchors
  const milestones = await prisma.milestone.findMany({ where: { store_id: storeId } })
  const anchorMap = new Map<string, Date>()
  milestones.forEach(m => anchorMap.set(m.type, m.date))

  if (!anchorMap.has('OPEN_DATE')) {
    if (anchorMap.has('CONTRACT_SIGNED')) {
        const open = addDays(anchorMap.get('CONTRACT_SIGNED')!, 180)
        anchorMap.set('OPEN_DATE', open)
        await prisma.milestone.create({
            data: { store_id: storeId, name: 'Planned Open Date (Derived)', type: 'OPEN_DATE', date: open, status: 'PENDING' }
        })
    } else {
        console.error(`Store ${storeId} missing OPEN_DATE and CONTRACT_SIGNED`)
        return
    }
  }

  const templatePhases = await prisma.templatePhase.findMany({
    where: { template_id: templateId },
    include: { tasks: true },
    orderBy: { order: 'asc' }
  })

  // Keep track of created tasks to link dependencies
  // Map<TemplateTaskName, CreatedTaskId>
  // Warning: Template task names must be unique for this simple mapping logic
  const taskNameIdMap = new Map<string, string>()

  for (const phase of templatePhases) {
    for (const tTask of phase.tasks) {
      let anchorDate = anchorMap.get(tTask.anchor_event)

      if (!anchorDate) {
        if (tTask.anchor_event === 'CONSTRUCTION_START') {
             const open = anchorMap.get('OPEN_DATE')!
             anchorDate = subDays(open, 90)
        } else {
             anchorDate = anchorMap.get('OPEN_DATE')!
        }
      }

      const startDate = calculateDate(anchorDate, tTask.offset_days, tTask.workday_rule)
      const dueDate = calculateDate(startDate, tTask.duration_days, tTask.workday_rule)

      const newTask = await prisma.task.create({
        data: {
            store_id: storeId,
            title: tTask.name,
            phase: phase.name,
            status: 'NOT_STARTED',
            start_date: startDate,
            due_date: dueDate,
            calendar_rule: tTask.workday_rule,
            anchor: tTask.anchor_event,
            role: tTask.role_responsible,
        }
      })

      taskNameIdMap.set(tTask.name, newTask.id)
    }
  }

  // Second pass: Create Dependencies
  for (const phase of templatePhases) {
      for (const tTask of phase.tasks) {
          if (tTask.dependency_indices) {
              console.log(`Found task with deps: ${tTask.name} -> ${tTask.dependency_indices}`)
              try {
                  // console.log(`Processing deps for ${tTask.name}: ${tTask.dependency_indices}`)
                  const deps = JSON.parse(tTask.dependency_indices) as string[]
                  const taskId = taskNameIdMap.get(tTask.name)
                  if (!taskId) {
                      console.log(`Task ID not found for ${tTask.name}`)
                      continue
                  }

                  for (const depName of deps) {
                      const depId = taskNameIdMap.get(depName)
                      if (depId) {
                          await prisma.taskDependency.create({
                              data: { task_id: taskId, depends_on_id: depId }
                          })
                          // console.log(`Created dep: ${tTask.name} -> ${depName}`)
                      } else {
                          console.log(`Dep ID not found for ${depName}`)
                      }
                  }
              } catch (e) {
                  console.error(`Error parsing deps for ${tTask.name}:`, e)
              }
          }
      }
  }
}

// --- Helpers ---

async function getDescendants(taskId: string, visited = new Set<string>()): Promise<string[]> {
    if (visited.has(taskId)) return []
    visited.add(taskId)

    const deps = await prisma.taskDependency.findMany({
        where: { depends_on_id: taskId }
    })

    let descendants: string[] = []
    for (const dep of deps) {
        descendants.push(dep.task_id)
        const sub = await getDescendants(dep.task_id, visited)
        descendants = [...descendants, ...sub]
    }
    return descendants
}

// --- Rescheduling ---

export async function rescheduleTask(
    taskId: string,
    newStartDate: Date,
    policy: 'ONLY_THIS' | 'SHIFT_DOWNSTREAM' | 'CUSTOM_SET',
    customTaskIds: string[] = []
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || !task.start_date || !task.due_date) return

  const oldStart = new Date(task.start_date)
  const deltaDays = differenceInCalendarDays(newStartDate, oldStart)

  if (deltaDays === 0) return

  // Update current task
  const duration = differenceInCalendarDays(new Date(task.due_date), oldStart)
  const newDue = addDays(newStartDate, duration)

  await prisma.task.update({
    where: { id: taskId },
    data: {
      start_date: newStartDate,
      due_date: newDue,
      manual_override: true
    }
  })

  let tasksToShift: string[] = []

  if (policy === 'SHIFT_DOWNSTREAM') {
     const descendants = await getDescendants(taskId)
     tasksToShift = descendants
  } else if (policy === 'CUSTOM_SET') {
     tasksToShift = customTaskIds
  }

  for (const tid of tasksToShift) {
      if (tid === taskId) continue

      const t = await prisma.task.findUnique({ where: { id: tid } })
      if (!t || t.locked || !t.start_date || !t.due_date) continue

      const tStart = addDays(new Date(t.start_date), deltaDays)
      const tDue = addDays(new Date(t.due_date), deltaDays)

      await prisma.task.update({
          where: { id: tid },
          data: { start_date: tStart, due_date: tDue }
      })
  }
}

// --- Milestone Updates ---

export async function updateMilestone(milestoneId: string, newDate: Date) {
    const ms = await prisma.milestone.findUnique({ where: { id: milestoneId } })
    if (!ms) return

    await prisma.milestone.update({ where: { id: milestoneId }, data: { date: newDate } })

    const deltaDays = differenceInCalendarDays(newDate, new Date(ms.date))
    if (deltaDays === 0) return

    const anchoredTasks = await prisma.task.findMany({
        where: { store_id: ms.store_id, anchor: ms.type, locked: false }
    })

    for (const t of anchoredTasks) {
        if (!t.start_date || !t.due_date) continue
        const tStart = addDays(new Date(t.start_date), deltaDays)
        const tDue = addDays(new Date(t.due_date), deltaDays)

        await prisma.task.update({
            where: { id: t.id },
            data: { start_date: tStart, due_date: tDue }
        })

        const descendants = await getDescendants(t.id)
        for (const descId of descendants) {
             const dt = await prisma.task.findUnique({ where: { id: descId } })
             if (dt && !dt.locked && !dt.anchor && dt.start_date && dt.due_date) {
                 await prisma.task.update({
                     where: { id: descId },
                     data: {
                         start_date: addDays(new Date(dt.start_date), deltaDays),
                         due_date: addDays(new Date(dt.due_date), deltaDays)
                     }
                 })
             }
        }
    }
}
