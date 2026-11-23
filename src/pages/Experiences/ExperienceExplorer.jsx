import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ExperienceCard from '../../components/ExperienceCard.jsx'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  addFavorite,
  getMyFavoriteIds,
  removeFavorite,
} from '../../lib/bookingApi.js'
import {
  extractApiError,
  getCategories,
  getDepartments,
  getPublicExperiences,
} from '../../lib/catalogApi.js'
import { difficultyLabels, formatDuration } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const pageSize = 9

function ExperienceExplorer() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '')
  const [departmentId, setDepartmentId] = useState(() => searchParams.get('departmentId') ?? '')
  const [difficulty, setDifficulty] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [pageNumber, setPageNumber] = useState(1)
  const [viewMode, setViewMode] = useState('list')
  const [selectedMapExp, setSelectedMapExp] = useState(null)

  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [result, setResult] = useState({ data: [], totalRecords: 0, totalPages: 1, currentPage: 1 })
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getCategories(), getDepartments()])
      .then(([cats, depts]) => {
        if (cancelled) return
        setCategories(cats)
        setDepartments(depts)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getMyFavoriteIds()
      .then((ids) => {
        if (!cancelled) setFavoriteIds(ids)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const activeFavoriteIds = isAuthenticated ? favoriteIds : []

  useEffect(() => {
    let cancelled = false
    async function fetchCatalog() {
      try {
        const response = await getPublicExperiences({
          pageNumber,
          pageSize,
          search: search.trim() || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          departmentId: departmentId ? Number(departmentId) : undefined,
          difficulty: difficulty || undefined,
          minPrice: minPrice !== '' ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
          sortBy,
        })
        if (!cancelled) {
          setErrorMessage('')
          setResult({
            data: response?.data ?? [],
            totalRecords: response?.totalRecords ?? 0,
            totalPages: Math.max(1, response?.totalPages ?? 1),
            currentPage: response?.currentPage ?? pageNumber,
          })
          setSelectedMapExp((response?.data ?? [])[0] ?? null)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se pudo cargar el catálogo de experiencias.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCatalog()
    return () => {
      cancelled = true
    }
  }, [pageNumber, search, categoryId, departmentId, difficulty, minPrice, maxPrice, sortBy])

  const activeFiltersCount = useMemo(() => {
    return [search.trim(), categoryId, departmentId, difficulty, minPrice, maxPrice].filter(Boolean).length
  }, [search, categoryId, departmentId, difficulty, minPrice, maxPrice])

  function handleResetFilters() {
    setSearch('')
    setCategoryId('')
    setDepartmentId('')
    setDifficulty('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('recent')
    setPageNumber(1)
    setSearchParams({})
  }

  async function handleToggleFavorite(experienceId) {
    if (!isAuthenticated) {
      notify.error('Inicia sesión para guardar experiencias en favoritos.')
      return
    }
    const isFav = activeFavoriteIds.includes(experienceId)
    try {
      if (isFav) {
        await removeFavorite(experienceId)
        setFavoriteIds((prev) => prev.filter((id) => id !== experienceId))
        notify.success('Quitada de favoritos.')
      } else {
        await addFavorite(experienceId)
        setFavoriteIds((prev) => [...prev, experienceId])
        notify.success('Agregada a favoritos.')
      }
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          Explora El Salvador
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">
              Experiencias turísticas
            </h1>
            <p className="mt-1 text-sm text-muted">
              {loading
                ? 'Cargando catálogo...'
                : `${result.totalRecords} experiencia${result.totalRecords === 1 ? '' : 's'} disponible${result.totalRecords === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>Ordenar:</span>
              <select
                aria-label="Ordenar experiencias"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPageNumber(1)
                }}
                className="rounded-xl border border-mist bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating">Mejor calificadas</option>
              </select>
            </label>

            <div className="inline-flex rounded-xl border border-mist bg-surface p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'list' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'map' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                Mapa
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className="h-fit space-y-5 rounded-2xl border border-mist bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Filtros</h2>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Limpiar ({activeFiltersCount})
              </button>
            )}
          </div>

          <div>
            <label htmlFor="explorer-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Buscar
            </label>
            <input
              id="explorer-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageNumber(1)
              }}
              placeholder="Surf, café, volcán, Suchitoto..."
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="explorer-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Categoría
            </label>
            <select
              id="explorer-category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="explorer-department" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Departamento
            </label>
            <select
              id="explorer-department"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Todo El Salvador</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="explorer-difficulty" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Dificultad
            </label>
            <select
              id="explorer-difficulty"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value)
                setPageNumber(1)
              }}
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
            >
              <option value="">Cualquier nivel</option>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="explorer-min-price" className="mb-1 block text-xs font-semibold text-muted">
                Precio mín.
              </label>
              <input
                id="explorer-min-price"
                type="number"
                min="0"
                step="1"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value)
                  setPageNumber(1)
                }}
                placeholder="$0"
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="explorer-max-price" className="mb-1 block text-xs font-semibold text-muted">
                Precio máx.
              </label>
              <input
                id="explorer-max-price"
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value)
                  setPageNumber(1)
                }}
                placeholder="$250"
                className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {errorMessage && (
            <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-80 animate-pulse rounded-2xl border border-mist bg-surface" />
              ))}
            </div>
          ) : result.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mist bg-surface p-12 text-center">
              <p className="text-lg font-bold text-ink">No encontramos experiencias con esos filtros</p>
              <p className="mt-2 text-sm text-muted">
                Prueba ajustando el departamento, categoría o rango de precios.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : viewMode === 'map' ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <LeafletMap
                position={
                  selectedMapExp
                    ? { lat: Number(selectedMapExp.latitude), lng: Number(selectedMapExp.longitude) }
                    : { lat: 13.7, lng: -89.2 }
                }
                label="Mapa de experiencias en El Salvador"
                className="h-[460px]"
              />
              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {result.data.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => setSelectedMapExp(exp)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      selectedMapExp?.id === exp.id
                        ? 'border-brand bg-info-soft'
                        : 'border-mist bg-surface hover:border-brand/50'
                    }`}
                  >
                    <p className="text-xs text-muted">
                      {exp.municipalityName}, {exp.departmentName}
                    </p>
                    <p className="mt-1 font-bold text-ink">{exp.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand">${Number(exp.price).toFixed(2)} USD</span>
                      <Link
                        to={`/experiencias/${exp.slug}`}
                        className="font-semibold text-ink underline"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.data.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  slug={exp.slug}
                  image={exp.coverImageUrl}
                  location={`${exp.municipalityName}, ${exp.departmentName}`}
                  rating={exp.averageRating}
                  title={exp.title}
                  details={`${formatDuration(exp.durationMinutes)} · ${exp.shortDescription}`}
                  price={exp.price}
                  spots={exp.hasLimitedCapacity ? exp.maxPeople : 'Abierto'}
                  isFavorite={activeFavoriteIds.includes(exp.id)}
                  onToggleFavorite={() => handleToggleFavorite(exp.id)}
                />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <nav aria-label="Paginación" className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-mist bg-surface px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 text-sm text-muted">
                Página {result.currentPage} de {result.totalPages}
              </span>
              <button
                type="button"
                disabled={pageNumber >= result.totalPages}
                onClick={() => setPageNumber((p) => Math.min(result.totalPages, p + 1))}
                className="rounded-xl border border-mist bg-surface px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Siguiente
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

export default ExperienceExplorer
