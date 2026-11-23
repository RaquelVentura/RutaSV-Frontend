import { useMemo, useState } from 'react'
import { getMonthDays, toIsoDate } from '../../lib/availability.js'

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthFormatter = new Intl.DateTimeFormat('es-SV', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'long' })

const statusStyle = {
  available: 'bg-success-soft text-success',
  few: 'bg-amber-100 text-pending',
  full: 'bg-danger-soft text-danger',
  none: 'bg-mist/60 text-muted',
}

const legend = [
  ['Disponible', 'bg-success-soft ring-success/50'],
  ['Pocos cupos', 'bg-amber-100 ring-pending/50'],
  ['Sin cupos', 'bg-danger-soft ring-danger/50'],
  ['Sin sesiones', 'bg-mist/60 ring-muted/40'],
  ['Fecha seleccionada', 'bg-info-soft ring-brand'],
]

// Resumen de cupos de un día a partir de las sesiones cargadas.
function summarizeDay(sessions) {
  if (sessions.length === 0) return { status: 'none', available: 0, capacity: 0, label: 'Sin sesiones' }
  const available = sessions.reduce((sum, item) => sum + Number(item.available), 0)
  const capacity = sessions.reduce((sum, item) => sum + Number(item.capacity), 0)
  if (available === 0) return { status: 'full', available, capacity, label: 'Sin cupos' }
  const status = available / capacity <= 0.5 ? 'few' : 'available'
  return { status, available, capacity, label: `${available} ${available === 1 ? 'cupo' : 'cupos'}` }
}

function CuposCalendar({ rows, selectedDate, onSelect, initialMonth }) {
  const [view, setView] = useState(initialMonth)
  const byDate = useMemo(() => {
    const map = new Map()
    for (const row of rows) map.set(row.date, [...(map.get(row.date) ?? []), row])
    return map
  }, [rows])

  const cells = getMonthDays(view.year, view.month)
  const rawMonth = monthFormatter.format(new Date(view.year, view.month, 1))
  const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1)

  function move(delta) {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  function goToday() {
    const today = new Date()
    setView({ year: today.getFullYear(), month: today.getMonth() })
  }

  const buttonClass =
    'rounded-lg border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

  return (
    <section aria-label="Calendario de disponibilidad" className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-ink" aria-live="polite">
          {monthLabel}
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} className={buttonClass}>
            ‹ Anterior
          </button>
          <button type="button" onClick={goToday} className={buttonClass}>
            Hoy
          </button>
          <button type="button" onClick={() => move(1)} className={buttonClass}>
            Siguiente ›
          </button>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {legend.map(([label, style]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ring-1 ${style}`} /> {label}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-semibold text-muted">
        {weekdays.map((day) => (
          <span key={day} className="px-1">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((date, index) => {
          if (!date) return <span key={`vacio-${index}`} />
          const iso = toIsoDate(date)
          const day = summarizeDay(byDate.get(iso) ?? [])
          const selected = iso === selectedDate
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={selected}
              aria-label={`${dayFormatter.format(date)}, ${
                day.status === 'none' ? 'sin sesiones' : day.status === 'full' ? 'sin cupos' : `${day.available} de ${day.capacity} cupos`
              }`}
              className={`flex min-h-16 flex-col items-start justify-center rounded-lg px-2.5 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:min-h-[4.5rem] ${
                selected ? 'bg-info-soft text-brand ring-2 ring-brand' : statusStyle[day.status]
              }`}
            >
              <span className="text-sm font-bold text-ink">{date.getDate()}</span>
              <span className="text-[11px] font-medium">{day.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default CuposCalendar
