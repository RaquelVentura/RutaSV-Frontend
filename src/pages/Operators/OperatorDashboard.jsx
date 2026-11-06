import { Link } from 'react-router-dom'
import { experiences, formatCurrency, reservations } from './operatorData.js'
import ReservationStatus from './ReservationStatus.jsx'

const stats = [
  { label: 'Ingresos este mes', value: formatCurrency(1240) },
  { label: 'Reservas recibidas', value: '31' },
  { label: 'Experiencias activas', value: '2' },
]

function OperatorDashboard() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h1 className="text-[26px] font-bold leading-tight text-[#203940]">Resumen</h1>
        <p className="mt-1 text-sm leading-5 text-muted">
          Revisa cómo va tu negocio y mantente al día con tus viajeros.
        </p>
      </div>

      <section aria-label="Resumen del negocio" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-2">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-[#e1e8e9] bg-white p-4 sm:p-5">
            <p className="text-xs leading-5 text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#147c91]">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[#e1e8e9] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#203940]">Próximas reservas</h2>
          <Link to="/operador/reservas" className="text-xs font-semibold text-[#147c91]">
            Ver historial
          </Link>
        </div>
        <div className="mt-3 divide-y divide-[#e7eded]">
          {reservations.slice(0, 2).map((reservation) => (
            <article key={reservation.id} className="py-3 first:pt-1 last:pb-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#203940]">{reservation.guest}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{reservation.experience}</p>
                  <p className="mt-1 text-xs text-muted">
                    {reservation.date} · {reservation.guests}{' '}
                    {reservation.guests === 1 ? 'viajero' : 'viajeros'}
                  </p>
                </div>
                <ReservationStatus status={reservation.status} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e1e8e9] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#203940]">Mis experiencias</h2>
          <Link to="/operador/experiencias" className="text-xs font-semibold text-[#147c91]">
            Ver todas
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {experiences.slice(0, 2).map((experience) => (
            <article key={experience.id} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#eaf5f6] text-xl" aria-hidden="true">
                {experience.category === 'Aventura' ? '🌊' : '☕'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#203940]">{experience.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {experience.location} · {formatCurrency(experience.price)} por persona
                </p>
              </div>
            </article>
          ))}
        </div>
        <Link
          to="/operador/experiencias/nueva"
          className="mt-4 flex min-h-11 items-center justify-center rounded-lg border border-[#dce4e5] px-4 text-sm font-semibold text-[#147c91] hover:bg-[#f3f8f8]"
        >
          + Agregar experiencia
        </Link>
      </section>

      <p className="text-xs leading-5 text-muted lg:col-span-2">
        Información de muestra. Conecta el backend para consultar tus datos reales.
      </p>
    </div>
  )
}

export default OperatorDashboard
