import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import ExperienceCard from '../../components/ExperienceCard.jsx'
import PriceRange from '../../components/PriceRange.jsx'
import MeetingMap from '../../components/experience/MeetingMap.jsx'
import { categories, catalog, departments } from '../../data/catalog.js'
import { findFirstAvailableDate, getSpotsForDate, toIsoDate } from '../../lib/availability.js'

const pageSize = 6

const sortOptions = [
  { value: 'recomendadas', label: 'Recomendadas' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'calificacion', label: 'Mejor calificadas' },
]

const fieldClass =
  'w-full rounded-xl border border-mist bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30'

const emptyFilters = {
  zone: 'todo',
  date: '',
  people: 2,
  priceMin: '',
  priceMax: '',
  departments: [],
  categories: [],
}

function matches(experience, filters, query, today) {
  if (query) {
    const text = `${experience.title} ${experience.location} ${experience.category}`.toLowerCase()
    if (!text.includes(query.toLowerCase())) return false
  }
  if (filters.zone !== 'todo' && experience.department !== filters.zone) return false
  if (filters.departments.length > 0 && !filters.departments.includes(experience.department)) return false
  if (filters.categories.length > 0 && !filters.categories.includes(experience.category)) return false
  if (filters.priceMin !== '' && experience.price < Number(filters.priceMin)) return false
  if (filters.priceMax !== '' && experience.price > Number(filters.priceMax)) return false
  if (filters.people > experience.capacity) return false
  if (filters.date) {
    const [year, month, day] = filters.date.split('-').map(Number)
    const { status } = getSpotsForDate(new Date(year, month - 1, day), experience.capacity, today)
    if (status !== 'available' && status !== 'few') return false
  }
  return true
}

function sortList(list, sort) {
  const copy = [...list]
  if (sort === 'precio-asc') copy.sort((a, b) => a.price - b.price)
  if (sort === 'precio-desc') copy.sort((a, b) => b.price - a.price)
  if (sort === 'calificacion') copy.sort((a, b) => b.rating - a.rating)
  return copy
}

