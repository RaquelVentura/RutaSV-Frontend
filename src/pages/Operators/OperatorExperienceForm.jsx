//PANEL DE EXPERIENCIAS FORMULARIO
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  readOperatorCollection,
  saveOperatorCollection,
} from './operatorRepository.js'

const inputClass =
  'w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20'

function OperatorExperienceForm() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const editingId = searchParams.get('editar')
  const [experiences, setExperiences] = useState(() =>
    readOperatorCollection(user, 'experiences'),
  )
  const experience = experiences.find((item) => String(item.id) === editingId)
  const [notice, setNotice] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      title: String(formData.get('title')).trim(),
      category: String(formData.get('category')),
      location: String(formData.get('location')).trim(),
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')),
      description: String(formData.get('description')).trim(),
      status: String(formData.get('status')),
    }

    const updatedExperiences = editingId
      ? experiences.map((item) =>
          String(item.id) === editingId
            ? {
                ...item,
                ...values,
                color: values.status === 'Publicada'
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-stone-100 text-stone-700',
              }
            : item,
        )
      : [
          ...experiences,
          {
            id: `experience-${Date.now()}`,
            bookings: 0,
            color: values.status === 'Publicada'
              ? 'bg-cyan-100 text-cyan-800'
              : 'bg-stone-100 text-stone-700',
            ...values,
          },
        ]

    try {
      saveOperatorCollection(user, 'experiences', updatedExperiences)
      setExperiences(updatedExperiences)
      setNotice({
        type: 'success',
        text: 'Cambios guardados en este navegador.',
      })
    } catch (error) {
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
      </div>

      <form
        key={experience?.id ?? 'new'}
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-black/10 bg-surface p-5 shadow-sm sm:grid-cols-2 sm:p-7 lg:gap-8 lg:p-9"
      >
        <div className="sm:col-span-2">
          <label htmlFor="experience-title" className="mb-2 block text-sm font-semibold text-ink">
            Nombre de la experiencia
          </label>
          <input id="experience-title" name="title" required defaultValue={experience?.title ?? ''} className={inputClass} placeholder="Ej. Amanecer en el volcán" />
        </div>

        <div className="min-w-0">
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
          <label htmlFor="experience-location" className="mb-2 block text-sm font-semibold text-ink">
            Departamento o zona
          </label>
          <input id="experience-location" name="location" required defaultValue={experience?.location ?? ''} className={inputClass} placeholder="Ej. La Libertad" />
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

        <div className="min-w-0">
          <label htmlFor="experience-status" className="mb-2 block text-sm font-semibold text-ink">
            Estado
          </label>
          <select id="experience-status" name="status" defaultValue={experience?.status ?? 'Publicada'} className={inputClass}>
            <option>Publicada</option>
            <option>Borrador</option>
          </select>
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

        <div className="sm:col-span-2">
          <label htmlFor="experience-image" className="mb-2 block text-sm font-semibold text-ink">
            Foto principal
          </label>
          <input
            id="experience-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png"
            className="block w-full rounded-xl border border-dashed border-black/15 bg-canvas px-4 py-4 text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-info-soft file:px-4 file:py-2 file:text-xs file:font-bold file:text-brand"
          />
          <p className="mt-2 text-xs text-muted">La carga del archivo estará disponible al conectar el backend.</p>
        </div>

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

        <div className="flex flex-wrap justify-end gap-3 border-t border-black/10 pt-5 sm:col-span-2">
          <Link to="/operador/experiencias" className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
            Cancelar
          </Link>
          <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">
            {experience ? 'Guardar cambios' : 'Guardar experiencia'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OperatorExperienceForm
