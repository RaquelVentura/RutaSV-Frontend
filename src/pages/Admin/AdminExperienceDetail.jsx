import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import {
  extractApiError,
  getExperienceBySlugOrId,
  removeExperienceImage,
  resolveAssetUrl,
  restoreExperience,
  withdrawExperience,
} from '../../lib/catalogApi.js'
import { experienceStatusMeta, formatCurrency } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function AdminExperienceDetail() {
  const { id } = useParams()
  const [experience, setExperience] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getExperienceBySlugOrId(id)
      .then((data) => {
        if (!cancelled) {
          setExperience(data)
          setReason(data.withdrawalReason ?? '')
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (!cancelled) setErrorMessage(extractApiError(error, 'Experiencia no encontrada.').message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleWithdraw() {
    if (!experience || !reason.trim()) {
      notify.error('Debes ingresar el motivo de retiro.')
      return
    }
    setBusy(true)
    try {
      const updated = await withdrawExperience(experience.id, reason.trim())
      setExperience(updated)
      notify.success('Experiencia retirada y visitantes con reservas futuras notificados (RN-21).')
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleRestore() {
    if (!experience) return
    setBusy(true)
    try {
      const updated = await restoreExperience(experience.id)
      setExperience(updated)
      notify.success('Experiencia restaurada al catálogo público.')
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemovePhoto(imageId) {
    if (!experience) return
    setBusy(true)
    try {
      const updated = await removeExperienceImage(experience.id, imageId)
      setExperience(updated)
      notify.success('Fotografía removida por moderación.')
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="h-80 animate-pulse rounded-2xl bg-surface" />
  }

  if (!experience) {
    return (
      <div className="space-y-4 rounded-2xl border border-mist bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Experiencia no encontrada</h1>
        <p className="text-sm text-muted">{errorMessage}</p>
        <Link to="/admin/experiencias" className="text-sm font-semibold text-brand underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  const st = experienceStatusMeta[experience.status] ?? { label: experience.status, tone: 'neutral' }

  return (
    <div className="space-y-6">
      <Link to="/admin/experiencias" className="text-sm font-semibold text-brand hover:underline">
        ← Volver a experiencias
      </Link>

      <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Pill tone={st.tone}>{st.label}</Pill>
              <span className="text-xs text-muted">{experience.company?.tradeName}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-ink">{experience.title}</h1>
            <p className="text-sm text-muted">
              {experience.municipalityName}, {experience.departmentName} ·{' '}
              {formatCurrency(experience.price, experience.currency)}
            </p>
          </div>

          {experience.status === 'RETIRADA' && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRestore}
              className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Restaurar experiencia
            </button>
          )}
        </div>

        <p className="text-sm text-muted">{experience.description}</p>

        <LeafletMap
          position={{ lat: Number(experience.latitude), lng: Number(experience.longitude) }}
          label={`Mapa de ${experience.title}`}
          className="h-64"
        />

        <div className="space-y-3">
          <h2 className="text-base font-bold text-ink">Galería ({experience.images?.length ?? 0})</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(experience.images ?? []).map((img) => (
              <div key={img.id} className="overflow-hidden rounded-xl border border-mist">
                <img
                  src={resolveAssetUrl(img.url)}
                  alt={img.altText || experience.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex items-center justify-between bg-canvas p-2 text-xs">
                  <span className="text-muted">{img.isCover ? 'Portada' : 'Galería'}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemovePhoto(img.id)}
                    className="font-semibold text-danger hover:underline disabled:opacity-40"
                  >
                    Retirar foto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {experience.status !== 'RETIRADA' && experience.status !== 'ARCHIVADA' && (
          <div className="space-y-3 border-t border-mist pt-4">
            <h2 className="text-base font-bold text-danger">Retirar experiencia del catálogo</h2>
            <p className="text-xs text-muted">
              Las reservas futuras activas pasarán a PENDIENTE_DECISION (RN-21) y los turistas recibirán aviso por correo.
            </p>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Indica el motivo del retiro (obligatorio)..."
              className="w-full rounded-xl border border-mist bg-canvas p-3 text-sm text-ink"
            />
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={handleWithdraw}
              className="rounded-full bg-danger px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Retirar experiencia
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminExperienceDetail
