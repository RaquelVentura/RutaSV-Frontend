
//PANEL DE EXPERIENCIAS OPERADOR 

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency } from './operatorData.js'
import { readOperatorCollection } from './operatorRepository.js'

const categoryIcons = {
  Aventura: '🌊',
  Naturaleza: '🌿',
  'Cultura y café': '☕',
  Gastronomía: '🍽️',
  Playa: '🏖️',
}

function OperatorExperiences() {
  const { user } = useAuth()
  const [experiences] = useState(() => readOperatorCollection(user, 'experiences'))
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todas')

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
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
          {['Todas', 'Publicada', 'Borrador'].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={status === item}
              onClick={() => setStatus(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                status === item
                  ? 'bg-brand text-white'
                  : 'bg-canvas text-muted hover:text-brand'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredExperiences.length ? (
        <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredExperiences.map((experience) => (
            <article key={experience.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="grid h-44 place-items-center bg-info-soft text-5xl" aria-hidden="true">
                {categoryIcons[experience.category] ?? '✨'}
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-6 text-ink">{experience.title}</h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${experience.status === 'Publicada' ? 'bg-cyan-100 text-cyan-800' : 'bg-stone-100 text-stone-700'}`}>
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
    </div>
  )
}

export default OperatorExperiences
