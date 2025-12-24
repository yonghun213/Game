
'use client'

import { format } from 'date-fns'

export default function TaskList({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  // Group by phase
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.phase]) acc[task.phase] = []
    acc[task.phase].push(task)
    return acc
  }, {} as Record<string, any[]>)

  const sortedPhases = Object.keys(grouped).sort() // Or use phase order if available

  return (
    <div className="space-y-6">
      {sortedPhases.map(phase => (
        <div key={phase} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
            {phase}
          </div>
          <div className="divide-y divide-gray-100">
            {grouped[phase].sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map((task: any) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div>
                   <div className="font-medium text-gray-900">{task.title}</div>
                   <div className="text-xs text-gray-500">
                      {task.role_responsible} • {task.duration_days} days
                   </div>
                </div>
                <div className="text-right text-sm">
                   <div className={`font-mono ${task.manual_override ? 'text-amber-600' : 'text-gray-600'}`}>
                     {format(new Date(task.start_date), 'MMM d')} - {format(new Date(task.due_date), 'MMM d')}
                   </div>
                   {task.is_milestone && <span className="inline-block px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 mt-1">Milestone</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
