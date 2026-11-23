import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../../config/axios'
import { useAuth } from '../../context/AuthContext.jsx'

function getApiErrorMessage(error) {
  const data = error?.response?.data

  if (!data) {
    return 'Error al registrar la cuenta. Inténtalo de nuevo más tarde.'
  }

  if (typeof data === 'string') {
    return data
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  if (typeof data.title === 'string' && data.title.trim()) {
    return data.title
  }

  return 'No se pudo completar el registro. Verifica los datos ingresados.'
}

export default function Registration() {
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const firstName = form.elements.firstName
    const lastName = form.elements.lastName
    const email = form.elements.email
    const phone = form.elements.phone
    const password = form.elements.password
    const confirmPassword = form.elements.confirmPassword
    const nextErrors = {}

    if (!firstName.value.trim()) {
      nextErrors.firstName = 'Ingresa tu nombre.'
    }
    if (!lastName.value.trim()) {
      nextErrors.lastName = 'Ingresa tu apellido.'
    }
    if (!email.value.trim()) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (email.validity.typeMismatch) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }
    if (!password.value) {
      nextErrors.password = 'Ingresa una contraseña.'
    } else if (password.value.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }
    if (!confirmPassword.value) {
      nextErrors.confirmPassword = 'Confirma tu contraseña.'
    } else if (confirmPassword.value !== password.value) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setErrors(nextErrors)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      form.elements[firstInvalidField].focus()
      return
    }

    setApiError('')
    setIsLoading(true)

    const trimmedPhone = phone.value.trim()
    const payload = {
      email: email.value.trim(),
      password: password.value,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    }

    try {
      const response = await api.post('/auth/register', payload)
      const token =
        typeof response.data === 'string' ? response.data : response.data?.token

      login(token)
      navigate('/verify-email')
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    const { credential } = credentialResponse || {}

    if (!credential) {
      setApiError('No se pudo obtener la credencial de Google.')
      return
    }

    setApiError('')
    setIsLoading(true)

    try {
      const response = await api.post('/auth/google', {
        idToken: credential,
      })

      const token =
        typeof response.data === 'string' ? response.data : response.data?.token

      login(token)
      navigate('/')
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleError() {
    setApiError('No se pudo completar el registro con Google. Inténtalo de nuevo.')
  }

  function handleChange(event) {
    const { name } = event.target
    if (errors[name]) {
      setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  function fieldClass(fieldName) {
    return `w-full rounded-xl border bg-surface px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand ${
      errors[fieldName] ? 'border-red-500' : 'border-mist'
    }`
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
          Tu próxima historia empieza aquí
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-muted">Regístrate para descubrir El Salvador.</p>
      </div>

      {apiError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      {/* Formulario: campos arriba y acciones ancladas abajo */}
      <form className="flex flex-1 flex-col justify-between gap-8" noValidate onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-first-name" className="mb-1.5 block text-xs font-semibold text-ink">
              Nombre
            </label>
            <input
              id="register-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name" required
              className={fieldClass('firstName')}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? 'register-first-name-error' : undefined}
              onChange={handleChange}
            />
            {errors.firstName && (
              <p id="register-first-name-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="register-last-name" className="mb-1.5 block text-xs font-semibold text-ink">
              Apellido
            </label>
            <input
              id="register-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name" required
              className={fieldClass('lastName')}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? 'register-last-name-error' : undefined}
              onChange={handleChange}
            />
            {errors.lastName && (
              <p id="register-last-name-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.lastName}
              </p>
            )}
          </div>
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-ink">
              Correo electrónico
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email" required
              placeholder="ana@correo.com"
              className={fieldClass('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              onChange={handleChange}
            />
            {errors.email && (
              <p id="register-email-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-phone" className="mb-1.5 block text-xs font-semibold text-ink">
              Teléfono <span className="font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="7000-0000"
              className={fieldClass('phone')}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-ink">
              Contraseña
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password" required
              minLength={8}
              className={fieldClass('password')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              onChange={handleChange}
            />
            {errors.password && (
              <p id="register-password-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-semibold text-ink">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password" required
              className={fieldClass('confirmPassword')}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p id="register-confirm-password-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-mist" />
            <span className="bg-surface px-3 text-xs uppercase text-muted">o</span>
            <div className="w-full border-t border-mist" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              text="signup_with"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          <p className="pt-1 text-center text-xs text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
