import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { experiences, formatCurrency } from './operatorData.js'

function OperatorExperiences() {
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
  }, [query, status])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-tight text-[#203940]">Mis experiencias</h1>
          <p className="mt-1 text-sm leading-5 text-muted">
            Administra las actividades que ofreces a los viajeros.
          </p>
        </div>
        <Link
          to="/operador/experiencias/nueva"
          aria-label="Agregar experiencia"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#147c91] text-xl font-medium text-white hover:bg-[#066a82]"
        >
          +
        </Link>
      </div>

      <section className="space-y-3 rounded-xl border border-[#e1e8e9] bg-white p-4">
        <label htmlFor="experience-search" className="sr-only">Buscar experiencias</label>
        <input
          id="experience-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar experiencias"
          className="w-full rounded-lg border border-[#dce4e5] bg-white px-3 py-2.5 text-sm text-[#203940] outline-none placeholder:text-muted focus:border-[#147c91] focus:ring-2 focus:ring-[#147c91]/15"
        />
        <div className="flex gap-2" aria-label="Filtrar por estado">
          {['Todas', 'Publicada', 'Borrador'].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={status === item}
              onClick={() => setStatus(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                status === item
                  ? 'bg-[#147c91] text-white'
                  : 'bg-[#f1f5f5] text-muted hover:text-[#147c91]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredExperiences.length ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredExperiences.map((experience) => (
            <article key={experience.id} className="overflow-hidden rounded-xl border border-[#e1e8e9] bg-white">
              <div className="grid h-32 place-items-center bg-[#eaf5f6] text-4xl" aria-hidden="true">
                {experience.category === 'Aventura'
                  ? '🌊'
                  : experience.category === 'Naturaleza'
                    ? '🌋'
                    : '☕'}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-base font-bold leading-5 text-[#203940]">{experience.title}</h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${experience.color}`}>
                    {experience.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {experience.category} · {experience.location}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#203940]">
                    {formatCurrency(experience.price)} <span className="font-normal text-muted">/ persona</span>
                  </span>
                  <span className="text-muted">{experience.bookings} reservas</span>
                </div>
                <Link
                  to={`/operador/experiencias/nueva?editar=${experience.id}`}
                  className="mt-3 flex min-h-10 items-center justify-center rounded-lg border border-[#dce4e5] text-sm font-semibold text-[#147c91] hover:bg-[#f3f8f8]"
                >
                  Editar experiencia
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-[#dce4e5] bg-white px-5 py-10 text-center">
          <p className="font-semibold text-[#203940]">No encontramos experiencias</p>
          <p className="mt-1 text-sm text-muted">Prueba con otro término o estado.</p>
        </div>
      )}
      <p className="text-xs leading-5 text-muted">
        Publicaciones de muestra. La edición y sincronización se habilitarán al conectar el backend.
      </p>
    </div>
  )
}

export default OperatorExperiences
