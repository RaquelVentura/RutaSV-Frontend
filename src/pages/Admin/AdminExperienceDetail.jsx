// Detalle de una experiencia para el admin: galería, mapa y acciones con motivo obligatorio.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Dialog from '../../components/admin/Dialog.jsx'
import Pill from '../../components/admin/Pill.jsx'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import { formatCurrency } from '../Operators/operatorData.js'
import { readAllExperiences, removePhotoOf, updateExperienceOf } from '../Operators/operatorRepository.js'

const statusTone = { Publicada: 'success', Borrador: 'neutral', Desactivada: 'pending', Retirada: 'danger' }
const tileColors = ['bg-info-soft', 'bg-amber-50', 'bg-success-soft', 'bg-mist/60', 'bg-canvas']

function AdminExperienceDetail() {
  const { owner, id } = useParams()
  const [experience, setExperience] = useState(() =>
    readAllExperiences().find((item) => item.owner === owner && String(item.id) === id),
  )
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)

  if (!experience) {
    return (
      <div className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
        <h1 className="text-2xl font-bold text-ink">No encontramos esa experiencia</h1>
        <Link to="/admin/experiencias" className="font-semibold text-brand hover:underline">
          Volver a Experiencias
        </Link>
      </div>
    )
  }

  const photos = Array.from({ length: experience.photoCount ?? 0 }, (_, index) => index + 1)
  const withdrawn = experience.status === 'Retirada'
  const hasPosition = typeof experience.lat === 'number' && typeof experience.lng === 'number'

  function openAction(type, extra = {}) {
    setAction({ type, ...extra })
    setReason('')
    setError('')
  }

  function confirm(event) {
    event.preventDefault()
    const motive = reason.trim()
    if (!motive) {
      setError('El motivo es obligatorio.')
      return
    }
    try {
      let changes
      let text
      if (action.type === 'photo') {
        text = `Foto ${action.number} eliminada. Se avisó al operador con el motivo.`
      } else if (action.type === 'withdraw') {
        changes = { status: 'Retirada', previousStatus: experience.status, withdrawReason: motive }
        text = 'Experiencia retirada. Se cerró la disponibilidad futura y se avisó al operador.'
      } else {
        changes = { status: experience.previousStatus ?? 'Borrador', previousStatus: undefined, withdrawReason: undefined }
        text = 'Experiencia restaurada al estado que tenía antes de retirarla.'
      }
      const saved = action.type === 'photo'
        ? removePhotoOf(owner, id, action.number - 1)
        : updateExperienceOf(owner, id, changes)
      setExperience(saved)
      setNotice({ type: 'success', text })
    } catch (failure) {
      setNotice({ type: 'error', text: `No se pudo guardar el cambio: ${failure.message}` })
    }
    setAction(null)
  }

  const titles = {
    photo: `Eliminar foto ${action?.number ?? ''}`,
    withdraw: 'Retirar experiencia',
    restore: 'Restaurar experiencia',
  }

  return (
    <div className="space-y-7">
      <Link to="/admin/experiencias" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Volver a Experiencias
      </Link>
      <AdminPageHeader
        title={experience.title}
        subtitle={`${experience.ownerName} · ${experience.category} · ${experience.location}`}
        action={<Pill tone={statusTone[experience.status] ?? 'neutral'}>{experience.status}</Pill>}
      />

      {notice && (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-red-900/15 bg-red-50 text-red-900'
              : 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
          }`}
        >
          {notice.text}
        </p>
      )}

      {withdrawn && (
        <p role="note" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          <strong>Retirada.</strong> Motivo: {experience.withdrawReason}
        </p>
      )}

      <section aria-labelledby="gallery-title" className="space-y-3">
        <h2 id="gallery-title" className="text-lg font-bold text-ink">Galería ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/20 bg-surface px-4 py-8 text-center text-sm text-muted">
            Esta experiencia aún no tiene fotos.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((number) => (
              <li key={number} className={`relative grid h-36 place-items-center overflow-hidden rounded-xl text-sm font-semibold text-muted ${tileColors[(number - 1) % tileColors.length]}`}>
                {experience.photos?.[number - 1] ? (
                  <img src={experience.photos[number - 1]} alt={`Foto ${number} de ${experience.title}`} className="h-full w-full object-cover" />
                ) : (
                  <span>{number === 1 ? 'Foto 1 · Portada' : `Foto ${number}`}</span>
                )}
                <button
                  type="button"
                  onClick={() => openAction('photo', { number })}
                  aria-label={`Eliminar foto ${number}`}
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
        <p className="text-sm text-muted">Precio<br /><strong className="text-ink">{formatCurrency(experience.price)} / persona</strong></p>
        <p className="text-sm text-muted">Capacidad<br /><strong className="text-ink">{experience.capacity ?? '—'} personas</strong></p>
        <p className="text-sm text-muted">Reservas<br /><strong className="text-ink">{experience.bookings ?? 0}</strong></p>
        {experience.description && <p className="text-sm text-ink sm:col-span-3">{experience.description}</p>}
      </section>

      <section aria-labelledby="map-title" className="space-y-3">
        <h2 id="map-title" className="text-lg font-bold text-ink">Ubicación</h2>
        {hasPosition ? (
          <LeafletMap position={{ lat: experience.lat, lng: experience.lng }} label={`Mapa de ${experience.title}`} className="h-64" />
        ) : (
          <p className="rounded-2xl border border-dashed border-black/20 bg-surface px-4 py-8 text-center text-sm text-muted">
            Sin ubicación en el mapa. Dirección en texto: {experience.location}.
          </p>
        )}
      </section>

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

      {action && (
        <Dialog title={titles[action.type]} onClose={() => setAction(null)}>
          <form onSubmit={confirm} noValidate className="mt-4 grid gap-4">
            <p className="text-sm text-muted">
              {action.type === 'withdraw'
                ? 'La experiencia deja de mostrarse y se cierra su disponibilidad futura. Las reservas existentes pasan a «Pendiente de decisión».'
                : action.type === 'photo'
                  ? 'La foto se elimina y el operador recibe un aviso con el motivo.'
                  : 'La experiencia vuelve al estado que tenía antes de retirarla.'}
            </p>
            <label className="grid gap-1.5 text-sm font-semibold text-ink" htmlFor="admin-reason">
              Motivo
              <textarea
                id="admin-reason"
                rows="3"
                value={reason}
                onChange={(event) => { setReason(event.target.value); setError('') }}
                className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAction(null)} className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
                Cancelar
              </button>
              <button type="submit" className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white ${action.type === 'restore' ? 'bg-brand hover:bg-brand-dark' : 'bg-danger hover:opacity-90'}`}>
                Confirmar
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}

export default AdminExperienceDetail
