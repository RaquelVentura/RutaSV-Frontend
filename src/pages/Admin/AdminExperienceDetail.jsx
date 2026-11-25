// Detalle de una experiencia para el admin: galería, datos y mapa, con las acciones de moderación.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Dialog from '../../components/admin/Dialog.jsx'
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
import { experienceStatusMeta, formatCurrency, formatDuration } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function AdminExperienceDetail() {
  const { id } = useParams()
  const [experience, setExperience] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    getExperienceBySlugOrId(id)
      .then((data) => {
        if (!cancelled) setExperience(data)
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

  function openAction(type, extra = {}) {
    setAction({ type, ...extra })
    setReason('')
    setReasonError('')
  }

  async function confirm(event) {
    event.preventDefault()
    const motive = reason.trim()
    if (action.type === 'withdraw' && !motive) {
      setReasonError('El motivo es obligatorio.')
      return
    }
    setBusy(true)
    try {
      let updated
      if (action.type === 'withdraw') {
        updated = await withdrawExperience(experience.id, motive)
        notify.success('Experiencia retirada. Los visitantes con reservas futuras recibirán aviso.')
      } else if (action.type === 'restore') {
        updated = await restoreExperience(experience.id)
        notify.success('Experiencia restaurada al catálogo público.')
      } else {
        updated = await removeExperienceImage(experience.id, action.imageId)
        notify.success(`Foto ${action.number} eliminada.`)
      }
      setExperience(updated)
      setAction(null)
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
          Volver a Experiencias
        </Link>
      </div>
    )
  }

  const status = experienceStatusMeta[experience.status] ?? { label: experience.status, tone: 'neutral' }
  const images = experience.images ?? []
  const withdrawn = experience.status === 'RETIRADA'
  const archived = experience.status === 'ARCHIVADA'
  const hasPosition = Number.isFinite(Number(experience.latitude)) && Number.isFinite(Number(experience.longitude)) &&
    experience.latitude !== null && experience.longitude !== null
  const people =
    experience.minPeople && experience.maxPeople
      ? `${experience.minPeople} a ${experience.maxPeople} personas`
      : experience.maxPeople
        ? `Hasta ${experience.maxPeople} personas`
        : 'Sin límite'

  const dialogTitle = {
    photo: `Eliminar foto ${action?.number ?? ''}`,
    withdraw: 'Retirar experiencia',
    restore: 'Restaurar experiencia',
  }[action?.type]

  return (
    <div className="space-y-7">
      <header className="space-y-4">
        <Link to="/admin/experiencias" className="inline-block text-sm font-semibold text-brand hover:text-brand-dark">
          ← Volver a Experiencias
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-ink">{experience.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {experience.municipalityName}, {experience.departmentName}
            </p>
          </div>
          <Pill tone={status.tone}>{status.label}</Pill>
        </div>
      </header>

      {withdrawn && experience.withdrawalReason && (
        <p role="note" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          <strong>Retirada.</strong> Motivo: {experience.withdrawalReason}
        </p>
      )}

      <section aria-labelledby="gallery-title" className="space-y-3">
        <h2 id="gallery-title" className="text-lg font-bold text-ink">Galería ({images.length})</h2>
        {images.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/20 bg-surface px-4 py-8 text-center text-sm text-muted">
            Esta experiencia aún no tiene fotos.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <li key={image.id} className="relative h-36 overflow-hidden rounded-xl bg-info-soft">
                <img
                  src={resolveAssetUrl(image.url)}
                  alt={image.altText || `Foto ${index + 1} de ${experience.title}`}
                  className="h-full w-full object-cover"
                />
                {image.isCover && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    Portada
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => openAction('photo', { imageId: image.id, number: index + 1 })}
                  aria-label={`Eliminar foto ${index + 1}`}
                  className="absolute bottom-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-danger shadow-sm hover:bg-danger-soft"
                >
                  Eliminar foto
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="info-title" className="grid gap-4 rounded-2xl border border-mist bg-surface p-5 sm:grid-cols-3">
        <h2 id="info-title" className="text-lg font-bold text-ink sm:col-span-3">Datos</h2>
        <p className="text-sm text-muted">Precio<br /><strong className="text-ink">{formatCurrency(experience.price, experience.currency)} / persona</strong></p>
        <p className="text-sm text-muted">Capacidad<br /><strong className="text-ink">{people}</strong></p>
        <p className="text-sm text-muted">Duración<br /><strong className="text-ink">{formatDuration(experience.durationMinutes)}</strong></p>
        {experience.description && <p className="text-sm leading-6 text-ink sm:col-span-3">{experience.description}</p>}
      </section>

      <section aria-labelledby="map-title" className="space-y-3">
        <h2 id="map-title" className="text-lg font-bold text-ink">Ubicación</h2>
        {hasPosition ? (
          <LeafletMap
            position={{ lat: Number(experience.latitude), lng: Number(experience.longitude) }}
            label={`Mapa de ${experience.title}`}
            className="h-64"
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-black/20 bg-surface px-4 py-8 text-center text-sm text-muted">
            Sin ubicación en el mapa.
          </p>
        )}
      </section>

      {!archived && (
        <div className="flex justify-end">
          {withdrawn ? (
            <button type="button" onClick={() => openAction('restore')} className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark">
              Restaurar experiencia
            </button>
          ) : (
            <button type="button" onClick={() => openAction('withdraw')} className="rounded-xl bg-danger px-6 py-3 text-sm font-bold text-white hover:opacity-90">
              Retirar experiencia
            </button>
          )}
        </div>
      )}

      {action && (
        <Dialog title={dialogTitle} onClose={() => setAction(null)}>
          <form onSubmit={confirm} noValidate className="mt-4 grid gap-4">
            <p className="text-sm text-muted">
              {action.type === 'withdraw'
                ? 'La experiencia deja de mostrarse en el catálogo. Las reservas futuras activas pasan a «Pendiente de decisión» y los visitantes reciben aviso por correo.'
                : action.type === 'photo'
                  ? 'La foto se elimina de la galería de esta experiencia.'
                  : 'La experiencia vuelve al catálogo público.'}
            </p>
            {action.type === 'withdraw' && (
              <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="admin-reason">
                Motivo
                <textarea
                  id="admin-reason"
                  rows="3"
                  value={reason}
                  onChange={(event) => { setReason(event.target.value); setReasonError('') }}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>
            )}
            {reasonError && <p role="alert" className="text-sm font-semibold text-danger">{reasonError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAction(null)} className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${action.type === 'restore' ? 'bg-brand hover:bg-brand-dark' : 'bg-danger hover:opacity-90'}`}
              >
                {busy ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}

export default AdminExperienceDetail
