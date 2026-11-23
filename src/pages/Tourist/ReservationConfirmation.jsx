import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import { getReservationById } from '../../lib/bookingApi.js'
import { extractApiError } from '../../lib/catalogApi.js'
import {
  formatCurrency,
  formatDateReadable,
  paymentStatusMeta,
  reservationStatusMeta,
} from '../../lib/formatters.js'

function ReservationConfirmation() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const stateReservation = location.state?.reservation || null
  const reservationId = searchParams.get('id') || stateReservation?.id || ''

  const [reservation, setReservation] = useState(stateReservation)
  const [loading, setLoading] = useState(!stateReservation && Boolean(reservationId))
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (stateReservation || !reservationId) return
    let cancelled = false
    getReservationById(reservationId)
      .then((data) => {
        if (!cancelled) setReservation(data)
      })
      .catch((err) => {
        if (!cancelled) setErrorMessage(extractApiError(err, 'No se pudo cargar la reserva.').message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reservationId, stateReservation])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-ink">Comprobante no disponible</h1>
        <p className="mt-2 text-sm text-muted">
          {errorMessage || 'Puedes revisar todas tus reservas desde tu historial.'}
        </p>
        <Link
          to="/turista/mi-actividad/reservas"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          Ir a Mis reservas
        </Link>
      </div>
    )
  }

  const statusInfo = reservationStatusMeta[reservation.status] ?? {
    label: reservation.status,
    tone: 'neutral',
  }
  const paymentInfo = paymentStatusMeta[reservation.paymentStatus] ?? {
    label: reservation.paymentStatus,
    tone: 'neutral',
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div className="rounded-3xl border border-mist bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700">
            ✓ Reserva registrada
          </span>
          <div className="flex gap-2">
            <Pill tone={statusInfo.tone}>{statusInfo.label}</Pill>
            <Pill tone={paymentInfo.tone}>{paymentInfo.label}</Pill>
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-ink">
          ¡Todo listo para {reservation.experienceTitle}!
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enviamos la confirmación y los detalles al correo{' '}
          <strong className="text-ink">{reservation.contactEmail || 'registrado en tu cuenta'}</strong>.
          {reservation.status === 'PENDIENTE'
            ? ' El operador revisará y confirmará tu reserva pronto.'
            : ' Tu reserva quedó confirmada de inmediato.'}
        </p>

        <dl className="mt-6 grid gap-4 rounded-2xl border border-mist bg-canvas p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Código de reserva</dt>
            <dd className="mt-1 font-mono text-base font-bold text-brand">
              {reservation.reservationCode}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Referencia de pago demo</dt>
            <dd className="mt-1 font-mono text-xs font-semibold text-ink">
              {reservation.paymentReference || 'PAGADO_DEMO'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Fecha y hora</dt>
            <dd className="mt-1 font-semibold text-ink">
              {formatDateReadable(reservation.activityDate)} · {reservation.startTime}
              {reservation.endTime ? ` – ${reservation.endTime}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Personas y total</dt>
            <dd className="mt-1 font-semibold text-ink">
              {reservation.peopleCount} {reservation.peopleCount === 1 ? 'persona' : 'personas'} ·{' '}
              {formatCurrency(reservation.total, reservation.currency)}
            </dd>
          </div>
          {reservation.locationLabel && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-muted">Ubicación</dt>
              <dd className="mt-1 font-semibold text-ink">{reservation.locationLabel}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/turista/mi-actividad/reservas"
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Ver mi historial de reservas
          </Link>
          <Link
            to="/experiencias"
            className="rounded-full border border-mist bg-surface px-6 py-3 text-sm font-semibold text-ink hover:border-brand"
          >
            Seguir explorando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReservationConfirmation
