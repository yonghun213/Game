
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Input'

export default function TaskEditModal({
    task,
    onClose,
    onSave,
    onDelete
}: {
    task: any,
    onClose: () => void,
    onSave: (id: string, date: string, policy: string) => void,
    onDelete?: (id: string) => void
}) {
  const [date, setDate] = useState(task.start_date ? format(new Date(task.start_date), 'yyyy-MM-dd') : '')
  const [policy, setPolicy] = useState('SHIFT_DOWNSTREAM')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(task.id, date, policy)
    setIsSaving(false)
    onClose()
  }

  const handleDelete = async () => {
      if (!onDelete) return
      if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return
      setIsDeleting(true)
      await onDelete(task.id)
      setIsDeleting(false)
      onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{task.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
             <Label>Reschedule Policy</Label>
             <select
               value={policy}
               onChange={e => setPolicy(e.target.value)}
               className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
             >
               <option value="SHIFT_DOWNSTREAM">Shift Downstream (Standard)</option>
               <option value="ONLY_THIS">Only This Task (Manual Override)</option>
             </select>
             <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
               {policy === 'SHIFT_DOWNSTREAM'
                 ? "⚠️ Moving this task will shift all dependent tasks in the future by the same number of days."
                 : "ℹ️ Only this task will move. Dependencies may break or overlap."}
             </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
             {onDelete && (
                 <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
                     {isDeleting ? 'Deleting...' : 'Delete Task'}
                 </Button>
             )}
             <div className="flex space-x-2 ml-auto">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
