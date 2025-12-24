
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from './ui/Input'

export default function ViewControls({ phases }: { phases: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const mode = searchParams.get('mode') || 'ALL'
  const filterPhase = searchParams.get('phase') || ''
  const filterStatus = searchParams.get('status') || ''
  const filterRole = searchParams.get('role') || ''
  const search = searchParams.get('q') || ''

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap items-center gap-4">
        {/* View Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => updateParam('mode', 'ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'ALL' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Tasks
          </button>
          <button
            onClick={() => updateParam('mode', 'FOCUS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'FOCUS' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Focus
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Phase Filter */}
        <select
          value={filterPhase}
          onChange={(e) => updateParam('phase', e.target.value)}
          className="text-sm border-slate-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2 bg-white"
        >
          <option value="">All Phases</option>
          {phases.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          className="text-sm border-slate-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        {/* Role Filter (Simple Text Input for now or Predefined list?) */}
        {/* Let's use a select with common roles + input fallback if needed, but for MVP keep it simple select if possible.
            Since I don't have roles list passed in, I'll use a hardcoded list of standard roles for now.
        */}
        <select
          value={filterRole}
          onChange={(e) => updateParam('role', e.target.value)}
          className="text-sm border-slate-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 border p-2 bg-white"
        >
          <option value="">All Roles</option>
          <option value="PM">Project Manager</option>
          <option value="CONSTRUCTION">Construction</option>
          <option value="IT">IT / Systems</option>
          <option value="OPERATIONS">Operations</option>
          <option value="MARKETING">Marketing</option>
        </select>

        <div className="flex-grow"></div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => updateParam('q', e.target.value)}
          className="w-full md:w-48"
        />
      </div>
    </div>
  )
}
