import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Pill from '../../components/admin/Pill.jsx'
import {
  cancelReservation,
  completeReservation,
  confirmReservation,
  createInPersonReservation,
  getMyAvailabilities,
  getOperatorReservations,
  rejectReservation,
} from '../../lib/bookingApi.js'
import { extractApiError, getMyExperiences } from '../../lib/catalogApi.js'
import {
  formatCurrency,
  formatDateReadable,
  paymentStatusMeta,
  reservationStatusMeta,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const filterOptions = [
  { value: '', label: 'Estado: todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'PENDIENTE_DECISION', label: 'Pendiente de decisión' },
  { value: 'COMPLETADA', label: 'Completadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
  { value: 'RECHAZADA', label: 'Rechazadas' },
]

function OperatorReservations() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorBanner, setErrorBanner] = useState('')
  const [busyId, setBusyId] = useState('')

  // Modal reserva presencial (RF-O12 / RN-19)
  const [showInPersonModal, setShowInPersonModal] = useState(false)
  const [experiences, setExperiences] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [inPersonForm, setInPersonForm] = useState({
    experienceId: '',
    availabilityId: '',
    peopleCount: '1',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialNotes: '',
  })
  const [submittingInPerson, setSubmittingInPerson] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  function loadReservations() {
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let cancelled = false
    async function fetchItems() {
      try {
        const response = await getOperatorReservations({
          pageNumber: 1,
          pageSize: 100,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        })
        if (!cancelled) {
          setErrorBanner('')
          setReservations(response?.data ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          setErrorBanner(extractApiError(error, 'No se pudieron cargar las reservas.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    return () => {
      cancelled = true
    }
  }, [statusFilter, search, reloadKey])

  async function openInPersonModal() {
    setShowInPersonModal(true)
    try {
      const [expRes, slots] = await Promise.all([
        getMyExperiences({ pageNumber: 1, pageSize: 100 }),
        getMyAvailabilities(),
      ])
      const expItems = expRes?.data ?? []
      const openSlots = (slots ?? []).filter((s) => s.status === 'ABIERTA' && s.availableSpots > 0)
      setExperiences(expItems)
      setAvailabilities(openSlots)
      const defaultExp = expItems[0]?.id ?? ''
      const defaultSlot = openSlots.find((s) => s.experienceId === defaultExp)?.id ?? ''
      setInPersonForm((prev) => ({
        ...prev,
        experienceId: defaultExp,
        availabilityId: defaultSlot,
      }))
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  async function handleCreateInPerson(event) {
    event.preventDefault()
    if (!inPersonForm.experienceId || !inPersonForm.availabilityId || !inPersonForm.contactName.trim() || !inPersonForm.contactPhone.trim()) {
      notify.error('Completa experiencia, sesión, nombre y teléfono del visitante.')
      return
    }
    setSubmittingInPerson(true)
    try {
      const created = await createInPersonReservation({
        experienceId: inPersonForm.experienceId,
        availabilityId: inPersonForm.availabilityId,
        peopleCount: Number(inPersonForm.peopleCount || 1),
        contactName: inPersonForm.contactName.trim(),
        contactPhone: inPersonForm.contactPhone.trim(),
        contactEmail: inPersonForm.contactEmail.trim() || null,
        specialNotes: inPersonForm.specialNotes.trim() || null,
      })
      notify.success(`Reserva presencial ${created.reservationCode} registrada.`)
      setShowInPersonModal(false)
      setInPersonForm({
        experienceId: '',
        availabilityId: '',
        peopleCount: '1',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        specialNotes: '',
      })
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setSubmittingInPerson(false)
    }
  }

  async function handleConfirm(res) {
    setBusyId(res.id)
    try {
      await confirmReservation(res.id)
      notify.success(`Reserva ${res.reservationCode} confirmada.`)
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  async function handleReject(res) {
    const reason = window.prompt(
      `Motivo para rechazar la reserva ${res.reservationCode} (generará reembolso automático del 100 %):`,
      'Sin guía disponible para este horario',
    )
    if (!reason || !reason.trim()) return
    setBusyId(res.id)
    try {
      const updated = await rejectReservation(res.id, reason.trim())
      notify.success(
        `Reserva rechazada. Ticket de reembolso 100 %: ${updated.refund?.refundCode ?? ''}`,
      )
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  async function handleComplete(res) {
    setBusyId(res.id)
    try {
      await completeReservation(res.id)
      notify.success(`Reserva ${res.reservationCode} marcada como completada.`)
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  async function handleOperatorCancel(res) {
    const reason = window.prompt(
      `Motivo para cancelar la reserva ${res.reservationCode} (reembolso del 100 % al visitante):`,
      'Cancelación operativa',
    )
    if (reason === null) return
    setBusyId(res.id)
    try {
      const updated = await cancelReservation(res.id, reason)
      notify.success(
        `Reserva cancelada. Ticket de reembolso: ${updated.refund?.refundCode ?? ''}`,
      )
      await loadReservations()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  const matchingSlots = availabilities.filter((s) => s.experienceId === inPersonForm.experienceId)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Gestión de reservas</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Reservas recibidas</h1>
          <p className="mt-1 text-sm text-muted">
            Confirma, rechaza, completa, cancela o registra reservas presenciales con control de cupos.
          </p>
        </div>
        <button
          type="button"
          onClick={openInPersonModal}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          + Reserva presencial
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterSelect
          label="Filtrar reservas por estado"
          options={filterOptions}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-h-12 md:w-56"
        />

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar código, visitante o experiencia..."
          aria-label="Buscar reservas"
          className="w-full rounded-xl border border-mist bg-surface px-3.5 py-2 text-sm text-ink sm:w-72"
        />
      </div>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl border border-mist bg-surface" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-surface p-12 text-center text-sm text-muted">
          No se encontraron reservas con los criterios actuales.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const st = reservationStatusMeta[res.status] ?? { label: res.status, tone: 'neutral' }
            const pay = paymentStatusMeta[res.paymentStatus] ?? { label: res.paymentStatus, tone: 'neutral' }
            const isBusy = busyId === res.id

            return (
              <article key={res.id} className="rounded-2xl border border-mist bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">
                        {res.reservationCode}
                      </span>
                      <Pill tone={st.tone}>{st.label}</Pill>
                      <Pill tone={pay.tone}>{pay.label}</Pill>
                      <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                        {res.source}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-ink">{res.experienceTitle}</h2>
                    <p className="text-sm text-muted">
                      <strong className="text-ink">{res.contactName}</strong>
                      {res.contactEmail ? ` · ${res.contactEmail}` : ''}
                      {res.contactPhone ? ` · ${res.contactPhone}` : ''}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateReadable(res.activityDate)} · {res.startTime} · {res.peopleCount}{' '}
                      {res.peopleCount === 1 ? 'persona' : 'personas'} ·{' '}
                      <strong className="text-ink">{formatCurrency(res.total, res.currency)}</strong>
                    </p>
                    {res.specialNotes && (
                      <p className="text-xs italic text-muted">Nota: {res.specialNotes}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {res.status === 'PENDIENTE' && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleConfirm(res)}
                          className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReject(res)}
                          className="rounded-full border border-danger/40 px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {res.status === 'CONFIRMADA' && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleComplete(res)}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Completar
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleOperatorCancel(res)}
                          className="rounded-full border border-danger/40 px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft disabled:opacity-50"
                        >
                          Cancelar (100 %)
                        </button>
                      </>
                    )}
                    {res.refund && (
                      <Link
                        to={`/operador/reservas/reembolso/${res.refund.refundCode}`}
                        className="rounded-full border border-brand px-3.5 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white"
                      >
                        Ticket {res.refund.refundCode}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modal reserva presencial */}
      {showInPersonModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Registrar reserva presencial"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <form
            onSubmit={handleCreateInPerson}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-surface p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-ink">Nueva reserva presencial (RF-O12)</h2>
            <p className="text-xs text-muted">
              Descuenta cupos en tiempo real y queda confirmada de inmediato.
            </p>

            <div>
              <label htmlFor="ip-exp" className="mb-1 block text-xs font-semibold text-muted">
                Experiencia *
              </label>
              <select
                id="ip-exp"
                required
                value={inPersonForm.experienceId}
                onChange={(e) => {
                  const expId = e.target.value
                  const firstSlot = availabilities.find((s) => s.experienceId === expId)?.id ?? ''
                  setInPersonForm((prev) => ({ ...prev, experienceId: expId, availabilityId: firstSlot }))
                }}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option value="">Selecciona una experiencia</option>
                {experiences.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ip-slot" className="mb-1 block text-xs font-semibold text-muted">
                Sesión disponible *
              </label>
              <select
                id="ip-slot"
                required
                value={inPersonForm.availabilityId}
                onChange={(e) => setInPersonForm((prev) => ({ ...prev, availabilityId: e.target.value }))}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              >
                <option value="">Selecciona fecha y hora</option>
                {matchingSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.date} · {slot.startTime} ({slot.availableSpots} cupos · ${slot.effectivePrice})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ip-name" className="mb-1 block text-xs font-semibold text-muted">
                  Nombre del visitante *
                </label>
                <input
                  id="ip-name"
                  type="text"
                  required
                  value={inPersonForm.contactName}
                  onChange={(e) => setInPersonForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="ip-phone" className="mb-1 block text-xs font-semibold text-muted">
                  Teléfono *
                </label>
                <input
                  id="ip-phone"
                  type="tel"
                  required
                  value={inPersonForm.contactPhone}
                  onChange={(e) => setInPersonForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ip-people" className="mb-1 block text-xs font-semibold text-muted">
                  Personas *
                </label>
                <input
                  id="ip-people"
                  type="number"
                  min="1"
                  required
                  value={inPersonForm.peopleCount}
                  onChange={(e) => setInPersonForm((prev) => ({ ...prev, peopleCount: e.target.value }))}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="ip-email" className="mb-1 block text-xs font-semibold text-muted">
                  Correo (opcional)
                </label>
                <input
                  id="ip-email"
                  type="email"
                  value={inPersonForm.contactEmail}
                  onChange={(e) => setInPersonForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInPersonModal(false)}
                className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingInPerson}
                className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {submittingInPerson ? 'Registrando...' : 'Registrar reserva'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default OperatorReservations
