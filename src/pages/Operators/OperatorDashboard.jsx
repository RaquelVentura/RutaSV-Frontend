//PANEL DE RESUMEN OPERADOR 

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency } from './operatorData.js'
import {
  getOperatorDisplayName,
  readOperatorCollection,
} from './operatorRepository.js'
import ReservationStatus from './ReservationStatus.jsx'

function OperatorDashboard() {
  const { user } = useAuth()
  const operatorName = getOperatorDisplayName(user)
  const [showStatistics, setShowStatistics] = useState(true)
  const { experiences, reservations, reviews, availability } = useMemo(
    () => ({
      experiences: readOperatorCollection(user, 'experiences'),
      reservations: readOperatorCollection(user, 'reservations'),
      reviews: readOperatorCollection(user, 'reviews'),
      availability: readOperatorCollection(user, 'availability'),
    }),
    [user],
  )

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === 'Confirmada',
  )
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === 'Pendiente',
  )
  const canceledReservations = reservations.filter(
    (reservation) => reservation.status === 'Cancelada',
  )
  const revenue = confirmedReservations.reduce((total, reservation) => {
    const experience = experiences.find(
      (item) => String(item.id) === String(reservation.experienceId),
    )
    return total + (experience?.price ?? 0) * reservation.guests
  }, 0)
  const totalCapacity = availability.reduce(
    (total, item) => total + Number(item.capacity || 0),
    0,
  )
  const assignedCapacity = availability.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.capacity || 0) - Number(item.available || 0)),
    0,
  )
  const occupancy = totalCapacity
    ? Math.round((assignedCapacity / totalCapacity) * 100)
    : 0
  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : '—'
  const stats = [
    {
      label: 'Reservas registradas',
      value: String(reservations.length),
      detail: `${confirmedReservations.length} confirmadas · ${pendingReservations.length} pendientes · ${canceledReservations.length} canceladas`,
    },
    {
      label: 'Ingresos confirmados',
      value: formatCurrency(revenue),
      detail: `${confirmedReservations.reduce((total, item) => total + item.guests, 0)} viajeros confirmados`,
    },
    {
      label: 'Ocupación',
      value: `${occupancy}%`,
      detail: `${assignedCapacity} cupos asignados de ${totalCapacity}`,
    },
    {
      label: 'Valoración',
      value: `${averageRating} / 5`,
      detail: `${reviews.length} reseñas de viajeros`,
    },
  ]

  return (
    <div className="space-y-7 lg:space-y-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Resumen</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Hola, {operatorName}. Aquí tienes la actividad de tu negocio.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={showStatistics}
          aria-controls="operator-statistics"
          onClick={() => setShowStatistics((visible) => !visible)}
          className="rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm font-bold text-brand transition hover:border-brand hover:bg-info-soft"
        >
          {showStatistics ? 'Ocultar estadísticas' : 'Mostrar estadísticas'}
        </button>
      </header>

      <section
        id="operator-statistics"
        aria-label="Estadísticas del negocio"
        hidden={!showStatistics}
        className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="flex min-h-40 flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="my-4 text-3xl font-extrabold tracking-tight text-ink">
              {stat.value}
            </p>
            <p className="text-xs leading-5 text-muted">{stat.detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Próximas reservas</h2>
              <p className="mt-1 text-sm text-muted">Actividad registrada de tus viajeros.</p>
            </div>
            <Link to="/operador/reservas" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Ver historial
            </Link>
          </div>
          {reservations.length ? (
            <div className="mt-4 divide-y divide-black/10">
              {reservations.slice(0, 3).map((reservation) => (
                <article key={reservation.id} className="py-4 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{reservation.guest}</p>
                      <p className="mt-1 text-sm text-muted">
                        {experiences.find((item) => String(item.id) === String(reservation.experienceId))?.title ?? reservation.experience}
                      </p>
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
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-black/15 p-5 text-sm text-muted">
              Aún no tienes reservas registradas.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Mis experiencias</h2>
              <p className="mt-1 text-sm text-muted">Gestiona tus actividades publicadas.</p>
            </div>
            <Link to="/operador/experiencias" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Ver todas
            </Link>
          </div>
          {experiences.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {experiences.slice(0, 2).map((experience) => (
                <article
                  key={experience.id}
                  className="flex min-w-0 items-center gap-4 rounded-xl border border-black/10 bg-canvas p-4"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-info-soft text-2xl" aria-hidden="true">
                    {experience.category === 'Aventura' ? '🌊' : experience.category === 'Cultura y café' ? '☕' : '✨'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{experience.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {experience.location} · {formatCurrency(experience.price)} por persona
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-black/15 p-5 text-sm text-muted">
              Aún no has creado experiencias.
            </p>
          )}
          <Link
            to="/operador/experiencias/nueva"
            className="mt-5 flex min-h-12 items-center justify-center rounded-xl border border-black/15 px-4 text-sm font-semibold text-brand transition hover:border-brand hover:bg-info-soft"
          >
            + Agregar experiencia
          </Link>
        </section>
      </div>

      <p className="text-xs leading-5 text-muted">
        Información de ejemplo guardada por perfil en este navegador; se reemplazará por datos del backend al integrarlo.
      </p>
    </div>
  )
}

export default OperatorDashboard