function CheckGroup({ title, options, selected, onToggle }) {
  return (
    <fieldset className="border-t border-mist pt-4">
      <legend className="mb-2 text-sm font-bold text-ink">{title}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-xs text-ink">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 rounded border-mist text-brand focus:ring-brand"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// Explorar (HU-12): búsqueda por zona, fecha y personas, filtros laterales,
// orden, vista en lista o mapa y paginación.
function ExperienceExplorer({ today = new Date() }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const initialDate = useMemo(() => {
    const first = findFirstAvailableDate(8, today)
    return first ? toIsoDate(first) : ''
  }, [today])

  const [draft, setDraft] = useState({ ...emptyFilters, date: initialDate })
  const [applied, setApplied] = useState({ ...emptyFilters, date: initialDate })
  const [sort, setSort] = useState('recomendadas')
  const [view, setView] = useState('lista')
  const [page, setPage] = useState(1)

  const results = useMemo(
    () => sortList(catalog.filter((experience) => matches(experience, applied, query, today)), sort),
    [applied, query, sort, today],
  )
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = results.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }))
  const toggle = (field) => (value) =>
    setDraft((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }))

  function apply(event) {
    event?.preventDefault()
    setApplied({ ...draft, people: Number(draft.people) })
    setPage(1)
  }

  function clear() {
    const reset = { ...emptyFilters, date: initialDate }
    setDraft(reset)
    setApplied(reset)
    setPage(1)
  }

  const summary = [applied.date && formatDate(applied.date), `${applied.people} ${applied.people === 1 ? 'persona' : 'personas'}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="w-full px-6 pt-6">
      <nav aria-label="Ruta de navegación" className="text-xs text-muted">
        Inicio / Explorar experiencias
      </nav>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Encuentra tu próxima historia</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Sal de la rutina. Entra en El Salvador.</h1>
        <p className="mt-2 text-muted">
          {query ? `Resultados para «${query}».` : 'Planes locales para descubrir el país a tu manera.'}
        </p>
      </header>

      <form
        onSubmit={apply}
        role="search"
        aria-label="Buscar experiencias"
        className="mt-6 grid gap-4 rounded-2xl border border-mist bg-surface p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      >
        <div>
          <label htmlFor="explorer-zone" className="mb-1.5 block text-xs font-semibold text-ink">
            Zona
          </label>
          <FilterSelect
            id="explorer-zone"
            options={[{ value: 'todo', label: 'Todo El Salvador' }, ...departments]}
            value={draft.zone}
            onChange={update('zone')}
            wrapperClassName="block w-full"
          />
        </div>
        <div>
          <label htmlFor="explorer-date" className="mb-1.5 block text-xs font-semibold text-ink">
            Fecha
          </label>
          <input id="explorer-date" type="date" value={draft.date} onChange={update('date')} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="explorer-people" className="mb-1.5 block text-xs font-semibold text-ink">
            Personas
          </label>
          <FilterSelect
            id="explorer-people"
            options={[1, 2, 3, 4, 5, 6, 8, 10].map((count) => ({
              value: count,
              label: `${count} ${count === 1 ? 'persona' : 'personas'}`,
            }))}
            value={draft.people}
            onChange={update('people')}
            wrapperClassName="block w-full"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Actualizar búsqueda
        </button>
      </form>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <form
          onSubmit={apply}
          aria-label="Filtros"
          className="space-y-4 rounded-2xl border border-mist bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Filtros</h2>
            <button type="button" onClick={clear} className="text-xs font-semibold text-brand hover:underline">
              Limpiar
            </button>
          </div>

          <fieldset className="border-t border-mist pt-4">
            <legend className="mb-2 text-sm font-bold text-ink">Precio por persona (USD)</legend>
            <PriceRange
              minValue={draft.priceMin}
              maxValue={draft.priceMax}
              onChange={(priceMin, priceMax) => setDraft((current) => ({ ...current, priceMin, priceMax }))}
            />
          </fieldset>

          <CheckGroup
            title="Departamento"
            options={departments}
            selected={draft.departments}
            onToggle={toggle('departments')}
          />
          <CheckGroup title="Categoría" options={categories} selected={draft.categories} onToggle={toggle('categories')} />

          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Aplicar filtros
          </button>
        </form>

        <section aria-labelledby="explorer-results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="explorer-results" className="text-lg font-bold text-ink">
                {results.length} {results.length === 1 ? 'experiencia' : 'experiencias'} para descubrir
              </h2>
              <p className="text-xs text-muted">{summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView((current) => (current === 'lista' ? 'mapa' : 'lista'))}
                aria-pressed={view === 'mapa'}
                className="rounded-xl border border-mist bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:bg-canvas"
              >
                {view === 'mapa' ? 'Vista en lista' : 'Vista en mapa'}
              </button>
              <label className="sr-only" htmlFor="explorer-sort">
                Ordenar por
              </label>
              <FilterSelect
                id="explorer-sort"
                options={sortOptions}
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value)
                  setPage(1)
                }}
                className="py-2 text-xs font-semibold"
              />
            </div>
          </div>

          {results.length === 0 ? (
            <div role="status" className="mt-6 rounded-2xl border border-mist bg-surface p-8 text-center">
              <p className="font-bold text-ink">No encontramos experiencias con esos filtros.</p>
              <p className="mt-1 text-sm text-muted">Prueba con otra fecha, zona o rango de precio.</p>
              <button type="button" onClick={clear} className="mt-4 text-sm font-semibold text-brand hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : view === 'mapa' ? (
            <div className="mt-6 space-y-4">
              <MeetingMap label="Experiencias en El Salvador" />
              <ul className="divide-y divide-mist rounded-2xl border border-mist bg-surface">
                {visible.map((experience) => (
                  <li key={experience.slug} className="flex items-center justify-between gap-4 p-4 text-sm">
                    <Link to={`/experiencias/${experience.slug}`} className="font-semibold text-ink hover:text-brand">
                      {experience.title}
                    </Link>
                    <span className="text-muted">{experience.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {visible.map((experience) => (
                <li key={experience.slug}>
                  <ExperienceCard
                    slug={experience.slug}
                    image={experience.image}
                    location={experience.location}
                    rating={experience.rating}
                    title={experience.title}
                    details={`Guía local · Grupo pequeño · ${experience.duration}`}
                    price={experience.price}
                    spots={experience.capacity}
                  />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-mist bg-surface px-3 py-2 text-xs font-semibold text-ink disabled:opacity-40"
              >
                ← Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? 'page' : undefined}
                  aria-label={`Página ${number}`}
                  className={`h-9 w-9 rounded-xl text-xs font-semibold ${
                    number === currentPage ? 'bg-brand text-white' : 'border border-mist bg-surface text-ink'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-mist bg-surface px-3 py-2 text-xs font-semibold text-ink disabled:opacity-40"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(year, month - 1, day),
  )
}

export default ExperienceExplorer
