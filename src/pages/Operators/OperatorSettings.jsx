//PANEL CONFIGURACÓN OPERADOR 

import { useState } from 'react'

const inputClass =
  'min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

function PreferenceToggle({ id, label, defaultChecked = true }) {
  const [enabled, setEnabled] = useState(defaultChecked)

  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 border-b border-black/10 py-4 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-brand' : 'bg-slate-300'}`}>
        <input
          id={id}
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`}
        />
      </span>
    </label>
  )
}

function OperatorSettings() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('Los cambios no se guardaron porque esta vista aún no está conectada al backend.')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2 lg:gap-7">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Configuración</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Administra el perfil, los contactos y las preferencias de tu negocio.
        </p>
      </div>

      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:grid-cols-2 lg:col-span-2 lg:gap-6 lg:p-7">
        <h2 className="text-lg font-bold text-ink sm:col-span-2">Editar perfil del operador</h2>
        <label className="flex items-center gap-3">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-info-soft text-lg font-bold text-brand">
            OT
          </span>
          <span>
            <span className="block text-sm font-semibold text-brand">Agregar o cambiar imagen</span>
            <span className="mt-1 block text-xs text-muted">JPG o PNG · Máximo 5 MB</span>
          </span>
          <input type="file" accept="image/jpeg,image/png" className="sr-only" />
        </label>

        <div className="grid content-center gap-2">
          <label htmlFor="operator-business-name" className="block text-sm font-semibold text-ink">
            Nombre del negocio
          </label>
          <input id="operator-business-name" className={inputClass} defaultValue="Olas de El Tunco" />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="operator-description" className="block text-sm font-semibold text-ink">
            Descripción del operador
          </label>
          <textarea
            id="operator-description"
            rows="4"
            className={`${inputClass} min-h-28 resize-y`}
            defaultValue="Guías locales desde 2018. Compartimos nuestra pasión por el surf y la costa de El Salvador."
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="operator-location" className="block text-sm font-semibold text-ink">
            Ubicación
          </label>
          <input id="operator-location" className={inputClass} defaultValue="El Tunco, La Libertad" />
        </div>
        <p className="self-end text-xs leading-5 text-muted">
          Esta información aparece en tu perfil público.
        </p>
      </section>

      <section className="grid content-start gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-7">
        <h2 className="text-lg font-bold text-ink">Datos de contacto</h2>
        <div className="border-b border-black/10 pb-4">
          <p className="text-sm font-semibold text-ink">Correo del negocio · Principal</p>
          <p className="mt-2 text-sm text-muted">contacto@olasdeeltunco.com</p>
          <button type="button" className="mt-3 text-sm font-semibold text-brand hover:text-brand-dark">
            Editar
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">WhatsApp</p>
          <p className="mt-2 text-sm text-muted">+503 7777 2048</p>
          <div className="mt-3 flex gap-4">
            <button type="button" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Editar
            </button>
            <button type="button" className="text-sm font-semibold text-danger">
              Borrar
            </button>
          </div>
        </div>
        <button
          type="button"
          className="min-h-12 w-full rounded-xl border border-black/15 text-sm font-semibold text-brand transition hover:border-brand hover:bg-info-soft"
        >
          + Agregar contacto
        </button>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-7">
        <h2 className="text-lg font-bold text-ink">Preferencias</h2>
        <div className="mt-4 border-b border-black/10 pb-4">
          <label htmlFor="operator-language" className="mb-2 block text-sm font-semibold text-ink">
            Idioma del panel
          </label>
          <select id="operator-language" className={inputClass} defaultValue="Español">
            <option>Español</option>
            <option>English</option>
          </select>
        </div>
        <div className="mt-2">
          <PreferenceToggle id="booking-alerts" label="Avisos de reservas" />
          <PreferenceToggle id="review-alerts" label="Nuevas reseñas" />
        </div>
      </section>

      {notice && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900 lg:col-span-2">
          {notice}
        </p>
      )}
      <button
        type="submit"
        className="min-h-12 w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark lg:col-span-2"
      >
        Guardar cambios
      </button>
    </form>
  )
}

export default OperatorSettings
