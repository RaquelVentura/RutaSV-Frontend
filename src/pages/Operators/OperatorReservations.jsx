import { useMemo, useState } from 'react'
import { reservations } from './operatorData.js'
import ReservationStatus from './ReservationStatus.jsx'

const filters = ['Todas', 'Pendiente', 'Confirmada', 'Completada']

function OperatorReservations() {
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
  }, [filter, query])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-bold leading-tight text-[#203940]">
          Historial de Reservas
        </h1>
        <p className="mt-1 text-sm leading-5 text-muted">
          Consulta las reservas y los detalles de tus viajeros.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-[#e1e8e9] bg-white p-4">
        <label className="sr-only" htmlFor="reservation-search">Buscar reservas</label>
        <input
          id="reservation-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por viajero o experiencia"
          className="w-full rounded-lg border border-[#dce4e5] bg-white px-3 py-2.5 text-sm text-[#203940] outline-none placeholder:text-muted focus:border-[#147c91] focus:ring-2 focus:ring-[#147c91]/15"
        />
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar reservas">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === item
                  ? 'bg-[#147c91] text-white'
                  : 'bg-[#f1f5f5] text-muted hover:text-[#147c91]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Reservas">
        {visibleReservations.length ? (
          visibleReservations.map((reservation) => (
            <article key={reservation.id} className="rounded-xl border border-[#e1e8e9] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#203940]">{reservation.guest}</h2>
                  <p className="mt-1 text-xs text-muted">{reservation.id}</p>
                </div>
                <ReservationStatus status={reservation.status} />
              </div>
              <p className="mt-3 text-sm font-medium leading-5 text-[#203940]">
                {reservation.experience}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#e7eded] pt-3 text-xs text-muted">
                <span>{reservation.date}</span>
                <span>{reservation.guests} viajeros</span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#dce4e5] bg-white px-5 py-10 text-center md:col-span-2 xl:col-span-3">
            <p className="font-semibold text-[#203940]">No hay reservas con estos criterios</p>
            <p className="mt-1 text-sm text-muted">Prueba con otro filtro o búsqueda.</p>
          </div>
        )}
      </section>
      <p className="text-xs leading-5 text-muted">
        Reservas de muestra. La gestión se habilitará al conectar el backend.
      </p>
    </div>
  )
}

export default OperatorReservations
