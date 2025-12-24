
'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

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

// Cast to any to avoid strict typing issues with Accessors in older/wrapper versions
const DnDCalendar = withDragAndDrop(Calendar as any) as any

export default function CalendarView({
    tasks,
    onEventClick,
    onEventDrop
}: {
    tasks: any[],
    onEventClick: (task: any) => void,
    onEventDrop?: (args: any) => void
}) {
  const events = tasks.map(t => ({
    id: t.id,
    title: t.title,
    start: new Date(t.start_date || new Date()), // Fallback
    end: new Date(t.due_date || new Date()),
    allDay: true,
    resource: t
  }))

  return (
    <div className="h-full">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={(e: any) => onEventClick(e.resource)}
        onEventDrop={onEventDrop}
        resizable={false} // Simplify for now
        views={['month', 'week', 'agenda']}
      />
    </div>
  )
}
