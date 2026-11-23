import { useState } from 'react'
import { findFirstAvailableDate, formatLongDate, getSpotsForDate } from '../../lib/availability.js'
import AvailabilityCalendar from './AvailabilityCalendar.jsx'

const usd = (value) => `$${value.toFixed(2)}`

const selectClass =
  'w-full rounded-xl border border-mist bg-surface px-3.5 py-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30'

// Panel lateral de reserva: fecha, horario, personas y total. Entrega la
// selección al padre cuando la persona pulsa «Reservar».
function BookingPanel({ experience, onReserve, today = new Date() }) {
  const [date, setDate] = useState(() => findFirstAvailableDate(experience.capacity, today))
  const [time, setTime] = useState(experience.schedules[0])
  const [people, setPeople] = useState(2)

  const availability = date ? getSpotsForDate(date, experience.capacity, today) : null
  const maxPeople = availability ? Math.min(availability.spots, experience.capacity) : 1
  const guests = Math.min(people, maxPeople)
  const subtotal = experience.price * guests
  const canReserve = Boolean(date) && availability.spots > 0

  function handleSelect(next) {
    setDate(next)
    const spots = getSpotsForDate(next, experience.capacity, today).spots
    setPeople((current) => Math.min(current, Math.max(spots, 1)))
  }

  return (
    <aside
      aria-label="Reservar esta experiencia"
      className="rounded-2xl border border-mist bg-surface p-6 shadow-sm lg:sticky lg:top-6"
    >
      <p className="text-3xl font-extrabold text-ink">{usd(experience.price)} USD</p>
      <p className="mt-1 text-sm text-muted">por persona · Equipo incluido</p>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-ink">Fecha</p>
        <AvailabilityCalendar
          capacity={experience.capacity}
          selected={date}
          onSelect={handleSelect}
          today={today}
        />
        {date && (
          <p className="mt-3 text-xs font-semibold text-brand" role="status">
            {formatLongDate(date)} · {availability.spots} de {experience.capacity} cupos
          </p>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="booking-time" className="mb-1.5 block text-sm font-semibold text-ink">
            Horario
          </label>
          <select id="booking-time" value={time} onChange={(event) => setTime(event.target.value)} className={selectClass}>
            {experience.schedules.map((schedule) => (
              <option key={schedule} value={schedule}>
                {schedule}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="booking-people" className="mb-1.5 block text-sm font-semibold text-ink">
            Personas
          </label>
          <select
            id="booking-people"
            value={guests}
            onChange={(event) => setPeople(Number(event.target.value))}
            disabled={!canReserve}
            className={selectClass}
          >
            {Array.from({ length: maxPeople }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'persona' : 'personas'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <dl className="mt-5 space-y-2 border-t border-mist pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink">
            {usd(experience.price)} × {guests} {guests === 1 ? 'persona' : 'personas'}
          </dt>
          <dd className="text-ink">{usd(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink">Cargo por servicio</dt>
          <dd className="text-ink">{usd(0)}</dd>
        </div>
        <div className="flex justify-between border-t border-mist pt-3 text-base font-bold text-ink">
          <dt>Total a pagar</dt>
          <dd>{usd(subtotal)} USD</dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={!canReserve}
        onClick={() => onReserve({ date, time, people: guests })}
        className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {canReserve ? 'Reservar' : 'Sin cupos disponibles'}
      </button>
    </aside>
  )
}

export default BookingPanel
