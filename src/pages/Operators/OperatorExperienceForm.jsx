import { useState } from 'react'
import { Link } from 'react-router-dom'

const inputClass =
  'w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20'

function OperatorExperienceForm() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice(
      'El formulario está completo, pero la experiencia no se guardó porque esta vista aún no está conectada al backend.',
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link to="/operador/experiencias" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Volver a mis experiencias
        </Link>
        <p className="mt-4 text-sm text-muted">Comparte una nueva aventura</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
          Publicar experiencia
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-mist bg-surface p-5 sm:p-7">
        <div>
          <label htmlFor="experience-title" className="mb-2 block text-sm font-semibold text-ink">
            Nombre de la experiencia
          </label>
          <input id="experience-title" name="title" required className={inputClass} placeholder="Ej. Amanecer en el volcán" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="experience-category" className="mb-2 block text-sm font-semibold text-ink">
              Categoría
            </label>
            <select id="experience-category" name="category" required defaultValue="" className={inputClass}>
              <option value="" disabled>Selecciona una categoría</option>
              <option>Aventura</option>
              <option>Naturaleza</option>
              <option>Cultura y café</option>
              <option>Gastronomía</option>
              <option>Playa</option>
            </select>
          </div>
          <div>
            <label htmlFor="experience-location" className="mb-2 block text-sm font-semibold text-ink">
              Departamento o zona
            </label>
            <input id="experience-location" name="location" required className={inputClass} placeholder="Ej. La Libertad" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="experience-price" className="mb-2 block text-sm font-semibold text-ink">
              Precio por persona (USD)
            </label>
            <input id="experience-price" name="price" type="number" min="1" step="0.01" required className={inputClass} placeholder="35.00" />
          </div>
          <div>
            <label htmlFor="experience-capacity" className="mb-2 block text-sm font-semibold text-ink">
              Capacidad máxima
            </label>
            <input id="experience-capacity" name="capacity" type="number" min="1" required className={inputClass} placeholder="8 personas" />
          </div>
        </div>

        <div>
          <label htmlFor="experience-description" className="mb-2 block text-sm font-semibold text-ink">
            Descripción
          </label>
          <textarea
            id="experience-description"
            name="description"
            required
            rows="5"
            className={`${inputClass} resize-y`}
            placeholder="¿Qué vivirán los viajeros? Incluye los detalles que hacen única tu experiencia."
          />
        </div>

        <div>
          <label htmlFor="experience-image" className="mb-2 block text-sm font-semibold text-ink">
            Foto principal
          </label>
          <input
            id="experience-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png"
            className="block w-full rounded-xl border border-dashed border-mist bg-canvas px-4 py-4 text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-info-soft file:px-4 file:py-2 file:text-xs file:font-bold file:text-brand"
          />
          <p className="mt-2 text-xs text-muted">JPG o PNG. La carga estará disponible al conectar el backend.</p>
        </div>

        {notice && (
          <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-mist pt-5">
          <Link to="/operador/experiencias" className="rounded-full border border-mist px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
            Cancelar
          </Link>
          <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">
            Guardar experiencia
          </button>
        </div>
      </form>
    </div>
  )
}

export default OperatorExperienceForm
