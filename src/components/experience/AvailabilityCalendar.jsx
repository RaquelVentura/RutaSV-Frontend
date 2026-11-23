import { useState } from 'react'
import { getMonthDays, getSpotsForDate, startOfDay, toIsoDate } from '../../lib/availability.js'

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const monthFormatter = new Intl.DateTimeFormat('es-SV', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'long' })

const statusClass = {
  available: 'bg-success-soft text-success hover:ring-2 hover:ring-brand',
  few: 'bg-amber-100 text-pending hover:ring-2 hover:ring-brand',
  full: 'text-muted/50 line-through',
  closed: 'text-muted/50',
  past: 'text-muted/40',
}

function statusLabel(status, spots) {
  if (status === 'available' || status === 'few') return `${spots} cupos`
  if (status === 'full') return 'sin cupos'
  if (status === 'closed') return 'cerrado'
  return 'fecha pasada'
}

function AvailabilityCalendar({ capacity, selected, onSelect, today = new Date() }) {
  const base = selected ?? today
  const [view, setView] = useState({ year: base.getFullYear(), month: base.getMonth() })
  const cells = getMonthDays(view.year, view.month)
  const current = startOfDay(today)
  const rawMonth = monthFormatter.format(new Date(view.year, view.month, 1))
  const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1)
  const isCurrentMonth = view.year === current.getFullYear() && view.month === current.getMonth()

  function move(delta) {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink" aria-live="polite">
          {monthLabel}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={isCurrentMonth}
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-mist text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-mist text-ink transition hover:bg-canvas"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
        {weekdays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`vacio-${index}`} />
          const { status, spots } = getSpotsForDate(date, capacity, today)
          const enabled = status === 'available' || status === 'few'
          const isSelected = selected && toIsoDate(selected) === toIsoDate(date)
          return (
            <button
              key={toIsoDate(date)}
              type="button"
              disabled={!enabled}
              onClick={() => onSelect(date)}
              aria-pressed={Boolean(isSelected)}
              aria-label={`${dayFormatter.format(date)}, ${statusLabel(status, spots)}`}
              className={`flex aspect-square items-center justify-center rounded-full text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isSelected ? 'bg-brand text-white' : statusClass[status]
              } ${enabled ? '' : 'cursor-not-allowed'}`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success-soft ring-1 ring-success/40" /> Disponible
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-100 ring-1 ring-pending/40" /> Pocos cupos
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-muted/40" /> No disponible
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Elegido
        </li>
      </ul>
    </div>
  )
}

export default AvailabilityCalendar
