//PANEL DE EXPERIENCIAS FORMULARIO
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { departmentNames, municipalitiesByDepartment } from '../../data/geo.js'
import { isInsideElSalvador } from '../../lib/geoBounds.js'
import {
  readOperatorCollection,
  saveOperatorCollection,
} from './operatorRepository.js'

const inputClass =
  'w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas disabled:text-muted'

const minPhotos = 3
const maxPhotos = 8
const maxPhotoBytes = 5 * 1024 * 1024
const acceptedTypes = ['image/jpeg', 'image/png']
const requiredSlots = ['Portada', 'Foto 2', 'Foto 3']

function previewUrl(file) {
  return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null
}

function OperatorExperienceForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editingId = searchParams.get('editar')
  const [experiences, setExperiences] = useState(() =>
    readOperatorCollection(user, 'experiences'),
  )
  const experience = experiences.find((item) => String(item.id) === editingId)
  const [notice, setNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  // Identificador de la experiencia nueva: si se vuelve a enviar, se actualiza la misma en vez de crear otra.
  const [newId] = useState(() => `experience-${Date.now()}`)

  const initialDepartment =
    experience?.department ?? (departmentNames.includes(experience?.location) ? experience.location : '')
  const [department, setDepartment] = useState(initialDepartment)
  const [photos, setPhotos] = useState([])
  const savedPhotoCount = experience?.photoCount ?? 0
  const totalPhotos = savedPhotoCount + photos.length
  const municipalities = municipalitiesByDepartment[department] ?? []
  const [position, setPosition] = useState(() =>
    typeof experience?.lat === 'number' && typeof experience?.lng === 'number'
      ? { lat: experience.lat, lng: experience.lng }
      : null,
  )
  const [coordText, setCoordText] = useState(() => ({
    lat: typeof experience?.lat === 'number' ? String(experience.lat) : '',
    lng: typeof experience?.lng === 'number' ? String(experience.lng) : '',
  }))
  // Copia de los campos para el checklist «Completa para publicar».
  const [snapshot, setSnapshot] = useState(() => ({
    title: experience?.title ?? '',
    category: experience?.category ?? '',
    municipality: experience?.municipality ?? '',
    price: String(experience?.price ?? ''),
    capacity: String(experience?.capacity ?? ''),
    description: experience?.description ?? '',
  }))

  function readSnapshot(form) {
    const data = new FormData(form)
    setSnapshot({
      title: String(data.get('title') ?? ''),
      category: String(data.get('category') ?? ''),
      municipality: String(data.get('municipality') ?? ''),
      price: String(data.get('price') ?? ''),
      capacity: String(data.get('capacity') ?? ''),
      description: String(data.get('description') ?? ''),
    })
  }

  function pickPoint(point) {
    setPosition(point)
    setCoordText({ lat: point.lat.toFixed(5), lng: point.lng.toFixed(5) })
    setNotice(null)
  }

  function typeCoordinate(axis, value) {
    const next = { ...coordText, [axis]: value }
    setCoordText(next)
    const lat = Number(next.lat)
    const lng = Number(next.lng)
    if (next.lat.trim() && next.lng.trim() && Number.isFinite(lat) && Number.isFinite(lng)) {
      setPosition({ lat, lng })
    } else {
      setPosition(null)
    }
  }

  const locationOutside = position !== null && !isInsideElSalvador(position)
  const checklist = [
    { label: 'Nombre de la experiencia', done: snapshot.title.trim() !== '' },
    { label: 'Categoría', done: snapshot.category !== '' },
    { label: 'Departamento y municipio', done: department !== '' && snapshot.municipality !== '' },
    { label: 'Precio mayor que 0', done: Number(snapshot.price) > 0 },
    { label: 'Capacidad de al menos 1 persona', done: Number(snapshot.capacity) >= 1 },
    { label: 'Descripción', done: snapshot.description.trim() !== '' },
    { label: `Mínimo ${minPhotos} fotos`, done: totalPhotos >= minPhotos },
    { label: 'Ubicación dentro de El Salvador', done: isInsideElSalvador(position) },
  ]
  const missing = checklist.filter((item) => !item.done)

  // Libera las vistas previas al salir o al cambiar de fotos.
  useEffect(
    () => () => {
      photos.forEach((photo) => photo.url && URL.revokeObjectURL(photo.url))
    },
    [photos],
  )

  function handlePhotos(event) {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ''
    const problems = []
    const accepted = []

    for (const file of chosen) {
      if (!acceptedTypes.includes(file.type)) {
        problems.push(`«${file.name}» no es JPG ni PNG.`)
      } else if (file.size > maxPhotoBytes) {
        problems.push(`«${file.name}» supera los 5 MB.`)
      } else if (savedPhotoCount + photos.length + accepted.length >= maxPhotos) {
        problems.push(`Solo puedes tener hasta ${maxPhotos} fotos por experiencia.`)
        break
      } else {
        accepted.push({ file, url: previewUrl(file) })
      }
    }

    setPhotos((current) => [...current, ...accepted])
    setNotice(problems.length > 0 ? { type: 'error', text: problems.join(' ') } : null)
  }

  // La primera foto es la portada: se puede mover o elegir otra como portada.
  function movePhoto(index, direction) {
    setPhotos((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function makeCover(index) {
    setPhotos((current) => [current[index], ...current.filter((_, position) => position !== index)])
  }

  function removePhoto(index) {
    setPhotos((current) => current.filter((_, position) => position !== index))
    setNotice(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    const form = event.currentTarget
    const publishing = (event.nativeEvent.submitter?.value ?? 'Publicada') === 'Publicada'
    const formData = new FormData(form)
    const title = String(formData.get('title')).trim()

    if (publishing) {
      if (missing.length > 0) {
        setNotice({
          type: 'error',
          text: `Completa para publicar: ${missing.map((item) => item.label.toLocaleLowerCase()).join(', ')}.`,
        })
        return
      }
    } else if (!title) {
      setNotice({ type: 'error', text: 'Escribe el nombre de la experiencia para guardar el borrador.' })
      form.elements.title.focus()
      return
    }

    const municipality = String(formData.get('municipality') ?? '')
    const departmentValue = String(formData.get('department') ?? '')
    const status = publishing ? 'Publicada' : 'Borrador'
    const values = {
      title,
      category: String(formData.get('category') ?? ''),
      department: departmentValue,
      municipality,
      location: [municipality, departmentValue].filter(Boolean).join(', '),
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')),
      description: String(formData.get('description')).trim(),
      photoCount: totalPhotos,
      lat: position?.lat ?? null,
      lng: position?.lng ?? null,
      status,
    }
    const color = status === 'Publicada' ? 'bg-cyan-100 text-cyan-800' : 'bg-stone-100 text-stone-700'

    const updatedExperiences = editingId
      ? experiences.map((item) =>
          String(item.id) === editingId ? { ...item, ...values, color } : item,
        )
      : experiences.some((item) => item.id === newId)
        ? experiences.map((item) => (item.id === newId ? { ...item, ...values, color } : item))
        : [...experiences, { id: newId, bookings: 0, color, ...values }]

    try {
      setSaving(true)
      saveOperatorCollection(user, 'experiences', updatedExperiences)
      setExperiences(updatedExperiences)
      const text = editingId
        ? `Cambios guardados en «${values.title}».`
        : publishing
          ? `«${values.title}» quedó publicada.`
          : `Borrador «${values.title}» guardado.`
      navigate('/operador/experiencias', { state: { notice: text } })
    } catch (error) {
      setSaving(false)
      setNotice({
        type: 'error',
        text: `No se pudieron guardar los cambios: ${error.message}`,
      })
    }
  }

  if (editingId && !experience) {
    return (
      <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-2xl font-bold text-ink">No encontramos esa experiencia</h1>
        <Link to="/operador/experiencias" className="font-semibold text-brand hover:underline">
          Volver a mis experiencias
        </Link>
      </div>
    )
  }

  const slots = Math.max(requiredSlots.length - savedPhotoCount, photos.length)
  const photoCounter =
    totalPhotos >= minPhotos
      ? `${totalPhotos} fotos · Máximo ${maxPhotos} por experiencia`
      : `${totalPhotos} de ${minPhotos} fotos mínimas · Máximo ${maxPhotos} por experiencia · Faltan ${minPhotos - totalPhotos} para poder publicar`

  return (
    <div className="w-full space-y-7 lg:space-y-9">
      <div>
        <Link to="/operador/experiencias" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Volver a mis experiencias
        </Link>
        <p className="mt-5 text-sm font-medium text-brand">
          {experience ? 'Actualiza los detalles de tu actividad' : 'Comparte una nueva aventura'}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
          {experience ? 'Editar experiencia' : 'Publicar experiencia'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Completa los datos, sube mínimo {minPhotos} fotos y publícala.
        </p>
      </div>

      <form
        key={experience?.id ?? 'new'}
        onSubmit={handleSubmit}
        onChange={(event) => readSnapshot(event.currentTarget)}
        noValidate
        className="grid gap-6 rounded-2xl border border-black/10 bg-surface p-5 shadow-sm sm:grid-cols-2 sm:p-7 lg:gap-8 lg:p-9"
      >
        <div className="sm:col-span-2">
          <label htmlFor="experience-title" className="mb-2 block text-sm font-semibold text-ink">
            Nombre de la experiencia
          </label>
          <input id="experience-title" name="title" required defaultValue={experience?.title ?? ''} className={inputClass} placeholder="Ej. Amanecer en el volcán" />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="experience-category" className="mb-2 block text-sm font-semibold text-ink">
            Categoría
          </label>
          <select id="experience-category" name="category" required defaultValue={experience?.category ?? ''} className={inputClass}>
            <option value="" disabled>Selecciona una categoría</option>
            <option>Aventura</option>
            <option>Naturaleza</option>
            <option>Cultura y café</option>
            <option>Gastronomía</option>
            <option>Playa</option>
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="experience-department" className="mb-2 block text-sm font-semibold text-ink">
            Departamento
          </label>
          <select
            id="experience-department"
            name="department"
            required
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value)
              setSnapshot((current) => ({ ...current, municipality: '' }))
            }}
            className={inputClass}
          >
            <option value="" disabled>Selecciona un departamento</option>
            {departmentNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="experience-municipality" className="mb-2 block text-sm font-semibold text-ink">
            Municipio
          </label>
          <select
            id="experience-municipality"
            name="municipality"
            required
            disabled={!department}
            defaultValue={department === initialDepartment ? (experience?.municipality ?? '') : ''}
            key={department}
            className={inputClass}
          >
            <option value="" disabled>
              {department ? 'Selecciona un municipio' : 'Elige primero un departamento'}
            </option>
            {municipalities.map((name) => (
              <option key={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">El municipio se habilita al elegir el departamento.</p>
        </div>

        <div className="min-w-0">
          <label htmlFor="experience-price" className="mb-2 block text-sm font-semibold text-ink">
            Precio por persona (USD)
          </label>
          <input id="experience-price" name="price" type="number" min="1" step="0.01" required defaultValue={experience?.price ?? ''} className={inputClass} placeholder="35.00" />
        </div>

        <div className="min-w-0">
          <label htmlFor="experience-capacity" className="mb-2 block text-sm font-semibold text-ink">
            Capacidad máxima
          </label>
          <input id="experience-capacity" name="capacity" type="number" min="1" required defaultValue={experience?.capacity ?? ''} className={inputClass} placeholder="8 personas" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="experience-description" className="mb-2 block text-sm font-semibold text-ink">
            Descripción
          </label>
          <textarea
            id="experience-description"
            name="description"
            rows="5"
            defaultValue={experience?.description ?? ''}
            className={`${inputClass} resize-y`}
            placeholder="¿Qué vivirán los viajeros? Incluye los detalles que hacen única tu experiencia."
          />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Ubicación</legend>
          <p className="mb-3 text-sm text-muted">
            Toca el mapa o arrastra el marcador al punto de encuentro. Es obligatoria para publicar.
          </p>
          <LeafletMap position={position} onChange={pickPoint} label="Mapa para elegir la ubicación de la experiencia" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="experience-lat" className="mb-1 block text-xs font-semibold text-ink">Latitud</label>
              <input id="experience-lat" inputMode="decimal" value={coordText.lat} onChange={(event) => typeCoordinate('lat', event.target.value)} className={inputClass} placeholder="13.69294" />
            </div>
            <div>
              <label htmlFor="experience-lng" className="mb-1 block text-xs font-semibold text-ink">Longitud</label>
              <input id="experience-lng" inputMode="decimal" value={coordText.lng} onChange={(event) => typeCoordinate('lng', event.target.value)} className={inputClass} placeholder="-89.21819" />
            </div>
          </div>
          {locationOutside && (
            <p role="alert" className="mt-2 text-xs font-semibold text-danger">
              Esa ubicación queda fuera de El Salvador. Elige un punto dentro del país.
            </p>
          )}
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Fotos de la experiencia</legend>
          <p className="mb-3 text-sm text-muted">
            Sube mínimo {minPhotos} fotos (máximo {maxPhotos}). La primera será la portada
            {experience ? '; puedes agregar más al editarla.' : '; podrás agregar más al editarla.'}
          </p>
          {savedPhotoCount > 0 && (
            <p className="mb-3 text-xs text-muted">
              Esta experiencia ya tiene {savedPhotoCount} {savedPhotoCount === 1 ? 'foto guardada' : 'fotos guardadas'}.
            </p>
          )}

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: slots }, (_, index) => {
              const photo = photos[index]
              const label = savedPhotoCount === 0 ? (requiredSlots[index] ?? `Foto ${index + 1}`) : `Foto nueva ${index + 1}`
              return (
                <li
                  key={index}
                  className={`relative flex h-32 items-center justify-center overflow-hidden rounded-xl text-center ${
                    photo ? 'border border-black/10' : 'border-2 border-dashed border-black/15 bg-canvas'
                  }`}
                >
                  {photo ? (
                    <>
                      {photo.url ? (
                        <img src={photo.url} alt={`${label}: ${photo.file.name}`} className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-2 text-xs text-ink">{photo.file.name}</span>
                      )}
                      {index === 0 && savedPhotoCount === 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        aria-label={`Quitar ${photo.file.name}`}
                        className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-red-700 shadow-sm"
                      >
                        Quitar
                      </button>
                      {photos.length > 1 && (
                        <span className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                          <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label={`Mover ${photo.file.name} antes`} className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink shadow-sm disabled:opacity-40">
                            ←
                          </button>
                          {index > 0 && savedPhotoCount === 0 && (
                            <button type="button" onClick={() => makeCover(index)} aria-label={`Hacer portada ${photo.file.name}`} className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brand shadow-sm">
                              Hacer portada
                            </button>
                          )}
                          <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} aria-label={`Mover ${photo.file.name} después`} className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink shadow-sm disabled:opacity-40">
                            →
                          </button>
                        </span>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('experience-photos')?.click()}
                      disabled={totalPhotos >= maxPhotos}
                      aria-label={`Agregar foto: ${label}`}
                      className="flex h-full w-full flex-col items-center justify-center transition hover:bg-info-soft focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <span className="text-2xl font-bold text-brand" aria-hidden="true">+</span>
                      <span className="text-xs font-semibold text-ink">{label}</span>
                      <span className="text-[11px] text-muted">Obligatoria</span>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-3">
            <label
              htmlFor="experience-photos"
              className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-black/15 bg-canvas px-4 py-5 text-center ${
                totalPhotos >= maxPhotos ? 'pointer-events-none opacity-50' : 'hover:bg-info-soft'
              }`}
            >
              <span className="text-sm font-semibold text-brand">Agregar imágenes</span>
              <span className="mt-1 text-xs text-muted">JPG o PNG · Hasta 5 MB por imagen</span>
              <input
                id="experience-photos"
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handlePhotos}
                disabled={totalPhotos >= maxPhotos}
                className="sr-only"
              />
            </label>
            <p className={`mt-2 text-xs ${totalPhotos >= minPhotos ? 'text-muted' : 'text-pending'}`}>{photoCounter}</p>
            <p className="mt-1 text-xs text-muted">La carga de archivos estará disponible al conectar el backend.</p>
          </div>
        </fieldset>

        {notice && (
          <p
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm leading-6 sm:col-span-2 ${
              notice.type === 'error'
                ? 'border-red-900/15 bg-red-50 text-red-900'
                : 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
            }`}
          >
            {notice.text}
          </p>
        )}

        <section aria-labelledby="publish-checklist" className="rounded-xl border border-black/10 bg-canvas p-4 sm:col-span-2">
          <h2 id="publish-checklist" className="text-sm font-bold text-ink">Completa para publicar</h2>
          <p className="mt-1 text-xs text-muted">
            {missing.length === 0
              ? 'Todo listo: ya puedes publicarla.'
              : `Falta ${missing.length === 1 ? '1 requisito' : `${missing.length} requisitos`}. Mientras tanto puedes guardar un borrador.`}
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {checklist.map((item) => (
              <li key={item.label} className={`flex items-center gap-2 text-xs ${item.done ? 'text-success' : 'text-muted'}`}>
                <span aria-hidden="true">{item.done ? '✓' : '○'}</span>
                <span>
                  {item.label}
                  <span className="sr-only">{item.done ? ' (listo)' : ' (pendiente)'}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-black/10 pt-5 sm:col-span-2">
          <p className="mr-auto text-xs text-muted">
            Los horarios con cupos se definen en la sección Cupos.
          </p>
          <Link to="/operador/experiencias" className="rounded-full px-5 py-2.5 text-sm font-semibold text-brand hover:bg-info-soft">
            Cancelar
          </Link>
          <button
            type="submit"
            name="intent"
            value="Borrador"
            disabled={saving}
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Guardar borrador
          </button>
          <button type="submit" name="intent" value="Publicada" disabled={saving || missing.length > 0} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
            {experience ? 'Publicar cambios' : 'Publicar experiencia'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OperatorExperienceForm
