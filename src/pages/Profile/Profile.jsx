import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import Button from '../../components/Button.jsx'
import FormField from '../../components/FormField.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { notify } from '../../lib/notify.js'
import { Roles } from '../../lib/roles.js'

const accountLinks = [
  { to: '/perfil', label: 'Mi perfil', end: true },
  { to: '/mis-reservas', label: 'Mis reservas' },
  { to: '/favoritos', label: 'Favoritos' },
  { to: '/perfil/configuracion', label: 'Configuración de la cuenta' },
  { to: '/perfil/notificaciones', label: 'Notificaciones' },
  { to: '/ayuda', label: 'Ayuda' },
]

const roleTones = {
  [Roles.VISITANTE]: 'neutral',
  [Roles.OPERADOR]: 'success',
  [Roles.ADMIN]: 'info',
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getInitialValues(user) {
  const firstName = user?.firstName ?? ''
  return {
    firstName,
    lastName: user?.lastName ?? '',
    publicName: user?.publicName ?? firstName,
  }
}

function validate(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'Escribe tu nombre.'
  if (!values.lastName.trim()) errors.lastName = 'Escribe tus apellidos.'
  if (!values.publicName.trim()) errors.publicName = 'Elige cómo quieres que te vean.'
  return errors
}

const navItemClass = ({ isActive }) =>
  `block rounded-xl px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? 'bg-info-soft font-semibold text-brand'
      : 'font-medium text-ink hover:bg-canvas hover:text-brand'
  }`

function Profile() {
  const { user, logout } = useAuth()
  const [saved, setSaved] = useState(() => getInitialValues(user))
  const [values, setValues] = useState(saved)
  const [errors, setErrors] = useState({})

  const displayName = [saved.firstName, saved.lastName].filter(Boolean).join(' ') || user?.name || ''
  const isDirty = Object.keys(values).some((key) => values[key] !== saved[key])
  const isVisitor = !user?.role || user.role === Roles.VISITANTE

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const trimmed = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      publicName: values.publicName.trim(),
    }
    setSaved(trimmed)
    setValues(trimmed)
    notify.success('Cambios guardados.')
  }

  function handleCancel() {
    setValues(saved)
    setErrors({})
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">Inicio / Mi perfil</p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-brand">
          Administra tu cuenta
        </p>
        <h1 className="mt-1 text-4xl font-bold text-ink">Mi perfil</h1>
        <p className="mt-2 text-base text-muted">
          Actualiza tus datos personales y gestiona lo que ven otros viajeros.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-mist bg-surface p-5">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-info-soft text-3xl font-bold text-brand"
            >
              {getInitials(displayName)}
            </span>
            <p className="mt-2 text-lg font-bold text-ink">{displayName}</p>
            <p className="break-all text-sm text-muted">{user?.email}</p>
            <Pill tone={roleTones[user?.role] ?? 'neutral'}>{user?.role ?? Roles.VISITANTE}</Pill>
          </div>

          <nav aria-label="Cuenta" className="mt-5 border-t border-mist pt-4">
            <ul className="space-y-1">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} className={navItemClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-mist pt-4">
              <button
                type="button"
                onClick={logout}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>

        <div className="space-y-5">
          <section className="rounded-2xl border border-mist bg-surface p-7">
            <h2 className="text-xl font-bold text-ink">Información personal</h2>
            <p className="mt-1 text-sm text-muted">
              Esta información se muestra en tu perfil público de RutaSV.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FormField
                    id="profile-first-name"
                    name="firstName"
                    label="Nombre"
                    autoComplete="given-name"
                    value={values.firstName}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.firstName)}
                  />
                  {errors.firstName && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <FormField
                    id="profile-last-name"
                    name="lastName"
                    label="Apellidos"
                    autoComplete="family-name"
                    value={values.lastName}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.lastName)}
                  />
                  {errors.lastName && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <FormField
                  id="profile-public-name"
                  name="publicName"
                  label="Nombre público"
                  hint="Así te verán otros viajeros en tus reseñas."
                  value={values.publicName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.publicName)}
                />
                {errors.publicName && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                    {errors.publicName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  Correo electrónico
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-mist bg-canvas px-4 py-3">
                  <input
                    id="profile-email"
                    type="email"
                    readOnly
                    value={user?.email ?? ''}
                    className="min-w-0 flex-1 bg-transparent text-muted focus:outline-none"
                  />
                  {user?.emailVerified ? (
                    <Pill tone="success">Verificado</Pill>
                  ) : (
                    <Link to="/verify-email" className="shrink-0">
                      <Pill tone="pending">Verificar correo</Pill>
                    </Link>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  Para cambiar tu correo, contacta a soporte.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!isDirty} className="disabled:opacity-50">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </section>

          {isVisitor && (
            <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-mist bg-info-soft p-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-ink">
                  ¿Tienes un negocio o servicio turístico?
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Solicita ser operador y publica tus experiencias para que más viajeros te
                  encuentren.
                </p>
              </div>
              <LinkButton to="/operador/solicitud">Solicitar ser operador</LinkButton>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
