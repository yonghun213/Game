
'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { Input, Label } from './ui/Input'
import { Card } from './ui/Card'

export default function TaskCreateModal({
    storeId,
    phases,
    onClose,
    onSuccess
}: {
    storeId: string,
    phases: string[],
    onClose: () => void,
    onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [phase, setPhase] = useState(phases[0] || 'Ad-hoc')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            phase,
            start_date: startDate,
            due_date: dueDate
        })
      })
      if (!res.ok) throw new Error('Failed')
      onSuccess()
    } catch (e) {
      alert('Error creating task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-900">New Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Hire Gen Z Marketing Intern"
                required
            />
          </div>

          <div className="space-y-2">
            <Label>Phase</Label>
            <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={phase}
                onChange={e => setPhase(e.target.value)}
            >
                {phases.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="Ad-hoc">Ad-hoc</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
