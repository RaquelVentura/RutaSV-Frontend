import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import {
  createExperience,
  extractApiError,
  getCategories,
  getDepartments,
  getExperienceBySlugOrId,
  getMunicipalities,
  publishExperience,
  resolveAssetUrl,
  updateExperience,
  uploadExperienceImage,
} from '../../lib/catalogApi.js'
import { isInsideElSalvador } from '../../lib/geoBounds.js'
import { notify } from '../../lib/notify.js'

const maxPhotos = 8
const maxPhotoBytes = 5 * 1024 * 1024

const emptyForm = {
  title: '',
  shortDescription: '',
  description: '',
  includes: '',
  excludes: '',
  whatToBring: '',
  price: '25',
  durationMinutes: '180',
  difficulty: 'FACIL',
  minAge: '',
  serviceLanguage: 'Español',
  hasLimitedCapacity: true,
  minPeople: '1',
  maxPeople: '10',
  departmentId: '',
  municipalityId: '',
  referenceAddress: '',
  latitude: 13.6929,
  longitude: -89.2182,
  autoConfirmation: true,
  categoryIds: [],
  primaryCategoryId: null,
}

function OperatorExperienceForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('editar') || ''
  const isEditing = Boolean(editId)

  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [currentStatus, setCurrentStatus] = useState('BORRADOR')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [missingFields, setMissingFields] = useState([])

  useEffect(() => {
    let cancelled = false
    async function init() {
      setLoading(true)
      try {
        const [cats, depts] = await Promise.all([getCategories(), getDepartments()])
        if (cancelled) return
        setCategories(cats)
        setDepartments(depts)

        if (editId) {
          const existing = await getExperienceBySlugOrId(editId)
          if (cancelled) return
          const deptId = existing.departmentId ? String(existing.departmentId) : ''
          if (deptId) {
            const muns = await getMunicipalities(Number(deptId))
            if (!cancelled) setMunicipalities(muns)
          }
          setCurrentStatus(existing.status || 'BORRADOR')
          setForm({
            title: existing.title ?? '',
            shortDescription: existing.shortDescription ?? '',
            description: existing.description ?? '',
            includes: existing.includes ?? '',
            excludes: existing.excludes ?? '',
            whatToBring: existing.whatToBring ?? '',
            price: String(existing.price ?? 0),
            durationMinutes: existing.durationMinutes ? String(existing.durationMinutes) : '',
            difficulty: existing.difficulty ?? '',
            minAge: existing.minAge != null ? String(existing.minAge) : '',
            serviceLanguage: existing.serviceLanguage ?? 'Español',
            hasLimitedCapacity: Boolean(existing.hasLimitedCapacity),
            minPeople: String(existing.minPeople ?? 1),
            maxPeople: existing.maxPeople != null ? String(existing.maxPeople) : '10',
            departmentId: deptId,
            municipalityId: existing.municipalityId ? String(existing.municipalityId) : '',
            referenceAddress: existing.referenceAddress ?? '',
            latitude: Number(existing.latitude ?? 13.6929),
            longitude: Number(existing.longitude ?? -89.2182),
            autoConfirmation: Boolean(existing.autoConfirmation),
            categoryIds: (existing.categories ?? []).map((c) => c.id),
            primaryCategoryId:
              existing.categories?.find((c) => c.isPrimary)?.id ??
              existing.categories?.[0]?.id ??
              null,
          })
          setImages(
            (existing.images ?? []).map((img, idx) => ({
              objectKey: img.objectKey || '',
              url: img.url || '',
              altText: img.altText || '',
              sortOrder: img.sortOrder ?? idx,
              isCover: Boolean(img.isCover),
            })),
          )
        }
      } catch (error) {
        if (!cancelled) {
          setErrorBanner(extractApiError(error, 'No se pudo cargar el formulario de experiencia.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [editId])

  async function handleDepartmentChange(deptId) {
    setForm((prev) => ({ ...prev, departmentId: deptId, municipalityId: '' }))
    if (!deptId) {
      setMunicipalities([])
      return
    }
    try {
      const muns = await getMunicipalities(Number(deptId))
      setMunicipalities(muns)
    } catch {
      setMunicipalities([])
    }
  }

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleCategory(catId) {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(catId)
      const nextIds = exists
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId]
      const nextPrimary = nextIds.includes(prev.primaryCategoryId)
        ? prev.primaryCategoryId
        : (nextIds[0] ?? null)
      return { ...prev, categoryIds: nextIds, primaryCategoryId: nextPrimary }
    })
  }

  async function handleFileSelection(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    if (images.length + files.length > maxPhotos) {
      notify.error(`Puedes subir un máximo de ${maxPhotos} fotografías.`)
      return
    }

    setUploading(true)
    setErrorBanner('')
    try {
      const uploaded = []
      for (const file of files) {
        if (file.size > maxPhotoBytes) {
          throw new Error(`"${file.name}" supera el límite de 5 MB.`)
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error(`"${file.name}" debe ser JPG, PNG o WEBP.`)
        }
        const res = await uploadExperienceImage(file)
        uploaded.push({
          objectKey: res.objectKey,
          url: res.url,
          altText: form.title || file.name,
          isCover: false,
        })
      }

      setImages((prev) => {
        const merged = [...prev, ...uploaded].map((img, idx) => ({
          ...img,
          sortOrder: idx,
        }))
        if (merged.length > 0 && !merged.some((i) => i.isCover)) {
          merged[0].isCover = true
        }
        return merged
      })
      notify.success(`${uploaded.length} foto(s) subida(s) correctamente.`)
    } catch (error) {
      notify.error(extractApiError(error, error?.message || 'Error al subir fotografía.').message)
    } finally {
      setUploading(false)
    }
  }

  function setCoverPhoto(index) {
    setImages((prev) => prev.map((img, idx) => ({ ...img, isCover: idx === index })))
  }

  function removePhoto(index) {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== index).map((img, idx) => ({ ...img, sortOrder: idx }))
      if (next.length > 0 && !next.some((i) => i.isCover)) {
        next[0].isCover = true
      }
      return next
    })
  }

  const checklist = useMemo(() => {
    const insideSv = isInsideElSalvador(Number(form.latitude), Number(form.longitude))
    const priceValid = form.price !== '' && Number(form.price) >= 0
    const minP = Number(form.minPeople || 0)
    const maxP = Number(form.maxPeople || 0)
    const capacityValid = minP >= 1 && (!form.hasLimitedCapacity || maxP >= minP)
    const hasCoverPhoto = images.length >= 1 && images.some((i) => i.isCover)

    return [
      { label: 'Título y resumen comercial', ok: Boolean(form.title.trim() && form.shortDescription.trim()) },
      { label: 'Descripción detallada (mínimo 20 caracteres)', ok: form.description.trim().length >= 20 },
      { label: 'Al menos una categoría seleccionada', ok: form.categoryIds.length >= 1 },
      { label: 'Municipio y ubicación dentro de El Salvador', ok: Boolean(form.municipalityId) && insideSv },
      { label: 'Precio y capacidad configurados correctamente', ok: priceValid && capacityValid },
      { label: 'Al menos 1 fotografía con portada (máx. 8, 5 MB c/u)', ok: hasCoverPhoto },
    ]
  }, [form, images])

  const readyToPublish = checklist.every((item) => item.ok)

  async function handleSave(publishNow) {
    setErrorBanner('')
    setMissingFields([])

    if (!form.title.trim() || !form.shortDescription.trim() || !form.description.trim()) {
      setErrorBanner('Completa título, descripción corta y descripción detallada.')
      return
    }
    if (!form.municipalityId) {
      setErrorBanner('Selecciona un departamento y un municipio.')
      return
    }

    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      includes: form.includes.trim() || null,
      excludes: form.excludes.trim() || null,
      whatToBring: form.whatToBring.trim() || null,
      price: Number(form.price || 0),
      currency: 'USD',
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
      difficulty: form.difficulty || null,
      minAge: form.minAge !== '' ? Number(form.minAge) : null,
      serviceLanguage: form.serviceLanguage.trim() || null,
      hasLimitedCapacity: form.hasLimitedCapacity,
      minPeople: Number(form.minPeople || 1),
      maxPeople: form.hasLimitedCapacity ? Number(form.maxPeople || 10) : null,
      municipalityId: Number(form.municipalityId),
      referenceAddress: form.referenceAddress.trim() || null,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      autoConfirmation: form.autoConfirmation,
      categoryIds: form.categoryIds,
      primaryCategoryId: form.primaryCategoryId,
      images: images.map((img, idx) => ({
        objectKey: img.objectKey || null,
        url: img.url || null,
        altText: img.altText || form.title.trim(),
        sortOrder: idx,
        isCover: Boolean(img.isCover),
      })),
    }

    setSubmitting(true)
    try {
      if (isEditing) {
        const updated = await updateExperience(editId, payload)
        if (publishNow && updated.status !== 'PUBLICADA') {
          await publishExperience(updated.id)
        }
        notify.success(publishNow ? 'Experiencia actualizada y publicada.' : 'Cambios guardados.')
      } else {
        await createExperience({ ...payload, publishImmediately: publishNow })
        notify.success(publishNow ? 'Experiencia publicada en el catálogo.' : 'Borrador guardado.')
      }
      navigate('/operador/experiencias')
    } catch (error) {
      const parsed = extractApiError(error, 'No se pudo guardar la experiencia.')
      setErrorBanner(parsed.message)
      setMissingFields(parsed.missingFields)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-surface" />
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/operador/experiencias" className="text-xs font-semibold text-brand hover:underline">
            ← Volver a Mis experiencias
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-ink">
            {isEditing ? 'Editar experiencia' : 'Nueva experiencia turística'}
          </h1>
        </div>
      </header>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <p className="font-semibold">{errorBanner}</p>
          {missingFields.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {missingFields.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Información general */}
          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">1. Información principal</h2>
            <div>
              <label htmlFor="exp-title" className="mb-1 block text-xs font-semibold text-muted">
                Título de la experiencia *
              </label>
              <input
                id="exp-title"
                type="text"
                maxLength={150}
                value={form.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ej. Clase de surf al atardecer en Playa El Tunco"
                className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div>
              <label htmlFor="exp-short" className="mb-1 block text-xs font-semibold text-muted">
                Descripción corta (máx. 300 caracteres) *
              </label>
              <input
                id="exp-short"
                type="text"
                maxLength={300}
                value={form.shortDescription}
                onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                placeholder="Resumen atractivo que aparece en las tarjetas del catálogo"
                className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div>
              <label htmlFor="exp-desc" className="mb-1 block text-xs font-semibold text-muted">
                Descripción detallada (mín. 20 caracteres para publicar) *
              </label>
              <textarea
                id="exp-desc"
                rows={4}
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Cuenta el itinerario, puntos destacados y qué hace única esta experiencia..."
                className="w-full rounded-xl border border-mist bg-canvas p-3.5 text-sm text-ink"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Categorías *</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const active = form.categoryIds.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-brand text-white'
                          : 'border border-mist bg-canvas text-ink hover:border-brand'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="exp-includes" className="mb-1 block text-xs font-semibold text-muted">
                  Qué incluye
                </label>
                <textarea
                  id="exp-includes"
                  rows={3}
                  value={form.includes}
                  onChange={(e) => handleFieldChange('includes', e.target.value)}
                  placeholder="Un elemento por línea"
                  className="w-full rounded-xl border border-mist bg-canvas p-3 text-xs text-ink"
                />
              </div>
              <div>
                <label htmlFor="exp-excludes" className="mb-1 block text-xs font-semibold text-muted">
                  No incluye
                </label>
                <textarea
                  id="exp-excludes"
                  rows={3}
                  value={form.excludes}
                  onChange={(e) => handleFieldChange('excludes', e.target.value)}
                  placeholder="Un elemento por línea"
                  className="w-full rounded-xl border border-mist bg-canvas p-3 text-xs text-ink"
                />
              </div>
              <div>
                <label htmlFor="exp-bring" className="mb-1 block text-xs font-semibold text-muted">
                  Qué llevar
                </label>
                <textarea
                  id="exp-bring"
                  rows={3}
                  value={form.whatToBring}
                  onChange={(e) => handleFieldChange('whatToBring', e.target.value)}
                  placeholder="Bloqueador, agua, calzado cómodo..."
                  className="w-full rounded-xl border border-mist bg-canvas p-3 text-xs text-ink"
                />
              </div>
            </div>
          </section>

          {/* Precio, capacidad y logística */}
          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">2. Precio, cupos y logística</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="exp-price" className="mb-1 block text-xs font-semibold text-muted">
                  Precio USD *
                </label>
                <input
                  id="exp-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="exp-duration" className="mb-1 block text-xs font-semibold text-muted">
                  Duración (min)
                </label>
                <input
                  id="exp-duration"
                  type="number"
                  min="15"
                  value={form.durationMinutes}
                  onChange={(e) => handleFieldChange('durationMinutes', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="exp-difficulty" className="mb-1 block text-xs font-semibold text-muted">
                  Dificultad
                </label>
                <select
                  id="exp-difficulty"
                  value={form.difficulty}
                  onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                >
                  <option value="">No aplica</option>
                  <option value="FACIL">Fácil</option>
                  <option value="MODERADA">Moderada</option>
                  <option value="DIFICIL">Difícil</option>
                </select>
              </div>
              <div>
                <label htmlFor="exp-lang" className="mb-1 block text-xs font-semibold text-muted">
                  Idioma
                </label>
                <input
                  id="exp-lang"
                  type="text"
                  value={form.serviceLanguage}
                  onChange={(e) => handleFieldChange('serviceLanguage', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="exp-min" className="mb-1 block text-xs font-semibold text-muted">
                  Mínimo de personas *
                </label>
                <input
                  id="exp-min"
                  type="number"
                  min="1"
                  value={form.minPeople}
                  onChange={(e) => handleFieldChange('minPeople', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="exp-max" className="mb-1 block text-xs font-semibold text-muted">
                  Máximo de personas
                </label>
                <input
                  id="exp-max"
                  type="number"
                  min="1"
                  disabled={!form.hasLimitedCapacity}
                  value={form.maxPeople}
                  onChange={(e) => handleFieldChange('maxPeople', e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink disabled:opacity-40"
                />
              </div>
              <div>
                <label htmlFor="exp-age" className="mb-1 block text-xs font-semibold text-muted">
                  Edad mínima
                </label>
                <input
                  id="exp-age"
                  type="number"
                  min="0"
                  value={form.minAge}
                  onChange={(e) => handleFieldChange('minAge', e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1 text-sm">
              <label className="flex items-center gap-2 font-medium text-ink">
                <input
                  type="checkbox"
                  checked={form.hasLimitedCapacity}
                  onChange={(e) => handleFieldChange('hasLimitedCapacity', e.target.checked)}
                />
                Cupo limitado por reserva
              </label>
              <label className="flex items-center gap-2 font-medium text-ink">
                <input
                  type="checkbox"
                  checked={form.autoConfirmation}
                  onChange={(e) => handleFieldChange('autoConfirmation', e.target.checked)}
                />
                Confirmación automática al reservar (RF-O09)
              </label>
            </div>
          </section>

          {/* Ubicación */}
          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">3. Ubicación en El Salvador</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="exp-dept" className="mb-1 block text-xs font-semibold text-muted">
                  Departamento *
                </label>
                <select
                  id="exp-dept"
                  value={form.departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2.5 text-sm text-ink"
                >
                  <option value="">Selecciona un departamento</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="exp-muni" className="mb-1 block text-xs font-semibold text-muted">
                  Municipio *
                </label>
                <select
                  id="exp-muni"
                  value={form.municipalityId}
                  onChange={(e) => handleFieldChange('municipalityId', e.target.value)}
                  disabled={municipalities.length === 0}
                  className="w-full rounded-xl border border-mist bg-canvas px-3 py-2.5 text-sm text-ink disabled:opacity-50"
                >
                  <option value="">Selecciona un municipio</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="exp-address" className="mb-1 block text-xs font-semibold text-muted">
                Dirección de referencia / punto de encuentro
              </label>
              <input
                id="exp-address"
                type="text"
                maxLength={300}
                value={form.referenceAddress}
                onChange={(e) => handleFieldChange('referenceAddress', e.target.value)}
                placeholder="Ej. Calle principal de Playa El Tunco, frente al malecón"
                className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted">
                Haz clic en el mapa o arrastra el pin para fijar el punto exacto ({Number(form.latitude).toFixed(5)},{' '}
                {Number(form.longitude).toFixed(5)}).
              </p>
              <LeafletMap
                position={{ lat: Number(form.latitude), lng: Number(form.longitude) }}
                onChange={(pos) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude: Number(pos.lat.toFixed(6)),
                    longitude: Number(pos.lng.toFixed(6)),
                  }))
                }
                label="Selector de ubicación de la experiencia"
                className="h-72"
              />
            </div>
          </section>

          {/* Galería de fotografías */}
          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">4. Galería de fotografías</h2>
                <p className="text-xs text-muted">
                  Mínimo 1 foto con portada para publicar, máximo {maxPhotos} fotos (JPG, PNG o WEBP, hasta 5 MB c/u).
                </p>
              </div>
              <label className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark">
                {uploading ? 'Subiendo...' : '+ Subir fotos'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading || images.length >= maxPhotos}
                  onChange={handleFileSelection}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mist bg-canvas p-8 text-center text-xs text-muted">
                Aún no has cargado fotografías. Sube al menos 1 imagen para poder publicar.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {images.map((img, idx) => (
                  <div
                    key={`${img.objectKey || img.url}-${idx}`}
                    className={`overflow-hidden rounded-xl border ${
                      img.isCover ? 'border-brand ring-2 ring-brand/30' : 'border-mist'
                    }`}
                  >
                    <img
                      src={resolveAssetUrl(img.url)}
                      alt={img.altText || `Foto ${idx + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex items-center justify-between bg-canvas p-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setCoverPhoto(idx)}
                        className={`font-semibold ${img.isCover ? 'text-brand' : 'text-muted hover:text-ink'}`}
                      >
                        {img.isCover ? '★ Portada' : 'Usar portada'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="font-semibold text-danger hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Checklist RN-23 y acciones */}
        <aside className="h-fit space-y-5 rounded-2xl border border-mist bg-surface p-6 lg:sticky lg:top-6">
          <div>
            <p className="text-xs font-bold uppercase text-brand">Validación RN-23</p>
            <h2 className="mt-1 text-lg font-bold text-ink">Checklist de publicación</h2>
            <ul className="mt-3 space-y-2.5 text-xs">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className={item.ok ? 'font-bold text-emerald-600' : 'text-muted'}>
                    {item.ok ? '✓' : '○'}
                  </span>
                  <span className={item.ok ? 'text-ink' : 'text-muted'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 border-t border-mist pt-4">
            <button
              type="button"
              disabled={submitting || uploading}
              onClick={() => handleSave(true)}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting
                ? 'Guardando...'
                : isEditing && currentStatus === 'PUBLICADA'
                  ? 'Guardar cambios'
                  : 'Guardar y publicar'}
            </button>

            {(!isEditing || currentStatus !== 'PUBLICADA') && (
              <button
                type="button"
                disabled={submitting || uploading}
                onClick={() => handleSave(false)}
                className="w-full rounded-full border border-mist bg-canvas px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand disabled:opacity-50"
              >
                Guardar como borrador
              </button>
            )}

            {!readyToPublish && (
              <p className="text-xs text-muted">
                Puedes guardar como borrador en cualquier momento; para publicar se validarán todos los puntos del checklist.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default OperatorExperienceForm
