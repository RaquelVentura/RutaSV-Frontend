import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getReservationById } from '../../lib/bookingApi.js'
import { extractApiError, resolveAssetUrl } from '../../lib/catalogApi.js'
import { formatCurrency, formatDateReadable, reservationStatusMeta } from '../../lib/formatters.js'

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

  const statusInfo = reservationStatusMeta[reservation.status] ?? { label: reservation.status }
  const confirmed = reservation.status !== 'PENDIENTE'
  const firstName = (reservation.contactName || '').split(' ')[0]
  const people = reservation.peopleCount
  const cover = resolveAssetUrl(reservation.experienceCoverImageUrl)
  const schedule = `${reservation.startTime}${reservation.endTime ? ` – ${reservation.endTime}` : ''}`

  const nextSteps = [
    {
      icon: '/icons/turista/mail.svg',
      title: 'Guarda tu confirmación',
      text: `Correo de referencia: ${reservation.contactEmail || 'el de tu cuenta'}.`,
    },
    {
      icon: '/icons/turista/map-pin.svg',
      title: 'Nos vemos allá',
      text: `${reservation.locationLabel || 'Punto de encuentro'}. Llega con unos minutos de anticipación y tu código de reserva.`,
    },
    {
      icon: '/icons/turista/backpack.svg',
      title: 'Prepara lo esencial',
      text: 'Lleva ropa cómoda, agua y lo que necesites para disfrutar. El operador te enviará los detalles finales si los hay.',
    },
  ]

  return (
    <div className="w-full px-6 py-10 sm:py-12">
      <div className="mx-auto flex max-w-[960px] flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success-soft">
            <img src="/icons/turista/check.svg" alt="" className="size-8" />
          </span>
          <span className="rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
            {confirmed ? 'Reserva confirmada' : 'Reserva registrada'}
          </span>
          <h1 className="text-[28px] font-bold leading-tight text-ink sm:text-[38px]">
            ¡Tu próxima historia ya tiene fecha!
          </h1>
          <p className="text-base text-muted">
            {firstName ? `${firstName}, tu` : 'Tu'} plan en {reservation.locationLabel || reservation.experienceTitle} está listo.{' '}
            {confirmed
              ? 'Guarda estos detalles para tu viaje.'
              : 'El operador revisará y confirmará tu reserva pronto.'}
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-xl border border-mist bg-surface p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs uppercase text-muted">Código de reserva</p>
              <p className="break-all text-[22px] font-bold leading-snug text-brand sm:text-[25px]">
                {reservation.reservationCode}
              </p>
            </div>
            <span className="self-start rounded-full bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success sm:self-auto">
              Activa · {statusInfo.label}
            </span>
          </div>
          <hr className="border-mist" />
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
            {cover ? (
              <img src={cover} alt="" className="h-[215px] w-full rounded-xl object-cover sm:w-[290px] sm:shrink-0" />
            ) : (
              <div className="grid h-[215px] w-full place-items-center rounded-xl bg-info-soft text-sm font-semibold text-muted sm:w-[290px] sm:shrink-0">
                Sin foto
              </div>
            )}
            <div className="flex flex-col gap-3 leading-snug">
              <h2 className="text-[22px] font-bold text-ink sm:text-[25px]">{reservation.experienceTitle}</h2>
              <p className="text-sm text-muted">{reservation.locationLabel}</p>
              <p className="text-[15px] text-ink">{formatDateReadable(reservation.activityDate)}</p>
              <p className="text-[15px] text-ink">
                {schedule} · {people} {people === 1 ? 'persona' : 'personas'}
              </p>
              <p className="text-lg font-bold text-ink">
                Total: {formatCurrency(reservation.total, reservation.currency)} {reservation.currency || 'USD'}
              </p>
              {reservation.paymentReference && (
                <p className="text-xs text-muted">
                  Pago demo · referencia <span className="font-mono">{reservation.paymentReference}</span>
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-xl bg-info-soft p-5 sm:p-7">
          <h2 className="text-[22px] font-bold leading-snug text-ink sm:text-2xl">Ahora, solo queda disfrutar</h2>
          <ul className="grid gap-6 md:grid-cols-3 md:gap-7">
            {nextSteps.map((step) => (
              <li key={step.title} className="flex flex-col gap-2.5">
                <img src={step.icon} alt="" className="size-6" />
                <p className="text-base font-bold leading-snug text-ink">{step.title}</p>
                <p className="text-[13px] leading-snug text-muted">{step.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/turista/mi-actividad/reservas"
            className="inline-flex h-[50px] items-center justify-center rounded-xl border border-brand bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-dark"
          >
            Ver Mis Reservas
          </Link>
          <Link
            to="/experiencias"
            className="inline-flex h-[50px] items-center justify-center rounded-xl border border-mist bg-surface px-5 text-[15px] font-semibold text-ink hover:bg-canvas"
          >
            Seguir explorando
          </Link>
        </div>

        {reservation.contactPhone && (
          <p className="text-center text-xs text-muted">
            ¿Necesitas ayuda con tu reserva? Escríbenos o llama al {reservation.contactPhone}.
          </p>
        )}
      </div>
    </div>
  )
}

export default ReservationConfirmation
