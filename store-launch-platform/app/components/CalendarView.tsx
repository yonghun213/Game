
'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState } from 'react'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarView({ tasks, onEventClick }: { tasks: any[], onEventClick: (task: any) => void }) {
  const events = tasks.map(t => ({
    id: t.id,
    title: t.title,
    start: new Date(t.start_date),
    end: new Date(t.due_date),
    allDay: true, // simplified for MVP
    resource: t
  }))

  return (
    <div className="h-[600px] bg-white p-4 rounded shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={(e) => onEventClick(e.resource)}
      />
    </div>
  )
}
