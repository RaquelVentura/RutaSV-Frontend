
//PANEL DE EXPERIENCIAS OPERADOR 

import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Dialog from '../../components/admin/Dialog.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency } from './operatorData.js'
import { readOperatorCollection, saveOperatorCollection } from './operatorRepository.js'

const categoryIcons = {
  Aventura: '🌊',
  Naturaleza: '🌿',
  'Cultura y café': '☕',
  Gastronomía: '🍽️',
  Playa: '🏖️',
}

const statusOptions = [
  { value: 'Todas', label: 'Estado: todas' },
  { value: 'Publicada', label: 'Publicada' },
  { value: 'Borrador', label: 'Borrador' },
  { value: 'Desactivada', label: 'Desactivada' },
]

const statusStyles = {
  Publicada: 'bg-cyan-100 text-cyan-800',
  Borrador: 'bg-stone-100 text-stone-700',
  Desactivada: 'bg-danger-soft text-danger',
}

function OperatorExperiences() {
  const { user } = useAuth()
  const [experiences, setExperiences] = useState(() => readOperatorCollection(user, 'experiences'))
  const [pending, setPending] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todas')
  const location = useLocation()
  const [initialNotice] = useState(() => location.state?.notice ?? '')
  const notice = feedback || initialNotice

  // El aviso se muestra una sola vez: se quita del historial para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.notice) window.history.replaceState({}, '')
  }, [location.state])

  const filteredExperiences = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return experiences.filter((experience) => {
      const matchesQuery =
        !term ||
        `${experience.title} ${experience.location} ${experience.category}`
          .toLocaleLowerCase()
          .includes(term)
      return matchesQuery && (status === 'Todas' || experience.status === status)
    })
  }, [experiences, query, status])

  // Desactivar no borra: la experiencia deja de mostrarse a los viajeros y se puede
  // reactivar, volviendo al estado que tenía.
  function confirmChange() {
    const target = pending
    if (!target) return
    const deactivating = target.status !== 'Desactivada'
    const updated = experiences.map((item) =>
      item.id === target.id
        ? deactivating
          ? { ...item, status: 'Desactivada', previousStatus: item.status, color: statusStyles.Desactivada }
          : { ...item, status: item.previousStatus ?? 'Borrador', previousStatus: undefined, color: statusStyles[item.previousStatus ?? 'Borrador'] }
        : item,
    )
    try {
      saveOperatorCollection(user, 'experiences', updated)
      setExperiences(updated)
      setFeedback(deactivating ? `«${target.title}» quedó desactivada.` : `«${target.title}» volvió a estar activa.`)
    } catch (error) {
      setFeedback(`No se pudo guardar el cambio: ${error.message}`)
    }
    setPending(null)
  }

  return (
    <div className="space-y-7 lg:space-y-9">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mis experiencias</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Administra las actividades que ofreces a los viajeros.
          </p>
        </div>
        <Link
          to="/operador/experiencias/nueva"
          aria-label="Agregar experiencia"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/10 bg-brand text-2xl font-medium text-white transition hover:bg-brand-dark"
        >
          +
        </Link>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-emerald-900/15 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </p>
      )}

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[minmax(240px,1fr)_auto] md:items-center lg:p-6">
        <label htmlFor="experience-search" className="sr-only">Buscar experiencias</label>
        <input
          id="experience-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar experiencias"
          className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <FilterSelect
          label="Filtrar por estado"
          options={statusOptions}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-12 md:w-56"
        />
      </section>

      {filteredExperiences.length ? (
        <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredExperiences.map((experience) => (
            <article key={experience.id} className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${experience.status === 'Desactivada' ? 'opacity-70' : ''}`}>
              <div className="grid h-44 place-items-center bg-info-soft text-5xl" aria-hidden="true">
                {categoryIcons[experience.category] ?? '✨'}
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-6 text-ink">{experience.title}</h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[experience.status] ?? statusStyles.Borrador}`}>
                    {experience.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {experience.category} · {experience.location}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-ink">
                    {formatCurrency(experience.price)} <span className="font-normal text-muted">/ persona</span>
                  </span>
                  <span className="text-muted">{experience.bookings} reservas</span>
                </div>
                <Link
                  to={`/operador/experiencias/nueva?editar=${encodeURIComponent(experience.id)}`}
                  className="mt-5 flex min-h-11 items-center justify-center rounded-xl border border-black/15 text-sm font-semibold text-brand transition hover:border-brand hover:bg-info-soft"
                >
                  Editar experiencia
                </Link>
                <button
                  type="button"
                  onClick={() => setPending(experience)}
                  aria-label={`${experience.status === 'Desactivada' ? 'Reactivar' : 'Desactivar'} ${experience.title}`}
                  className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-muted transition hover:bg-canvas hover:text-danger"
                >
                  {experience.status === 'Desactivada' ? 'Reactivar' : 'Desactivar'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/20 bg-white px-5 py-14 text-center sm:col-span-2 2xl:col-span-3">
          <p className="font-semibold text-ink">No encontramos experiencias</p>
          <p className="mt-1 text-sm text-muted">Prueba con otro término o estado.</p>
        </div>
      )}

      {pending && (
        <Dialog
          title={pending.status === 'Desactivada' ? '¿Reactivar esta experiencia?' : '¿Desactivar esta experiencia?'}
          onClose={() => setPending(null)}
        >
          <p className="mt-3 text-sm text-muted">
            {pending.status === 'Desactivada'
              ? `«${pending.title}» volverá a estar como ${pending.previousStatus ?? 'Borrador'}.`
              : `«${pending.title}» dejará de mostrarse a los viajeros y no recibirá nuevas reservas. No se borra: podrás reactivarla cuando quieras.`}
            {pending.status !== 'Desactivada' && pending.bookings > 0
              ? ` Tiene ${pending.bookings} ${pending.bookings === 1 ? 'reserva' : 'reservas'}; revísalas en el Historial de Reservas.`
              : ''}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmChange}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white ${
                pending.status === 'Desactivada' ? 'bg-brand hover:bg-brand-dark' : 'bg-danger hover:opacity-90'
              }`}
            >
              {pending.status === 'Desactivada' ? 'Reactivar' : 'Desactivar'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default OperatorExperiences
