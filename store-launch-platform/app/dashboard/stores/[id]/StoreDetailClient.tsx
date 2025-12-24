
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CalendarView from '@/app/components/CalendarView'
import TaskList from '@/app/components/TaskList'
import TaskEditModal from '@/app/components/TaskEditModal'
import Link from 'next/link'

export default function StoreDetailClient({ store }: { store: any }) {
  const router = useRouter()
  const [view, setView] = useState<'TIMELINE' | 'CALENDAR'>('TIMELINE')
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
  }

  const handleSave = async (id: string, date: string, policy: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStartDate: date, policy })
      })

      if (res.ok) {
        router.refresh() // Refresh server data
      } else {
        alert('Failed to update task')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving task')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold mt-1">{store.name}</h1>
          <div className="text-sm text-gray-500">
             {store.city}, {store.country} • Open: {new Date(store.planned_open_date).toLocaleDateString()}
          </div>
        </div>
        <div className="flex bg-white rounded border border-gray-300 p-1">
          <button
            onClick={() => setView('TIMELINE')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'TIMELINE' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setView('CALENDAR')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'CALENDAR' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Sidebar Stats */}
         <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded shadow border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Milestones</h3>
              <ul className="space-y-2 text-sm">
                {store.milestones.map((m: any) => (
                  <li key={m.id} className="flex justify-between">
                    <span className="text-gray-600">{m.name}</span>
                    <span className="font-medium">{new Date(m.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm text-blue-800">
               <p><strong>Status:</strong> {store.status}</p>
               <p className="mt-1">Tasks: {store.tasks.length}</p>
            </div>
         </div>

         {/* Main View */}
         <div className="lg:col-span-3">
            {view === 'TIMELINE' ? (
               <TaskList tasks={store.tasks} onTaskClick={handleTaskClick} />
            ) : (
               <CalendarView tasks={store.tasks} onEventClick={handleTaskClick} />
            )}
         </div>
      </div>

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
