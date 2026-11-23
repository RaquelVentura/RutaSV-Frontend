import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import { extractApiError, getMyExperiences, resolveAssetUrl } from '../../lib/catalogApi.js'
import { experienceStatusMeta, formatCurrency } from '../../lib/formatters.js'

const statusOptions = [
  { key: '', label: 'Todas' },
  { key: 'PUBLICADA', label: 'Publicadas' },
  { key: 'BORRADOR', label: 'Borradores' },
  { key: 'PAUSADA', label: 'Pausadas' },
  { key: 'RETIRADA', label: 'Retiradas' },
]

function AdminExperiences() {
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

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Moderación (RF-A03)</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Experiencias del marketplace</h1>
        <p className="mt-1 text-sm text-muted">
          Revisa el catálogo completo, modera fotografías o retira experiencias con aviso automático RN-21.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.key || 'all'}
            type="button"
            onClick={() => setStatusFilter(opt.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              statusFilter === opt.key
                ? 'bg-brand text-white'
                : 'border border-mist bg-surface text-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-surface p-10 text-center text-sm text-muted">
          No hay experiencias registradas en este estado.
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => {
            const st = experienceStatusMeta[exp.status] ?? { label: exp.status, tone: 'neutral' }
            const cover = exp.images?.find((i) => i.isCover) || exp.images?.[0]
            return (
              <article
                key={exp.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-mist bg-surface p-4"
              >
                {cover?.url ? (
                  <img
                    src={resolveAssetUrl(cover.url)}
                    alt={exp.title}
                    className="h-20 w-28 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-28 shrink-0 place-items-center rounded-xl bg-info-soft text-xs font-semibold text-brand">
                    Sin foto
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={st.tone}>{st.label}</Pill>
                    <span className="text-xs text-muted">{exp.company?.tradeName}</span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-ink">{exp.title}</h2>
                  <p className="text-xs text-muted">
                    {exp.municipalityName}, {exp.departmentName} · {formatCurrency(exp.price, exp.currency)}
                  </p>
                </div>
                <Link
                  to={`/admin/experiencias/${exp.id}`}
                  className="rounded-full border border-brand px-4 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white"
                >
                  Moderar
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminExperiences
