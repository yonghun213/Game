
'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import TaskList from '@/app/components/TaskList'
import TaskEditModal from '@/app/components/TaskEditModal'
import TaskCreateModal from '@/app/components/TaskCreateModal'
import ViewControls from '@/app/components/ViewControls'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { Card, CardContent } from '@/app/components/ui/Card'

const CalendarView = dynamic(() => import('@/app/components/CalendarView'), { ssr: false })

export default function StoreDetailClient({ store }: { store: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<'TIMELINE' | 'CALENDAR'>('TIMELINE')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
  }

  const handleEventDrop = ({ event, start }: { event: any, start: Date }) => {
      // When dropped, open the modal with the new date selected
      // We only care about start date shift for rescheduling
      const updatedTask = {
          ...event.resource,
          start_date: start.toISOString()
      }
      setSelectedTask(updatedTask)
  }

  const handleSave = async (id: string, date: string, policy: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStartDate: date, policy })
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to update task')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving task')
    }
  }

  const handleDelete = async (id: string) => {
      try {
          const res = await fetch(`/api/tasks/${id}/delete`, {
              method: 'DELETE'
          })
          if (res.ok) {
              router.refresh()
          } else {
              alert('Failed to delete task')
          }
      } catch (e) {
          console.error(e)
          alert('Error deleting task')
      }
  }

  // Filter Logic
  const phases = Array.from(new Set(store.tasks.map((t: any) => t.phase))) as string[]

  const filteredTasks = useMemo(() => {
      const mode = searchParams.get('mode') || 'ALL'
      const filterPhase = searchParams.get('phase')
      const filterStatus = searchParams.get('status')
      const filterRole = searchParams.get('role')
      const search = searchParams.get('q')?.toLowerCase()

      return store.tasks.filter((t: any) => {
          if (filterPhase && t.phase !== filterPhase) return false
          if (filterStatus && t.status !== filterStatus) return false
          if (filterRole && t.role !== filterRole) return false
          if (search && !t.title.toLowerCase().includes(search)) return false

          // Focus mode logic
          if (mode === 'FOCUS') {
              return t.is_milestone || t.manual_override || t.priority === 'HIGH'
          }
          return true
      })
  }, [store.tasks, searchParams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">← Back to Dashboard</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{store.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
             <span className="font-medium text-slate-700">{store.city}, {store.country}</span>
             <span>•</span>
             <span>Open: {store.planned_open_date ? new Date(store.planned_open_date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-slate-100 p-1 rounded-md flex">
               <button
                onClick={() => setView('TIMELINE')}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${view === 'TIMELINE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
               >
                   Timeline
               </button>
               <button
                onClick={() => setView('CALENDAR')}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${view === 'CALENDAR' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
               >
                   Calendar
               </button>
           </div>
           <Button onClick={() => setShowCreateModal(true)}>
               + New Task
           </Button>
        </div>
      </div>

      <ViewControls phases={phases} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Sidebar Stats */}
         <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
                <CardContent className="pt-6">
                    <div className="text-sm font-medium text-orange-800 uppercase tracking-wider mb-1">Status</div>
                    <div className="text-2xl font-bold text-slate-900">{store.status}</div>
                    <div className="mt-4 pt-4 border-t border-orange-100 flex justify-between text-sm">
                        <span className="text-slate-600">Tasks</span>
                        <span className="font-mono font-medium">{filteredTasks.length} / {store.tasks.length}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <div className="p-4 border-b border-slate-100 font-semibold text-slate-700">Milestones</div>
              <ul className="divide-y divide-slate-100">
                {store.milestones.map((m: any) => (
                  <li key={m.id} className="p-3 hover:bg-slate-50 transition-colors flex justify-between items-center text-sm">
                    <span className="text-slate-600">{m.name}</span>
                    <Badge variant={m.status === 'ACHIEVED' ? 'success' : 'default'}>
                        {new Date(m.date).toLocaleDateString()}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
         </div>

         {/* Main View */}
         <div className="lg:col-span-3">
            {view === 'TIMELINE' ? (
               <TaskList tasks={filteredTasks} onTaskClick={handleTaskClick} />
            ) : (
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 min-h-[600px]">
                   <CalendarView
                        tasks={filteredTasks}
                        onEventClick={handleTaskClick}
                        onEventDrop={handleEventDrop}
                   />
               </div>
            )}
         </div>
      </div>

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {showCreateModal && (
          <TaskCreateModal
            storeId={store.id}
            phases={phases}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
                setShowCreateModal(false)
                router.refresh()
            }}
          />
      )}
    </div>
  )
}
