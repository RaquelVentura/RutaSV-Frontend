import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import {
  cancelAvailability,
  createAvailability,
  createExperienceSchedule,
  deleteExperienceSchedule,
  generateAvailabilities,
  getExperienceSchedules,
  getMyAvailabilities,
  updateAvailability,
} from '../../lib/bookingApi.js'
import { extractApiError, getMyExperiences } from '../../lib/catalogApi.js'
import {
  availabilityStatusMeta,
  dayOfWeekLabels,
  formatCurrency,
  formatDateReadable,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function OperatorAvailability() {
  const [searchParams] = useSearchParams()
  const initialExpId = searchParams.get('experiencia') || ''

  const [experiences, setExperiences] = useState([])
  const [selectedExpId, setSelectedExpId] = useState(initialExpId)
  const [availabilities, setAvailabilities] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorBanner, setErrorBanner] = useState('')

  // Formulario nueva sesión
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')
  const [totalCapacity, setTotalCapacity] = useState('10')
  const [specialPrice, setSpecialPrice] = useState('')
  const [savingSlot, setSavingSlot] = useState(false)

  // Plantilla semanal y generador
  const [schedDay, setSchedDay] = useState('6')
  const [schedStart, setSchedStart] = useState('09:00')
  const [schedCap, setSchedCap] = useState('10')
  const [genFrom, setGenFrom] = useState('')
  const [genTo, setGenTo] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  function loadData() {
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      try {
        const [expRes, availList] = await Promise.all([
          getMyExperiences({ pageNumber: 1, pageSize: 100 }),
          getMyAvailabilities({ experienceId: selectedExpId || undefined }),
        ])
        if (cancelled) return
        const expItems = expRes?.data ?? []
        setErrorBanner('')
        setExperiences(expItems)
        setAvailabilities(availList ?? [])

        const activeExpId = selectedExpId || expItems[0]?.id || ''
        if (!selectedExpId && activeExpId) {
          setSelectedExpId(activeExpId)
        }
        if (activeExpId) {
          const scheds = await getExperienceSchedules(activeExpId)
          if (!cancelled) setSchedules(scheds)
        } else {
          setSchedules([])
        }
      } catch (error) {
        if (!cancelled) {
          setErrorBanner(extractApiError(error, 'No se pudo cargar la disponibilidad.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => {
      cancelled = true
    }
  }, [selectedExpId, reloadKey])

  async function handleCreateSlot(event) {
    event.preventDefault()
    if (!selectedExpId || !date || !startTime) {
      notify.error('Selecciona experiencia, fecha y hora de inicio.')
      return
    }
    setSavingSlot(true)
    try {
      await createAvailability(selectedExpId, {
        date,
        startTime,
        endTime: endTime || null,
        totalCapacity: Number(totalCapacity || 10),
        specialPrice: specialPrice !== '' ? Number(specialPrice) : null,
      })
      notify.success('Sesión creada correctamente.')
      setSpecialPrice('')
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setSavingSlot(false)
    }
  }

  async function handleToggleBlock(slot) {
    const nextStatus = slot.status === 'BLOQUEADA' ? 'ABIERTA' : 'BLOQUEADA'
    try {
      await updateAvailability(slot.id, {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        totalCapacity: slot.totalCapacity,
        specialPrice: slot.specialPrice,
        status: nextStatus,
      })
      notify.success(nextStatus === 'BLOQUEADA' ? 'Sesión bloqueada.' : 'Sesión reabierta.')
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  async function handleCancelSlot(slot) {
    const reason = window.prompt(
      `Motivo para cancelar la sesión del ${slot.date} ${slot.startTime} (si hay reservas activas pasarán a PENDIENTE_DECISION según RN-21):`,
      'Clima adverso',
    )
    if (reason === null) return
    try {
      await cancelAvailability(slot.id, reason)
      notify.success('Sesión cancelada y visitantes afectados notificados.')
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  async function handleAddSchedule(event) {
    event.preventDefault()
    if (!selectedExpId) return
    try {
      await createExperienceSchedule(selectedExpId, {
        dayOfWeek: Number(schedDay),
        startTime: schedStart,
        endTime: null,
        defaultCapacity: Number(schedCap || 10),
      })
      notify.success('Horario semanal agregado.')
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  async function handleDeleteSchedule(scheduleId) {
    try {
      await deleteExperienceSchedule(scheduleId)
      notify.success('Horario eliminado.')
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  async function handleGenerateSlots(event) {
    event.preventDefault()
    if (!selectedExpId || !genFrom || !genTo) {
      notify.error('Indica fecha inicio y fecha fin para generar sesiones.')
      return
    }
    try {
      const created = await generateAvailabilities(selectedExpId, {
        fromDate: genFrom,
        toDate: genTo,
      })
      notify.success(`Se generaron ${created.length} nueva(s) sesión(es).`)
      await loadData()
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Agenda y cupos</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Horarios y disponibilidad</h1>
          <p className="mt-1 text-sm text-muted">
            Administra fechas disponibles, cupos máximos, tarifas especiales y plantillas semanales.
          </p>
        </div>

        <select
          aria-label="Filtrar por experiencia"
          value={selectedExpId}
          onChange={(e) => setSelectedExpId(e.target.value)}
          className="rounded-xl border border-mist bg-surface px-4 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="">Todas mis experiencias</option>
          {experiences.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.title}
            </option>
          ))}
        </select>
      </header>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crear sesión puntual */}
        <form
          onSubmit={handleCreateSlot}
          className="space-y-4 rounded-2xl border border-mist bg-surface p-6"
        >
          <h2 className="text-lg font-bold text-ink">Agregar fecha / sesión individual</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="slot-date" className="mb-1 block text-xs font-semibold text-muted">
                Fecha *
              </label>
              <input
                id="slot-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="slot-start" className="mb-1 block text-xs font-semibold text-muted">
                Inicio *
              </label>
              <input
                id="slot-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="slot-end" className="mb-1 block text-xs font-semibold text-muted">
                Fin
              </label>
              <input
                id="slot-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="slot-cap" className="mb-1 block text-xs font-semibold text-muted">
                Cupo total *
              </label>
              <input
                id="slot-cap"
                type="number"
                min="1"
                required
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="slot-price" className="mb-1 block text-xs font-semibold text-muted">
                Precio especial USD (opcional)
              </label>
              <input
                id="slot-price"
                type="number"
                min="0"
                step="0.01"
                value={specialPrice}
                onChange={(e) => setSpecialPrice(e.target.value)}
                placeholder="Usa precio base si vacío"
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSlot || !selectedExpId}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {savingSlot ? 'Guardando...' : '+ Crear sesión'}
          </button>
        </form>

        {/* Plantillas semanales y generador */}
        <div className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
          <h2 className="text-lg font-bold text-ink">Plantillas semanales y generación masiva</h2>

          <form onSubmit={handleAddSchedule} className="grid gap-2 sm:grid-cols-4">
            <select
              value={schedDay}
              onChange={(e) => setSchedDay(e.target.value)}
              className="rounded-xl border border-mist bg-canvas px-2.5 py-2 text-xs text-ink"
            >
              {dayOfWeekLabels.map((label, idx) => (
                <option key={label} value={idx}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={schedStart}
              onChange={(e) => setSchedStart(e.target.value)}
              className="rounded-xl border border-mist bg-canvas px-2.5 py-2 text-xs text-ink"
            />
            <input
              type="number"
              min="1"
              value={schedCap}
              onChange={(e) => setSchedCap(e.target.value)}
              placeholder="Cupos"
              className="rounded-xl border border-mist bg-canvas px-2.5 py-2 text-xs text-ink"
            />
            <button
              type="submit"
              disabled={!selectedExpId}
              className="rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              + Plantilla
            </button>
          </form>

          {schedules.length > 0 && (
            <ul className="space-y-1.5 text-xs">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
                  <span>
                    <strong>{dayOfWeekLabels[s.dayOfWeek]}</strong> · {s.startTime} ({s.defaultCapacity} cupos)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="font-semibold text-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleGenerateSlots} className="grid gap-2 border-t border-mist pt-3 sm:grid-cols-3">
            <input
              type="date"
              value={genFrom}
              onChange={(e) => setGenFrom(e.target.value)}
              aria-label="Generar desde"
              className="rounded-xl border border-mist bg-canvas px-2.5 py-2 text-xs text-ink"
            />
            <input
              type="date"
              value={genTo}
              onChange={(e) => setGenTo(e.target.value)}
              aria-label="Generar hasta"
              className="rounded-xl border border-mist bg-canvas px-2.5 py-2 text-xs text-ink"
            />
            <button
              type="submit"
              disabled={!selectedExpId || schedules.length === 0}
              className="rounded-xl border border-brand px-3 py-2 text-xs font-bold text-brand hover:bg-brand hover:text-white disabled:opacity-40"
            >
              Generar fechas
            </button>
          </form>
        </div>
      </div>

      {/* Listado de sesiones */}
      <section className="rounded-2xl border border-mist bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">
          Sesiones programadas ({availabilities.length})
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Cargando sesiones...</p>
        ) : availabilities.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No hay sesiones creadas todavía. Agrega una fecha arriba para recibir reservas.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-mist text-xs uppercase text-muted">
                <tr>
                  <th className="py-2 pr-4">Experiencia</th>
                  <th className="py-2 pr-4">Fecha y hora</th>
                  <th className="py-2 pr-4">Ocupación</th>
                  <th className="py-2 pr-4">Tarifa</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {availabilities.map((slot) => {
                  const st = availabilityStatusMeta[slot.status] ?? { label: slot.status, tone: 'neutral' }
                  return (
                    <tr key={slot.id}>
                      <td className="py-3 pr-4 font-semibold text-ink">{slot.experienceTitle}</td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDateReadable(slot.date)} · {slot.startTime}
                        {slot.endTime ? ` – ${slot.endTime}` : ''}
                      </td>
                      <td className="py-3 pr-4 text-ink">
                        {slot.reservedCapacity} / {slot.totalCapacity} ({slot.availableSpots} libres)
                      </td>
                      <td className="py-3 pr-4 font-semibold text-brand">
                        {formatCurrency(slot.effectivePrice, slot.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </td>
                      <td className="py-3">
                        {slot.status !== 'CANCELADA' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(slot)}
                              className="rounded-full border border-mist px-3 py-1 text-xs font-semibold text-ink hover:border-brand"
                            >
                              {slot.status === 'BLOQUEADA' ? 'Reabrir' : 'Bloquear'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelSlot(slot)}
                              className="rounded-full border border-danger/40 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger-soft"
                            >
                              Cancelar sesión
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default OperatorAvailability
