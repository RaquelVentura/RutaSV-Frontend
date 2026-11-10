//panel de  historial dereservas 

import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { readOperatorCollection } from './operatorRepository.js'
import ReservationStatus from './ReservationStatus.jsx'

const filters = ['Todas', 'Pendiente', 'Confirmada', 'Completada']

function OperatorReservations() {
  const { user } = useAuth()
  const reservations = useMemo(
    () => readOperatorCollection(user, 'reservations'),
    [user],
  )
  const [filter, setFilter] = useState('Todas')
  const [query, setQuery] = useState('')

  const visibleReservations = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return reservations.filter((reservation) => {
      const matchesFilter = filter === 'Todas' || reservation.status === filter
      const matchesQuery =
        !term ||
        `${reservation.id} ${reservation.guest} ${reservation.experience}`
          .toLocaleLowerCase()
          .includes(term)
      return matchesFilter && matchesQuery
    })
  }, [filter, query, reservations])

  return (
    <div className="space-y-7 lg:space-y-9">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Historial de Reservas
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Consulta las reservas y los detalles de tus viajeros.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[minmax(240px,1fr)_auto] md:items-center lg:p-6">
        <div>
          <label className="sr-only" htmlFor="reservation-search">Buscar reservas</label>
          <input
            id="reservation-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por viajero o experiencia"
            className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar reservas">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === item
                  ? 'bg-brand text-white'
                  : 'bg-canvas text-muted hover:text-brand'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" aria-label="Reservas">
        {visibleReservations.length ? (
          visibleReservations.map((reservation) => (
            <article key={reservation.id} className="flex min-h-48 flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-ink">{reservation.guest}</h2>
                  <p className="mt-1 text-xs text-muted">{reservation.id}</p>
                </div>
                <ReservationStatus status={reservation.status} />
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-ink">
                {reservation.experience}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs text-muted">
                <span>{reservation.date}</span>
                <span>{reservation.guests} viajeros</span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-black/20 bg-white px-5 py-14 text-center lg:col-span-2 2xl:col-span-3">
            <p className="font-semibold text-ink">No hay reservas con estos criterios</p>
            <p className="mt-1 text-sm text-muted">Prueba con otro filtro o búsqueda.</p>
          </div>
        )}
      </section>

    </div>
  )
}

export default OperatorReservations
