
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

export default function TaskList({
    tasks,
    onTaskClick
}: {
    tasks: any[],
    loading?: boolean,
    onTaskClick: (task: any) => void,
    onUpdateTask?: (id: string, updates: any) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const togglePhase = (phase: string) => {
      setCollapsed(prev => ({ ...prev, [phase]: !prev[phase] }))
  }

  // Group by phase
  const grouped = tasks.reduce((acc, task) => {
    const p = task.phase || 'Uncategorized'
    if (!acc[p]) acc[p] = []
    acc[p].push(task)
    return acc
  }, {} as Record<string, any[]>)

  const sortedPhases = Object.keys(grouped).sort()

  if (tasks.length === 0) {
      return (
          <div className="p-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-slate-500">No tasks found matching your filters.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      {sortedPhases.map(phase => {
        const phaseTasks = grouped[phase].sort((a: any, b: any) =>
            (new Date(a.start_date || 0).getTime()) - (new Date(b.start_date || 0).getTime())
        )
        const isCollapsed = collapsed[phase]
        const startDate = phaseTasks[0]?.start_date
        const endDate = phaseTasks[phaseTasks.length - 1]?.due_date

        return (
          <Card key={phase} className="overflow-hidden border-l-4 border-l-orange-500">
            <div
                className="bg-gradient-to-r from-orange-50 to-white px-4 py-3 border-b border-orange-100 flex justify-between items-center cursor-pointer select-none hover:bg-orange-100 transition-colors"
                onClick={() => togglePhase(phase)}
            >
              <div className="flex items-center gap-2">
                  <span className={`transform transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
                  <h3 className="font-bold text-slate-800">{phase}</h3>
                  <span className="text-xs text-slate-500 font-normal">({phaseTasks.length} tasks)</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                  {startDate && endDate ? `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}` : ''}
              </div>
            </div>

            {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                    {phaseTasks.map((task: any) => (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="p-4 hover:bg-orange-50/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-2 transition-all group"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 group-hover:text-orange-700 transition-colors">{task.title}</span>
                                {task.is_milestone && <Badge variant="success">Milestone</Badge>}
                                {task.manual_override && <Badge variant="warning">Manual</Badge>}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                {task.role && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{task.role}</span>}
                                <span>{task.duration_days ?? 1}d</span>
                                {task.anchor && <span className="text-blue-600">⚓ {task.anchor}</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className={`font-mono ${task.status === 'DONE' ? 'text-emerald-600 line-through' : 'text-slate-600'}`}>
                                {task.start_date ? format(new Date(task.start_date), 'MMM d') : 'TBD'}
                                <span className="mx-1 text-slate-300">→</span>
                                {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'TBD'}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
