//panel de  historial dereservas

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Dialog from '../../components/admin/Dialog.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDateTime, refundPercentage } from './operatorData.js'
import { readOperatorCollection, saveOperatorCollection } from './operatorRepository.js'
import ReservationStatus from './ReservationStatus.jsx'

const filterOptions = [
  { value: 'Todas', label: 'Estado: todas' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Confirmada', label: 'Confirmada' },
  { value: 'Completada', label: 'Completada' },
  { value: 'Cancelada', label: 'Cancelada' },
  { value: 'Pendiente de decisión', label: 'Pendiente de decisión' },
]

const fieldClass =
  'min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

const cancelReasons = [
  'El viajero lo pidió',
  'Cambio de clima o seguridad',
  'Experiencia no disponible',
  'Otro motivo',
]

function isActive(reservation) {
  return (
    (reservation.status === 'Pendiente' || reservation.status === 'Confirmada') &&
    Boolean(reservation.startsAt) &&
    new Date(reservation.startsAt).getTime() > Date.now()
  )
}

function splitStart(startsAt) {
  // Fecha y hora locales para los campos del diálogo.
  const date = new Date(startsAt)
  const pad = (value) => String(value).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

function ModifyDialog({ reservation, experience, sessions, onClose, onConfirm }) {
  const initial = splitStart(reservation.startsAt)
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [guests, setGuests] = useState(String(reservation.guests))
  const [error, setError] = useState('')

  const session = sessions.find(
    (row) => String(row.experienceId) === String(reservation.experienceId) && row.date === date && row.time === time,
  )
  const sameSession = date === initial.date && time === initial.time
  // Cupo en vivo: los espacios de la sesión elegida; si es la misma sesión, los de esta reserva cuentan como libres.
  const spots = session ? session.available + (sameSession ? reservation.guests : 0) : null
  const maxGuests = experience?.capacity ?? 20

  function handleSubmit(event) {
    event.preventDefault()
    const count = Number(guests)
    if (!date || !time) return setError('Elige la fecha y la hora.')
    if (!Number.isInteger(count) || count < 1) return setError('Indica al menos 1 viajero.')
    if (count > maxGuests) return setError(`Esta experiencia admite hasta ${maxGuests} personas.`)
    const startsAt = new Date(`${date}T${time}:00`)
    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      return setError('La nueva fecha debe ser futura.')
    }
    if (session && count > spots) return setError(`Solo hay ${spots} ${spots === 1 ? 'cupo' : 'cupos'} en esa sesión.`)
    return onConfirm({ date, time, guests: count, startsAt: startsAt.toISOString() })
  }

  return (
    <Dialog title="Modificar reserva" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4">
        <p className="text-sm text-muted">
          {reservation.guest} · {reservation.experience}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="modify-date">
            Fecha
            <input id="modify-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setError('') }} className={fieldClass} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="modify-time">
            Hora
            <input id="modify-time" type="time" value={time} onChange={(event) => { setTime(event.target.value); setError('') }} className={fieldClass} />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="modify-guests">
          Viajeros
          <input id="modify-guests" type="number" min="1" max={maxGuests} value={guests} onChange={(event) => { setGuests(event.target.value); setError('') }} className={fieldClass} />
        </label>
        <p className="rounded-xl bg-info-soft px-3 py-2 text-xs text-ink" aria-live="polite">
          {session
            ? `Cupos disponibles en esa sesión: ${spots}.`
            : 'No hay una sesión cargada en esa fecha y hora: no se puede verificar el cupo.'}
        </p>
        <p className="text-xs text-muted">
          Nuevo total: {formatCurrency((experience?.price ?? 0) * (Number(guests) || 0))}
        </p>
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
            Cancelar
          </button>
          <button type="submit" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
            Guardar cambios
          </button>
        </div>
      </form>
    </Dialog>
  )
}

function CancelDialog({ reservation, total, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const percent = refundPercentage(reservation.startsAt)
  const amount = (total * percent) / 100

  function handleSubmit(event) {
    event.preventDefault()
    if (!reason) return setError('Elige el motivo de la cancelación.')
    if (reason === 'Otro motivo' && !detail.trim()) return setError('Cuéntanos el motivo.')
    return onConfirm({ reason: reason === 'Otro motivo' ? detail.trim() : reason, percent, amount })
  }

  return (
    <Dialog title="Cancelar reserva" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4">
        <p className="text-sm text-muted">
          {reservation.guest} · {reservation.experience} · {formatDateTime(reservation.startsAt)}
        </p>
        <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="cancel-reason">
          Motivo
          <select id="cancel-reason" value={reason} onChange={(event) => { setReason(event.target.value); setError('') }} className={fieldClass}>
            <option value="">Selecciona un motivo</option>
            {cancelReasons.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        {reason === 'Otro motivo' && (
          <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="cancel-detail">
            Detalle del motivo
            <textarea id="cancel-detail" rows="3" value={detail} onChange={(event) => { setDetail(event.target.value); setError('') }} className={`${fieldClass} py-3`} />
          </label>
        )}
        <p className={`rounded-xl px-3 py-2 text-sm ${percent === 0 ? 'bg-danger-soft text-danger' : 'bg-info-soft text-ink'}`}>
          {percent === 0
            ? 'Faltan menos de 24 h: según la política, esta cancelación no genera reembolso.'
            : `Reembolso del ${percent} % según la política (${percent === 100 ? '48 h o más' : 'de 24 h a menos de 48 h'} antes): ${formatCurrency(amount)}.`}
        </p>
        <p className="text-xs text-muted">El cupo se libera de inmediato y se avisa al viajero.</p>
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
            Volver
          </button>
          <button type="submit" className="rounded-xl bg-danger px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
            Cancelar reserva
          </button>
        </div>
      </form>
    </Dialog>
  )
}

function OperatorReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState(() => readOperatorCollection(user, 'reservations'))
  const experiences = useMemo(() => readOperatorCollection(user, 'experiences'), [user])
  const [sessions, setSessions] = useState(() => readOperatorCollection(user, 'availability'))
  const [filter, setFilter] = useState('Todas')
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState(null)

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

  function experienceOf(reservation) {
    return experiences.find((item) => String(item.id) === String(reservation.experienceId))
  }

  function totalOf(reservation) {
    return reservation.total ?? (experienceOf(reservation)?.price ?? 0) * reservation.guests
  }

  function sessionKey(reservation, date, time) {
    return sessions.find(
      (row) => String(row.experienceId) === String(reservation.experienceId) && row.date === date && row.time === time,
    )
  }

  function persist(nextReservations, nextSessions, text, nextRefunds) {
    try {
      saveOperatorCollection(user, 'reservations', nextReservations)
      if (nextSessions) saveOperatorCollection(user, 'availability', nextSessions)
      if (nextRefunds) saveOperatorCollection(user, 'refunds', nextRefunds)
      setReservations(nextReservations)
      if (nextSessions) setSessions(nextSessions)
      setNotice({ type: 'success', text })
    } catch (error) {
      setNotice({ type: 'error', text: `No se pudo guardar el cambio: ${error.message}` })
    }
    setDialog(null)
  }

  function confirmModify(reservation, change) {
    const old = splitStart(reservation.startsAt)
    let nextSessions = sessions
    const oldSession = sessionKey(reservation, old.date, old.time)
    const newSession = sessionKey(reservation, change.date, change.time)
    if (oldSession || newSession) {
      nextSessions = sessions.map((row) => {
        if (row === oldSession) return { ...row, available: Math.min(row.capacity, row.available + reservation.guests) }
        return row
      })
      nextSessions = nextSessions.map((row) =>
        newSession && row.id === newSession.id ? { ...row, available: Math.max(0, row.available - change.guests) } : row,
      )
    }
    const price = experienceOf(reservation)?.price
    const updated = reservations.map((item) =>
      item.id === reservation.id
        ? {
            ...item,
            startsAt: change.startsAt,
            date: formatDateTime(change.startsAt),
            guests: change.guests,
            ...(price ? { total: price * change.guests } : {}),
          }
        : item,
    )
    persist(updated, nextSessions, `Reserva ${reservation.id} modificada. Se avisó al viajero.`)
  }

  function confirmCancel(reservation, result) {
    const old = splitStart(reservation.startsAt)
    const session = sessionKey(reservation, old.date, old.time)
    const nextSessions = session
      ? sessions.map((row) =>
          row.id === session.id ? { ...row, available: Math.min(row.capacity, row.available + reservation.guests) } : row,
        )
      : null
    const refunds = readOperatorCollection(user, 'refunds')
    let refund = null
    if (result.percent > 0) {
      refund = {
        id: `REF-${new Date().getFullYear()}-${String(refunds.length + 1).padStart(6, '0')}`,
        reservationId: reservation.id,
        guest: reservation.guest,
        experience: reservation.experience,
        percent: result.percent,
        amount: result.amount,
        total: totalOf(reservation),
        status: 'En proceso',
        createdAt: new Date().toISOString(),
      }
    }
    const updated = reservations.map((item) =>
      item.id === reservation.id
        ? { ...item, status: 'Cancelada', cancelReason: result.reason, refundId: refund?.id }
        : item,
    )
    persist(
      updated,
      nextSessions,
      refund
        ? `Reserva ${reservation.id} cancelada. Se generó el ticket ${refund.id} por ${formatCurrency(refund.amount)}.`
        : `Reserva ${reservation.id} cancelada sin reembolso. El cupo quedó libre.`,
      refund ? [...refunds, refund] : null,
    )
  }

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

      {notice && (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-red-900/15 bg-red-50 text-red-900'
              : 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
          }`}
        >
          {notice.text}
        </p>
      )}

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
        <FilterSelect
          label="Filtrar reservas por estado"
          options={filterOptions}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="min-h-12 md:w-56"
        />
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
              {reservation.status === 'Cancelada' && reservation.cancelReason && (
                <p className="mt-1 text-xs text-muted">Motivo: {reservation.cancelReason}</p>
              )}
              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs text-muted">
                <span>{reservation.startsAt ? formatDateTime(reservation.startsAt) : reservation.date}</span>
                <span>{reservation.guests} viajeros</span>
              </div>
              {isActive(reservation) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDialog({ type: 'modify', reservation })}
                    aria-label={`Modificar reserva ${reservation.id}`}
                    className="min-h-10 flex-1 rounded-xl border border-black/15 px-3 text-sm font-semibold text-brand hover:border-brand hover:bg-info-soft"
                  >
                    Modificar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog({ type: 'cancel', reservation })}
                    aria-label={`Cancelar reserva ${reservation.id}`}
                    className="min-h-10 flex-1 rounded-xl border border-black/15 px-3 text-sm font-semibold text-danger hover:bg-danger-soft"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {reservation.refundId && (
                <Link
                  to={`/operador/reservas/reembolso/${reservation.refundId}`}
                  className="mt-4 text-sm font-semibold text-brand hover:underline"
                >
                  Ver ticket de reembolso {reservation.refundId}
                </Link>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-black/20 bg-white px-5 py-14 text-center lg:col-span-2 2xl:col-span-3">
            <p className="font-semibold text-ink">No hay reservas con estos criterios</p>
            <p className="mt-1 text-sm text-muted">Prueba con otro filtro o búsqueda.</p>
          </div>
        )}
      </section>

      {dialog?.type === 'modify' && (
        <ModifyDialog
          reservation={dialog.reservation}
          experience={experienceOf(dialog.reservation)}
          sessions={sessions}
          onClose={() => setDialog(null)}
          onConfirm={(change) => confirmModify(dialog.reservation, change)}
        />
      )}
      {dialog?.type === 'cancel' && (
        <CancelDialog
          reservation={dialog.reservation}
          total={totalOf(dialog.reservation)}
          onClose={() => setDialog(null)}
          onConfirm={(result) => confirmCancel(dialog.reservation, result)}
        />
      )}
    </div>
  )
}

export default OperatorReservations
