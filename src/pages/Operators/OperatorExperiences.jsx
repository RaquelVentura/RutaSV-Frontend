import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Pill from '../../components/admin/Pill.jsx'
import {
  deleteExperience,
  extractApiError,
  getMyExperiences,
  pauseExperience,
  publishExperience,
  resolveAssetUrl,
} from '../../lib/catalogApi.js'
import {
  experienceStatusMeta,
  formatCurrency,
  formatDuration,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const statusFilters = [
  { value: '', label: 'Estado: todas' },
  { value: 'PUBLICADA', label: 'Publicadas' },
  { value: 'BORRADOR', label: 'Borradores' },
  { value: 'PAUSADA', label: 'Pausadas' },
  { value: 'RETIRADA', label: 'Retiradas' },
]

function OperatorExperiences() {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorBanner, setErrorBanner] = useState('')
  const [missingFieldsAlert, setMissingFieldsAlert] = useState([])
  const [busyId, setBusyId] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  function loadExperiences() {
    setReloadKey((k) => k + 1)
  }

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
          setErrorBanner(extractApiError(error, 'No se pudieron cargar tus experiencias.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    return () => {
      cancelled = true
    }
  }, [statusFilter, reloadKey])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return experiences
    return experiences.filter(
      (exp) =>
        exp.title.toLowerCase().includes(q) ||
        (exp.municipalityName ?? '').toLowerCase().includes(q) ||
        (exp.departmentName ?? '').toLowerCase().includes(q),
    )
  }, [experiences, searchTerm])

  async function handlePublish(exp) {
    setBusyId(exp.id)
    setMissingFieldsAlert([])
    try {
      await publishExperience(exp.id)
      notify.success(`"${exp.title}" fue publicada en el catálogo.`)
      await loadExperiences()
    } catch (error) {
      const parsed = extractApiError(error, 'No se pudo publicar la experiencia.')
      if (parsed.missingFields.length > 0) {
        setMissingFieldsAlert(parsed.missingFields)
      }
      notify.error(parsed.message)
    } finally {
      setBusyId('')
    }
  }

  async function handlePause(exp) {
    setBusyId(exp.id)
    try {
      await pauseExperience(exp.id)
      notify.success(`"${exp.title}" fue pausada.`)
      await loadExperiences()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(exp) {
    const confirmed = window.confirm(
      `¿Archivar (borrado lógico) "${exp.title}"? Si tiene reservas futuras activas, pasarán a PENDIENTE_DECISION (RN-21) y se notificará a los visitantes.`,
    )
    if (!confirmed) return
    setBusyId(exp.id)
    try {
      await deleteExperience(exp.id)
      notify.success(`"${exp.title}" fue archivada correctamente.`)
      await loadExperiences()
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Catálogo del operador</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Mis experiencias</h1>
          <p className="mt-1 text-sm text-muted">
            Crea, edita, publica, pausa o archiva tus experiencias turísticas.
          </p>
        </div>
        <Link
          to="/operador/experiencias/nueva"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          + Nueva experiencia
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterSelect
          label="Filtrar por estado"
          options={statusFilters}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-h-12 md:w-56"
        />

        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título o municipio..."
          aria-label="Buscar mis experiencias"
          className="w-full rounded-xl border border-mist bg-surface px-3.5 py-2 text-sm text-ink sm:w-64"
        />
      </div>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      {missingFieldsAlert.length > 0 && (
        <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-bold">Faltan requisitos para publicar esta experiencia (RN-23):</p>
          <ul className="mt-2 list-disc pl-5 text-xs">
            {missingFieldsAlert.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl border border-mist bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-surface p-12 text-center">
          <p className="text-lg font-bold text-ink">No hay experiencias registradas</p>
          <p className="mt-1 text-sm text-muted">
            Crea tu primera experiencia con fotos, ubicación en mapa y cupos.
          </p>
          <Link
            to="/operador/experiencias/nueva"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white"
          >
            Crear experiencia
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exp) => {
            const st = experienceStatusMeta[exp.status] ?? { label: exp.status, tone: 'neutral' }
            const cover = exp.images?.find((i) => i.isCover) || exp.images?.[0]
            const isBusy = busyId === exp.id

            return (
              <article
                key={exp.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-mist bg-surface p-5"
              >
                {cover?.url ? (
                  <img
                    src={resolveAssetUrl(cover.url)}
                    alt={exp.title}
                    className="h-24 w-36 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-24 w-36 shrink-0 place-items-center rounded-xl bg-info-soft text-xs font-semibold text-brand">
                    Sin foto
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={st.tone}>{st.label}</Pill>
                    <span className="text-xs text-muted">
                      {exp.municipalityName}, {exp.departmentName}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-ink">{exp.title}</h2>
                  <p className="text-xs text-muted">
                    {formatCurrency(exp.price, exp.currency)} · {formatDuration(exp.durationMinutes)} ·{' '}
                    {exp.hasLimitedCapacity ? `Cupo ${exp.minPeople}–${exp.maxPeople}` : 'Sin límite'} ·{' '}
                    {exp.images?.length ?? 0} foto(s)
                  </p>
                  {exp.withdrawalReason && (
                    <p className="text-xs font-medium text-danger">
                      Motivo de retiro: {exp.withdrawalReason}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/operador/experiencias/nueva?editar=${exp.id}`}
                    className="rounded-full border border-mist px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-brand"
                  >
                    Editar
                  </Link>
                  <Link
                    to={`/operador/cupos?experiencia=${exp.id}`}
                    className="rounded-full border border-mist px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-brand"
                  >
                    Cupos
                  </Link>
                  {(exp.status === 'BORRADOR' || exp.status === 'PAUSADA') && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handlePublish(exp)}
                      className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      Publicar
                    </button>
                  )}
                  {exp.status === 'PUBLICADA' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handlePause(exp)}
                      className="rounded-full border border-amber-400 px-3.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                    >
                      Pausar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDelete(exp)}
                    className="rounded-full border border-danger/40 px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft disabled:opacity-50"
                  >
                    Archivar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OperatorExperiences
