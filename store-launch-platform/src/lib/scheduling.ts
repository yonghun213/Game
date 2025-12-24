
import { PrismaClient } from '../generated/client'
import { addDays, subDays, isWeekend, addBusinessDays, isSaturday, isSunday } from 'date-fns'

const prisma = new PrismaClient()

// --- Date Math Helpers ---

export function calculateDate(baseDate: Date, offset: number, rule: string): Date {
  let result = new Date(baseDate)

  if (rule === 'BUSINESS_DAYS_MON_FRI') {
    // Simple business day logic (no holidays for MVP)
    if (offset === 0) return result

    // If offset is positive, add business days
    // If negative, subtract? date-fns addBusinessDays handles negative.
    // However, we need to ensure start date isn't weekend if rule is Mon-Fri.

    // First, ensure base is a weekday if we are adding 0?
    // Actually, usually we add offset.

    result = addBusinessDays(result, offset)
  } else {
    // CALENDAR_DAYS
    result = addDays(result, offset)
  }

  return result
}

// --- Generator ---

export async function generateStoreTimeline(storeId: String, templateId: String) {
  // 1. Fetch Store Anchors
  const milestones = await prisma.milestone.findMany({
    where: { store_id: storeId as string }
  })

  const anchorMap = new Map<string, Date>()
  milestones.forEach(m => anchorMap.set(m.type, m.date))

  // Default fallbacks if anchors missing (MVP safe-guards)
  if (!anchorMap.has('OPEN_DATE')) {
    // Try to find derived? For now assume OPEN_DATE exists as primary.
    console.error(`Store ${storeId} missing OPEN_DATE anchor`)
    return
  }

  // 2. Fetch Template
  const templatePhases = await prisma.templatePhase.findMany({
    where: { template_id: templateId as string },
    include: { tasks: true },
    orderBy: { order: 'asc' }
  })

  const newTasks = []

  for (const phase of templatePhases) {
    for (const tTask of phase.tasks) {
      // 3. Determine Anchor Date
      let anchorDate = anchorMap.get(tTask.anchor_event)

      // If specific anchor missing (e.g. CONSTRUCTION_START not set yet),
      // fallback to OPEN_DATE derived logic or skip?
      // Requirement: "Derive CONSTRUCTION_START milestone automatically if not provided (e.g. default OPEN_DATE - 90 days)"
      // Ideally we should have created the milestones *before* calling this.
      // But let's handle graceful fallback:
      if (!anchorDate) {
        if (tTask.anchor_event === 'CONSTRUCTION_START') {
             const open = anchorMap.get('OPEN_DATE')!
             anchorDate = subDays(open, 90)
        } else {
             anchorDate = anchorMap.get('OPEN_DATE')! // Fallback to Open Date
        }
      }

      // 4. Calc Dates
      const startDate = calculateDate(anchorDate, tTask.offset_days, tTask.workday_rule)
      const dueDate = calculateDate(startDate, tTask.duration_days, tTask.workday_rule)

      newTasks.push({
        store_id: storeId,
        title: tTask.name,
        phase: phase.name,
        status: 'NOT_STARTED',
        start_date: startDate,
        due_date: dueDate,
        calendar_rule: tTask.workday_rule,
        // We could link dependencies here if we had indices mapping
      })
    }
  }

  // Batch insert
  // SQLite/Prisma createMany is nice if supported
  for (const t of newTasks) {
    await prisma.task.create({ data: t as any })
  }
}

// --- Rescheduling ---

export async function rescheduleTask(taskId: string, newStartDate: Date, policy: 'ONLY_THIS' | 'SHIFT_DOWNSTREAM') {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || !task.start_date || !task.due_date) return

  const oldStart = new Date(task.start_date)
  const deltaMs = newStartDate.getTime() - oldStart.getTime()
  const deltaDays = Math.round(deltaMs / (1000 * 60 * 60 * 24))

  if (deltaDays === 0) return

  // Update current task
  const newDue = addDays(new Date(task.due_date), deltaDays)

  await prisma.task.update({
    where: { id: taskId },
    data: {
      start_date: newStartDate,
      due_date: newDue,
      manual_override: true
    }
  })

  if (policy === 'SHIFT_DOWNSTREAM') {
     // Find downstream. For MVP, we'll use a simplified "All tasks in the future" approach
     // or "All tasks with start_date >= old_start_date" (excluding the one we just moved)
     // A true dependency graph is better, but we haven't seeded dependencies fully.
     // Let's use: All tasks in the same store that started AFTER or ON the old start date.

     const downstream = await prisma.task.findMany({
       where: {
         store_id: task.store_id,
         id: { not: taskId }, // exclude self
         start_date: { gte: oldStart },
         locked: false
       }
     })

     for (const t of downstream) {
       if (!t.start_date || !t.due_date) continue

       await prisma.task.update({
         where: { id: t.id },
         data: {
           start_date: addDays(new Date(t.start_date), deltaDays),
           due_date: addDays(new Date(t.due_date), deltaDays)
         }
       })
     }
  }
}
