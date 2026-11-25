// Panel del admin: todas las experiencias del catálogo, con búsqueda y filtro de estado.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import { extractApiError, getMyExperiences, resolveAssetUrl } from '../../lib/catalogApi.js'
import { experienceStatusMeta, formatCurrency } from '../../lib/formatters.js'
import useAdminSearch from '../../lib/useAdminSearch.js'

const statusOptions = [
  { value: '', label: 'Estado: todas' },
  { value: 'PUBLICADA', label: 'Estado: Publicadas' },
  { value: 'BORRADOR', label: 'Estado: Borradores' },
  { value: 'PAUSADA', label: 'Estado: Pausadas' },
  { value: 'RETIRADA', label: 'Estado: Retiradas' },
]

function AdminExperiences() {
  const [query, setQuery] = useAdminSearch()
  const [statusFilter, setStatusFilter] = useState('')
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorBanner, setErrorBanner] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchItems() {
      try {
        const response = await getMyExperiences({
          pageNumber: 1,
          pageSize: 100,
          status: statusFilter || undefined,
        })
        if (!cancelled) {
          setErrorBanner('')
          setExperiences(response?.data ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          setErrorBanner(extractApiError(error, 'No se pudieron cargar las experiencias.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (!term) return experiences
    return experiences.filter((item) =>
      `${item.title} ${item.municipalityName} ${item.departmentName}`.toLocaleLowerCase().includes(term),
    )
  }, [experiences, query])

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Experiencias"
        subtitle="Revisa lo que publican los operadores y retira lo que incumpla las reglas."
      />

      <section className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto] md:items-center">
        <SearchInput
          label="Buscar experiencias"
          placeholder="Buscar por nombre o lugar"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterSelect
          label="Filtrar por estado"
          options={statusOptions}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-h-12 md:w-56"
        />
      </section>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
          <h2 className="text-sm font-bold text-ink">Ninguna experiencia coincide con tu búsqueda</h2>
          <p className="mt-1 text-xs text-muted">Prueba con otros filtros.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Experiencias">
          {visible.map((item) => {
            const status = experienceStatusMeta[item.status] ?? { label: item.status, tone: 'neutral' }
            const cover = item.images?.find((image) => image.isCover) || item.images?.[0]
            return (
              <li key={item.id}>
                <Link
                  to={`/admin/experiencias/${item.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist bg-surface transition hover:border-brand hover:shadow-md"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-info-soft">
                    {cover?.url ? (
                      <img
                        src={resolveAssetUrl(cover.url)}
                        alt=""
                        loading="lazy"
                        className={`h-full w-full object-cover transition group-hover:scale-[1.03] ${item.status === 'RETIRADA' ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center px-3 text-center text-xs font-semibold text-muted">
                        Sin foto
                      </span>
                    )}
                    <Pill tone={status.tone} className="absolute left-3 top-3 shadow-sm">
                      {status.label}
                    </Pill>
                  </span>
                  <span className="flex flex-1 flex-col gap-1 p-4">
                    <span className="text-sm font-bold leading-5 text-ink">{item.title}</span>
                    <span className="text-xs text-muted">
                      {item.municipalityName}, {item.departmentName}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-3 text-xs">
                      <span className="font-semibold text-ink">
                        {formatCurrency(item.price, item.currency)} / persona
                      </span>
                      <span className="text-muted">{item.images?.length ?? 0} fotos</span>
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AdminExperiences
