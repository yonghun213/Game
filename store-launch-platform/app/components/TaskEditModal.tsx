
'use client'

import { useState } from 'react'
import { format } from 'date-fns'

export default function TaskEditModal({ task, onClose, onSave }: { task: any, onClose: () => void, onSave: (id: string, date: string, policy: string) => void }) {
  const [date, setDate] = useState(format(new Date(task.start_date), 'yyyy-MM-dd'))
  const [policy, setPolicy] = useState('SHIFT_DOWNSTREAM')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(task.id, date, policy)
    setIsSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Task: {task.title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Reschedule Policy</label>
             <select
               value={policy}
               onChange={e => setPolicy(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
             >
               <option value="SHIFT_DOWNSTREAM">Shift Downstream (Recommended)</option>
               <option value="ONLY_THIS">Only This Task (Manual Override)</option>
               {/* CUSTOM_SET omitted for MVP simplicity */}
             </select>
             <p className="text-xs text-gray-500 mt-1">
               {policy === 'SHIFT_DOWNSTREAM'
                 ? "All subsequent tasks in the timeline will be shifted by the same amount."
                 : "Only this task moves. Gaps or overlaps may occur."}
             </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
