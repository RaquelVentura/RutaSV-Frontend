import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import {
  cancelReservation,
  getCancelPreview,
  getIncidentOptions,
  getMyReservations,
  resolveIncident,
} from '../../lib/bookingApi.js'
import { extractApiError, resolveAssetUrl } from '../../lib/catalogApi.js'
import {
  formatCurrency,
  formatDateReadable,
  formatDateTimeReadable,
  paymentStatusMeta,
  refundStatusMeta,
  reservationStatusMeta,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const filterTabs = [
  { key: '', label: 'Todas' },
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'CONFIRMADA', label: 'Confirmadas' },
  { key: 'PENDIENTE_DECISION', label: 'Acción requerida' },
  { key: 'COMPLETADA', label: 'Completadas' },
  { key: 'CANCELADA', label: 'Canceladas' },
]

function ActivityReservations() {
  const [statusFilter, setStatusFilter] = useState('')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [expandedHistoryId, setExpandedHistoryId] = useState('')

  // Modal de cancelación con cálculo de reembolso (RN-07 / RN-08)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelPreview, setCancelPreview] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  // Modal de resolución de incidencia (RN-21)
  const [incidentTarget, setIncidentTarget] = useState(null)
  const [incidentOptions, setIncidentOptions] = useState([])
  const [selectedNewSlotId, setSelectedNewSlotId] = useState('')
  const [incidentLoading, setIncidentLoading] = useState(false)
  const [incidentSubmitting, setIncidentSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  function loadReservations() {
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let cancelled = false
    async function fetchItems() {
      try {
        const response = await getMyReservations({
          pageNumber: 1,
          pageSize: 50,
          status: statusFilter || undefined,
        })
        if (!cancelled) {
          setErrorMessage('')
          setReservations(response?.data ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se pudo cargar tu historial de reservas.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    return () => {
      cancelled = true
    }
  }, [statusFilter, reloadKey])

  async function openCancelModal(reservation) {
    setCancelTarget(reservation)
    setCancelPreview(null)
    setCancelReason('')
    try {
      const preview = await getCancelPreview(reservation.id)
      setCancelPreview(preview)
    } catch (error) {
      notify.error(extractApiError(error, 'No se pudo consultar la política de cancelación.').message)
      setCancelTarget(null)
    }
  }

  async function confirmCancellation() {
    if (!cancelTarget) return
    setCancelSubmitting(true)
    try {
      const updated = await cancelReservation(cancelTarget.id, cancelReason)
      notify.success(
        updated.refund
          ? `Reserva cancelada. Ticket de reembolso: ${updated.refund.refundCode} (${updated.refund.percentage} %).`
          : 'Reserva cancelada y cupos liberados.',
      )
      setCancelTarget(null)
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error, 'No se pudo cancelar la reserva.').message)
    } finally {
      setCancelSubmitting(false)
    }
  }

  async function openIncidentModal(reservation) {
    setIncidentTarget(reservation)
    setIncidentOptions([])
    setSelectedNewSlotId('')
    setIncidentLoading(true)
    try {
      const opts = await getIncidentOptions(reservation.id)
      setIncidentOptions(opts)
      setSelectedNewSlotId(opts[0]?.id ?? '')
    } catch (error) {
      notify.error(extractApiError(error, 'No se pudieron cargar opciones de reagendamiento.').message)
    } finally {
      setIncidentLoading(false)
    }
  }

  async function handleResolveIncident(action) {
    if (!incidentTarget) return
    if (action === 'REAGENDAR' && !selectedNewSlotId) {
      notify.error('Selecciona una fecha disponible para reagendar.')
      return
    }
    setIncidentSubmitting(true)
    try {
      const updated = await resolveIncident(incidentTarget.id, {
        action,
        newAvailabilityId: action === 'REAGENDAR' ? selectedNewSlotId : null,
      })
      notify.success(
        action === 'REAGENDAR'
          ? `Reserva ${updated.reservationCode} reagendada correctamente.`
          : `Reembolso del 100 % solicitado (${updated.refund?.refundCode ?? ''}).`,
      )
      setIncidentTarget(null)
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error, 'No se pudo resolver la incidencia.').message)
    } finally {
      setIncidentSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Mi actividad</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Historial de reservas</h1>
          <p className="mt-1 text-sm text-muted">
            Consulta el estado de tus reservas, comprobantes, reembolsos y reagendamientos.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/turista/mi-actividad/favoritos"
            className="rounded-full border border-mist bg-surface px-4 py-2 text-sm font-semibold text-ink hover:border-brand"
          >
            Ver favoritos
          </Link>
          <Link
            to="/experiencias"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Explorar experiencias
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key || 'all'}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              statusFilter === tab.key
                ? 'bg-brand text-white'
                : 'border border-mist bg-surface text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-mist bg-surface" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-surface p-12 text-center">
          <p className="text-lg font-bold text-ink">No tienes reservas en esta vista</p>
          <p className="mt-1 text-sm text-muted">
            Explora nuestras experiencias en El Salvador y reserva tu próxima aventura.
          </p>
          <Link
            to="/experiencias"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const st = reservationStatusMeta[res.status] ?? { label: res.status, tone: 'neutral' }
            const pay = paymentStatusMeta[res.paymentStatus] ?? { label: res.paymentStatus, tone: 'neutral' }
            const canCancel = res.status === 'PENDIENTE' || res.status === 'CONFIRMADA'
            const isDecisionPending = res.status === 'PENDIENTE_DECISION'
            const isExpanded = expandedHistoryId === res.id

            return (
              <article
                key={res.id}
                className="rounded-2xl border border-mist bg-surface p-5 shadow-xs"
              >
                <div className="flex flex-wrap gap-5">
                  {res.experienceCoverImageUrl && (
                    <img
                      src={resolveAssetUrl(res.experienceCoverImageUrl)}
                      alt={res.experienceTitle}
                      className="h-28 w-40 shrink-0 rounded-xl object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">
                        {res.reservationCode}
                      </span>
                      <Pill tone={st.tone}>{st.label}</Pill>
                      <Pill tone={pay.tone}>{pay.label}</Pill>
                    </div>

                    <h2 className="text-lg font-bold text-ink">
                      <Link to={`/experiencias/${res.experienceSlug}`} className="hover:text-brand">
                        {res.experienceTitle}
                      </Link>
                    </h2>

                    <p className="text-sm text-muted">
                      {formatDateReadable(res.activityDate)} · {res.startTime}
                      {res.endTime ? ` – ${res.endTime}` : ''} · {res.peopleCount}{' '}
                      {res.peopleCount === 1 ? 'persona' : 'personas'} ·{' '}
                      <strong className="text-ink">{formatCurrency(res.total, res.currency)}</strong>
                    </p>

                    {res.refund && (
                      <div className="rounded-xl border border-brand/20 bg-info-soft p-3 text-xs text-ink">
                        <span className="font-bold">Reembolso {res.refund.refundCode}:</span>{' '}
                        {res.refund.percentage} % ({formatCurrency(res.refund.amount, res.refund.currency)}) —{' '}
                        <strong>{refundStatusMeta[res.refund.status]?.label ?? res.refund.status}</strong>
                      </div>
                    )}

                    {isDecisionPending && res.activeIncident && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
                        <p className="font-bold">
                          Acción requerida (RN-21): la sesión o experiencia fue modificada/cancelada.
                        </p>
                        <p className="mt-1">
                          Tienes hasta el{' '}
                          <strong>{formatDateTimeReadable(res.activeIncident.decisionDeadline)}</strong> para
                          elegir entre reagendar al mismo precio o recibir reembolso del 100 %.
                        </p>
                        <button
                          type="button"
                          onClick={() => openIncidentModal(res)}
                          className="mt-2.5 rounded-full bg-amber-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-800"
                        >
                          Elegir reagendar o reembolso 100 %
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        to={`/turista/reservar/confirmacion?id=${res.id}`}
                        state={{ reservation: res }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Ver comprobante
                      </Link>

                      <button
                        type="button"
                        onClick={() => setExpandedHistoryId(isExpanded ? '' : res.id)}
                        className="text-xs font-semibold text-muted hover:text-ink"
                      >
                        {isExpanded ? 'Ocultar historial' : `Ver historial (${res.history?.length ?? 0})`}
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(res)}
                          className="ml-auto rounded-full border border-danger/40 px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                        >
                          Cancelar reserva
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && res.history?.length > 0 && (
                  <div className="mt-4 border-t border-mist pt-4">
                    <p className="text-xs font-bold uppercase text-muted">Bitácora de estados</p>
                    <ul className="mt-2 space-y-2 text-xs">
                      {res.history.map((h) => (
                        <li key={h.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-canvas px-3 py-2">
                          <span>
                            <strong>{h.newStatus}</strong>
                            {h.notes ? ` — ${h.notes}` : ''}
                          </span>
                          <span className="text-muted">{formatDateTimeReadable(h.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* Modal de cancelación */}
      {cancelTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cancelar reserva"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold text-ink">
              Cancelar reserva {cancelTarget.reservationCode}
            </h2>

            {!cancelPreview ? (
              <p className="text-sm text-muted">Calculando política de reembolso...</p>
            ) : (
              <>
                <div className="rounded-xl bg-info-soft p-4 text-sm">
                  <p className="font-semibold text-ink">{cancelPreview.policyDescription}</p>
                  <p className="mt-2 text-xs text-muted">
                    Reembolso estimado:{' '}
                    <strong className="text-brand">
                      {cancelPreview.refundPercentage} % (
                      {formatCurrency(cancelPreview.refundAmount, cancelPreview.currency)})
                    </strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="cancel-reason" className="mb-1 block text-xs font-semibold text-muted">
                    Motivo de cancelación (opcional)
                  </label>
                  <textarea
                    id="cancel-reason"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ej. Cambio de itinerario"
                    className="w-full rounded-xl border border-mist bg-canvas p-3 text-sm text-ink"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelTarget(null)}
                    className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink"
                  >
                    Mantener reserva
                  </button>
                  <button
                    type="button"
                    disabled={!cancelPreview.canCancel || cancelSubmitting}
                    onClick={confirmCancellation}
                    className="rounded-full bg-danger px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {cancelSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de decisión RN-21 */}
      {incidentTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Resolver incidencia de reserva"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <div className="w-full max-w-lg space-y-4 rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold text-ink">
              Decide qué hacer con tu reserva {incidentTarget.reservationCode}
            </h2>
            <p className="text-sm text-muted">
              Puedes reagendar en otra sesión disponible del mismo operador con igual precio unitario (
              {formatCurrency(incidentTarget.unitPrice, incidentTarget.currency)}) o solicitar reembolso del 100 %.
            </p>

            {incidentLoading ? (
              <p className="text-sm text-muted">Buscando horarios compatibles...</p>
            ) : incidentOptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mist bg-canvas p-4 text-sm text-muted">
                No hay sesiones alternativas disponibles al mismo precio en este momento. Puedes solicitar tu reembolso del 100 %.
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {incidentOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
                      selectedNewSlotId === opt.id
                        ? 'border-brand bg-info-soft'
                        : 'border-mist bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="incidentSlot"
                        checked={selectedNewSlotId === opt.id}
                        onChange={() => setSelectedNewSlotId(opt.id)}
                      />
                      <div>
                        <p className="font-semibold text-ink">{opt.experienceTitle}</p>
                        <p className="text-xs text-muted">
                          {formatDateReadable(opt.date)} · {opt.startTime} ({opt.availableSpots} cupos)
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-brand">
                      {formatCurrency(opt.effectivePrice, opt.currency)}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncidentTarget(null)}
                className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={incidentSubmitting}
                onClick={() => handleResolveIncident('REEMBOLSAR')}
                className="rounded-full border border-danger px-4 py-2 text-sm font-bold text-danger hover:bg-danger-soft disabled:opacity-50"
              >
                Pedir reembolso 100 %
              </button>
              <button
                type="button"
                disabled={incidentSubmitting || !selectedNewSlotId}
                onClick={() => handleResolveIncident('REAGENDAR')}
                className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Reagendar selección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityReservations
