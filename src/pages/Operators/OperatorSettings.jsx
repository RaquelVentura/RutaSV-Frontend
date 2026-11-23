//PANEL CONFIGURACÓN OPERADOR

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { departmentNames, municipalitiesByDepartment } from '../../data/geo.js'
import { readOperatorProfile, saveOperatorProfile } from './operatorRepository.js'

const inputClass =
  'min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-danger'

const maxLogoBytes = 5 * 1024 * 1024
const logoTypes = ['image/jpeg', 'image/png']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function FieldError({ id, children }) {
  return children ? (
    <p id={id} role="alert" className="text-xs font-semibold text-danger">
      {children}
    </p>
  ) : null
}

function validate(values) {
  const errors = {}
  if (!values.businessName.trim()) errors.businessName = 'Escribe el nombre del negocio.'
  if (!values.department) errors.department = 'Elige el departamento.'
  if (!values.municipality) errors.municipality = 'Elige el municipio.'
  if (!values.address.trim()) errors.address = 'Escribe la dirección.'
  if (!emailPattern.test(values.email.trim())) errors.email = 'Escribe un correo válido.'
  if (values.whatsapp.trim() && !/^\+?[\d\s-]{8,16}$/.test(values.whatsapp.trim())) {
    errors.whatsapp = 'Escribe un teléfono válido, por ejemplo +503 7777 2048.'
  }
  return errors
}

function OperatorSettings() {
  const { user } = useAuth()
  const [values, setValues] = useState(() => {
    try {
      return { ...readOperatorProfile(user), loadError: '' }
    } catch (error) {
      return { ...readOperatorProfile(null), loadError: error.message }
    }
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: 'idle', text: '' })
  const [logo, setLogo] = useState({ url: '', name: values.logoName ?? '' })

  // Libera la vista previa del logo al cambiarlo o salir.
  useEffect(() => () => {
    if (logo.url) URL.revokeObjectURL(logo.url)
  }, [logo.url])

  const municipalities = municipalitiesByDepartment[values.department] ?? []
  const initials = values.businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toLocaleUpperCase())
    .join('')

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatus({ type: 'idle', text: '' })
  }

  function handleLogo(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!logoTypes.includes(file.type)) {
      setStatus({ type: 'error', text: `«${file.name}» no es JPG ni PNG.` })
      return
    }
    if (file.size > maxLogoBytes) {
      setStatus({ type: 'error', text: `«${file.name}» supera los 5 MB.` })
      return
    }
    const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''
    setLogo({ url, name: file.name })
    setStatus({ type: 'idle', text: '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status.type === 'saving') return
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus({ type: 'error', text: 'Revisa los campos marcados antes de guardar.' })
      return
    }
    setStatus({ type: 'saving', text: 'Guardando cambios…' })
    try {
      await Promise.resolve()
      saveOperatorProfile(user, {
        businessName: values.businessName.trim(),
        description: values.description.trim(),
        department: values.department,
        municipality: values.municipality,
        address: values.address.trim(),
        email: values.email.trim(),
        whatsapp: values.whatsapp.trim(),
        logoName: logo.name,
      })
      setStatus({ type: 'success', text: 'Cambios guardados en este navegador.' })
    } catch (error) {
      setStatus({ type: 'error', text: `No se pudieron guardar los cambios: ${error.message}` })
    }
  }

  const saving = status.type === 'saving'

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-2 lg:gap-7">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Configuración</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Administra el perfil, los contactos y las preferencias de tu negocio.
        </p>
      </div>

      {values.loadError && (
        <p role="alert" className="rounded-xl border border-red-900/15 bg-red-50 px-4 py-3 text-sm text-red-900 lg:col-span-2">
          No pudimos cargar tus datos guardados ({values.loadError}). Se muestran los valores de ejemplo.
        </p>
      )}

      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:grid-cols-2 lg:col-span-2 lg:gap-6 lg:p-7">
        <h2 className="text-lg font-bold text-ink sm:col-span-2">Editar perfil del operador</h2>
        <div className="flex items-center gap-3">
          {logo.url ? (
            <img src={logo.url} alt={`Logo de ${values.businessName}`} className="h-16 w-16 shrink-0 rounded-full border border-black/10 object-cover" />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-info-soft text-lg font-bold text-brand" aria-hidden="true">
              {initials || 'OP'}
            </span>
          )}
          <span>
            <label htmlFor="operator-logo" className="block cursor-pointer text-sm font-semibold text-brand hover:text-brand-dark">
              {logo.name ? 'Reemplazar logo' : 'Agregar logo'}
            </label>
            <span className="mt-1 block text-xs text-muted">
              {logo.name ? logo.name : 'JPG o PNG · Máximo 5 MB'}
            </span>
            {logo.name && (
              <button
                type="button"
                onClick={() => setLogo({ url: '', name: '' })}
                className="mt-1 text-xs font-semibold text-danger"
              >
                Quitar logo
              </button>
            )}
          </span>
          <input id="operator-logo" type="file" accept="image/jpeg,image/png" onChange={handleLogo} className="sr-only" />
        </div>

        <div className="grid content-center gap-2">
          <label htmlFor="operator-business-name" className="block text-sm font-semibold text-ink">
            Nombre del negocio
          </label>
          <input
            id="operator-business-name"
            className={inputClass}
            value={values.businessName}
            onChange={(event) => setField('businessName', event.target.value)}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? 'error-business-name' : undefined}
          />
          <FieldError id="error-business-name">{errors.businessName}</FieldError>
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="operator-description" className="block text-sm font-semibold text-ink">
            Descripción del operador
          </label>
          <textarea
            id="operator-description"
            rows="4"
            className={`${inputClass} min-h-28 resize-y`}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="operator-department" className="block text-sm font-semibold text-ink">
            Departamento
          </label>
          <select
            id="operator-department"
            className={inputClass}
            value={values.department}
            onChange={(event) => {
              setField('department', event.target.value)
              setField('municipality', '')
            }}
            aria-invalid={Boolean(errors.department)}
          >
            <option value="" disabled>Selecciona un departamento</option>
            {departmentNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <FieldError>{errors.department}</FieldError>
        </div>

        <div className="grid gap-2">
          <label htmlFor="operator-municipality" className="block text-sm font-semibold text-ink">
            Municipio
          </label>
          <select
            id="operator-municipality"
            className={inputClass}
            value={values.municipality}
            disabled={!values.department}
            onChange={(event) => setField('municipality', event.target.value)}
            aria-invalid={Boolean(errors.municipality)}
          >
            <option value="" disabled>
              {values.department ? 'Selecciona un municipio' : 'Elige primero un departamento'}
            </option>
            {municipalities.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <FieldError>{errors.municipality}</FieldError>
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="operator-address" className="block text-sm font-semibold text-ink">
            Dirección
          </label>
          <input
            id="operator-address"
            className={inputClass}
            value={values.address}
            onChange={(event) => setField('address', event.target.value)}
            aria-invalid={Boolean(errors.address)}
          />
          <FieldError>{errors.address}</FieldError>
          <p className="text-xs leading-5 text-muted">Esta información aparece en tu perfil público.</p>
        </div>
      </section>

      <section className="grid content-start gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-7">
        <h2 className="text-lg font-bold text-ink">Datos de contacto</h2>
        <div className="grid gap-2">
          <label htmlFor="operator-email" className="block text-sm font-semibold text-ink">
            Correo del negocio
          </label>
          <input
            id="operator-email"
            type="email"
            className={inputClass}
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div className="grid gap-2">
          <label htmlFor="operator-whatsapp" className="block text-sm font-semibold text-ink">
            WhatsApp
          </label>
          <input
            id="operator-whatsapp"
            type="tel"
            className={inputClass}
            value={values.whatsapp}
            onChange={(event) => setField('whatsapp', event.target.value)}
            aria-invalid={Boolean(errors.whatsapp)}
          />
          <FieldError>{errors.whatsapp}</FieldError>
        </div>
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

      {status.text && (
        <p
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border px-4 py-3 text-sm leading-5 lg:col-span-2 ${
            status.type === 'error'
              ? 'border-red-900/15 bg-red-50 text-red-900'
              : status.type === 'success'
                ? 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
                : 'border-black/10 bg-canvas text-muted'
          }`}
        >
          {status.text}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="min-h-12 justify-self-end rounded-xl bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60 lg:col-span-2"
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default OperatorSettings
