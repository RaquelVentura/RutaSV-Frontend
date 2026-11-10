//PANEL DE CUPOS DE EXPERIENCIAS

import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  readOperatorCollection,
  saveOperatorCollection,
} from './operatorRepository.js'

const fieldClass =
  'min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

function AvailabilityForm({ item, experiences, onCancel, onSave }) {
  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      date: String(formData.get('date')),
      time: String(formData.get('time')),
      experienceId: Number(formData.get('experienceId')),
      available: Number(formData.get('available')),
      capacity: Number(formData.get('capacity')),
    }

    if (values.available > values.capacity) {
      onSave(null, 'Los cupos disponibles no pueden superar la capacidad total.')
      return
    }
    onSave(values)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="grid gap-2 sm:col-span-2 lg:col-span-2">
        <label htmlFor="availability-form-experience" className="text-sm font-semibold text-ink">
          Experiencia
        </label>
        <select
          id="availability-form-experience"
          name="experienceId"
          required
          defaultValue={item?.experienceId ?? experiences[0]?.id ?? ''}
          className={fieldClass}
        >
          {experiences.map((experience) => (
            <option key={experience.id} value={experience.id}>{experience.title}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="availability-form-date" className="text-sm font-semibold text-ink">Día</label>
        <input id="availability-form-date" name="date" type="date" required defaultValue={item?.date ?? ''} className={fieldClass} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="availability-form-time" className="text-sm font-semibold text-ink">Hora</label>
        <input id="availability-form-time" name="time" type="time" required defaultValue={item?.time ?? ''} className={fieldClass} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:col-span-2">
        <label className="grid gap-2 text-sm font-semibold text-ink" htmlFor="availability-form-capacity">
          Capacidad total
          <input id="availability-form-capacity" name="capacity" type="number" min="1" required defaultValue={item?.capacity ?? ''} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink" htmlFor="availability-form-available">
          Cupos disponibles
          <input id="availability-form-available" name="available" type="number" min="0" required defaultValue={item?.available ?? ''} className={fieldClass} />
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-black/10 pt-4 sm:col-span-2 lg:col-span-5">
        <button type="button" onClick={onCancel} className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
          Cancelar
        </button>
        <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">
          Guardar cupos
        </button>
      </div>
    </form>
  )
}

function OperatorAvailability() {
  const { user } = useAuth()
  const { experiences, initialRows } = useMemo(
    () => ({
      experiences: readOperatorCollection(user, 'experiences'),
      initialRows: readOperatorCollection(user, 'availability'),
    }),
    [user],
  )
  const [rows, setRows] = useState(initialRows)
  const [selectedExperience, setSelectedExperience] = useState('Todas')
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState(null)
  const experienceById = new Map(experiences.map((experience) => [String(experience.id), experience]))
  const filteredRows = rows.filter((item) => {
    if (selectedExperience === 'Todas') return true
    return String(item.experienceId) === selectedExperience
  })

  function persist(updatedRows) {
    saveOperatorCollection(user, 'availability', updatedRows)
    setRows(updatedRows)
    setNotice({
      type: 'success',
      text: 'Disponibilidad guardada en este navegador; estos datos quedan listos para conectarse al backend.',
    })
  }

  function handleSave(values, validationError) {
    if (validationError) {
      setNotice({ type: 'error', text: validationError })
      return
    }

    const updatedRows = editingId
      ? rows.map((item) => item.id === editingId ? { ...item, ...values } : item)
      : [...rows, { id: `availability-${Date.now()}`, ...values }]

    try {
      persist(updatedRows)
      setEditingId(null)
      setAdding(false)
    } catch (error) {
      setNotice({ type: 'error', text: `No se pudieron guardar los cupos: ${error.message}` })
    }
  }

  return (
    <div className="space-y-7 lg:space-y-9">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Cupos</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Revisa y organiza los espacios disponibles en tus experiencias.
        </p>
      </div>

      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] md:items-end lg:p-7">
        <div className="grid gap-2">
          <label htmlFor="availability-experience" className="text-sm font-semibold text-ink">
            Filtrar experiencia
          </label>
          <select
            id="availability-experience"
            value={selectedExperience}
            onChange={(event) => setSelectedExperience(event.target.value)}
            className={fieldClass}
          >
            <option value="Todas">Todas</option>
            {experiences.map((experience) => (
              <option key={experience.id} value={String(experience.id)}>{experience.title}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div>
            <p className="text-base font-semibold text-ink">Cupos por fecha</p>
            <p className="mt-1 text-sm text-muted">Administra disponibilidad y horarios.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAdding((current) => !current)
              setEditingId(null)
              setNotice(null)
            }}
            className="rounded-full border border-black/10 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            {adding ? 'Cancelar' : '+ Agregar fecha'}
          </button>
        </div>
      </section>

      {adding && experiences.length > 0 && (
        <AvailabilityForm
          experiences={experiences}
          onCancel={() => setAdding(false)}
          onSave={handleSave}
        />
      )}
      {!experiences.length && adding && (
        <p role="alert" className="rounded-xl border border-amber-900/15 bg-amber-50 p-4 text-sm text-amber-900">
          Primero crea una experiencia para asignarle cupos.
        </p>
      )}

      {notice && (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border p-4 text-sm ${
            notice.type === 'error'
              ? 'border-red-900/15 bg-red-50 text-red-900'
              : 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
          }`}
        >
          {notice.text}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredRows.map((item) => {
          const experience = experienceById.get(String(item.experienceId))
          const date = new Date(`${item.date}T00:00:00`)
          const formattedDate = Number.isNaN(date.getTime())
            ? item.date
            : new Intl.DateTimeFormat('es-SV', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(date)

          return (
            <article key={item.id} className="flex min-h-44 flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
              <div>
                <p className="text-base font-bold capitalize text-ink">{formattedDate} · {item.time}</p>
                <p className="mt-2 text-sm text-muted">{experience?.title ?? 'Experiencia no disponible'}</p>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                <span className="text-sm font-semibold text-brand">
                  {item.available} de {item.capacity} espacios disponibles
                </span>
                <button
                  type="button"
                  aria-expanded={editingId === item.id}
                  onClick={() => {
                    setEditingId((current) => current === item.id ? null : item.id)
                    setAdding(false)
                    setNotice(null)
                  }}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  {editingId === item.id ? 'Cerrar edición' : 'Editar cupos'}
                </button>
              </div>
              {editingId === item.id && (
                <div className="mt-5 border-t border-black/10 pt-5">
                  <AvailabilityForm
                    item={item}
                    experiences={experiences}
                    onCancel={() => setEditingId(null)}
                    onSave={handleSave}
                  />
                </div>
              )}
            </article>
          )
        })}
        {!filteredRows.length && (
          <p className="rounded-2xl border border-dashed border-black/20 bg-white px-4 py-12 text-center text-sm text-muted md:col-span-2 2xl:col-span-3">
            No hay fechas disponibles para esta experiencia.
          </p>
        )}
      </section>
      <p className="text-xs leading-5 text-muted">
        Disponibilidad de ejemplo guardada en este navegador y aislada por perfil.
      </p>
    </div>
  )
}

export default OperatorAvailability
