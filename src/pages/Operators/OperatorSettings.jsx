import { useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-[#dce4e5] bg-white px-3 py-2.5 text-sm text-[#203940] outline-none focus:border-[#147c91] focus:ring-2 focus:ring-[#147c91]/15'

function PreferenceToggle({ id, label, defaultChecked = true }) {
  const [enabled, setEnabled] = useState(defaultChecked)

  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 py-3">
      <span className="text-sm text-[#52676d]">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-[#147c91]' : 'bg-[#cbd5d7]'}`}>
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
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h1 className="text-[26px] font-bold leading-tight text-[#203940]">Configuración</h1>
        <p className="mt-1 text-sm leading-5 text-muted">
          Administra el perfil, los contactos y las preferencias de tu negocio.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-[#e1e8e9] bg-white p-4 lg:col-span-2">
        <h2 className="text-lg font-bold text-[#203940]">Editar perfil del operador</h2>
        <label className="flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#eaf5f6] font-bold text-[#147c91]">
            OT
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#147c91]">Agregar o cambiar imagen</span>
            <span className="mt-1 block text-xs text-muted">JPG o PNG · Máximo 5 MB</span>
          </span>
          <input type="file" accept="image/jpeg,image/png" className="sr-only" />
        </label>

        <div className="space-y-2">
          <label htmlFor="operator-business-name" className="block text-sm font-semibold text-[#203940]">
            Nombre del negocio
          </label>
          <input id="operator-business-name" className={inputClass} defaultValue="Olas de El Tunco" />
        </div>

        <div className="space-y-2">
          <label htmlFor="operator-description" className="block text-sm font-semibold text-[#203940]">
            Descripción del operador
          </label>
          <textarea
            id="operator-description"
            rows="3"
            className={`${inputClass} resize-y`}
            defaultValue="Guías locales desde 2018. Compartimos nuestra pasión por el surf y la costa de El Salvador."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="operator-location" className="block text-sm font-semibold text-[#203940]">
            Ubicación
          </label>
          <input id="operator-location" className={inputClass} defaultValue="El Tunco, La Libertad" />
        </div>
        <p className="text-xs leading-5 text-muted">Esta información aparece en tu perfil público.</p>
      </section>

      <section className="space-y-4 rounded-xl border border-[#e1e8e9] bg-white p-4">
        <h2 className="text-lg font-bold text-[#203940]">Datos de contacto</h2>
        <div className="border-b border-[#e7eded] pb-3">
          <p className="text-sm font-semibold text-[#203940]">Correo del negocio · Principal</p>
          <p className="mt-1 text-sm text-[#52676d]">contacto@olasdeeltunco.com</p>
          <button type="button" className="mt-2 text-sm font-semibold text-[#147c91]">Editar</button>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#203940]">WhatsApp</p>
          <p className="mt-1 text-sm text-[#52676d]">+503 7777 2048</p>
          <div className="mt-2 flex gap-4">
            <button type="button" className="text-sm font-semibold text-[#147c91]">Editar</button>
            <button type="button" className="text-sm font-semibold text-[#b42318]">Borrar</button>
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-lg border border-[#dce4e5] py-2.5 text-sm font-semibold text-[#147c91] hover:bg-[#f3f8f8]"
        >
          + Agregar contacto
        </button>
      </section>

      <section className="rounded-xl border border-[#e1e8e9] bg-white p-4">
        <h2 className="text-lg font-bold text-[#203940]">Preferencias</h2>
        <div className="border-b border-[#e7eded] py-3">
          <label htmlFor="operator-language" className="mb-2 block text-sm font-semibold text-[#203940]">
            Idioma del panel
          </label>
          <select id="operator-language" className={inputClass} defaultValue="Español">
            <option>Español</option>
            <option>English</option>
          </select>
        </div>
        <PreferenceToggle id="booking-alerts" label="Avisos de reservas" />
        <PreferenceToggle id="review-alerts" label="Nuevas reseñas" />
      </section>

      {notice && (
        <p role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900 lg:col-span-2">
          {notice}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-lg bg-[#147c91] px-4 py-3 text-sm font-bold text-white hover:bg-[#066a82] lg:col-span-2"
      >
        Guardar cambios
      </button>
    </form>
  )
}

export default OperatorSettings
