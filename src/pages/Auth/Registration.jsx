import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Registration() {
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const name = form.elements.name
    const email = form.elements.email
    const password = form.elements.password
    const confirmPassword = form.elements.confirmPassword
    const nextErrors = {}

    if (!name.value.trim()) {
      nextErrors.name = 'Ingresa tu nombre.'
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

    navigate('/registro/verificar', {
      state: { email: email.value.trim() },
    })
  }

  function handleChange(event) {
    const { name } = event.target
    if (errors[name]) {
      setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    }
  }

  function fieldClass(fieldName) {
    return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-cyan-700 ${
      errors[fieldName] ? 'border-red-500' : 'border-stone-200'
    }`
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight text-[#087E9A]">
          RutaSV
        </Link>
        <Link to="/login" className="text-sm font-medium text-[#087E9A] hover:underline">
          Iniciar sesión
        </Link>
      </div>

      <div className="mb-7 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#087E9A]">
          Tu próxima historia empieza aquí
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-stone-900">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Regístrate para descubrir El Salvador.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-xs font-semibold text-stone-700">
            Nombre completo
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={fieldClass('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            onChange={handleChange}
          />
          {errors.name && <p id="register-name-error" className="mt-1 text-xs text-red-600" role="alert">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-stone-700">
            Correo electrónico
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="ana@correo.com"
            className={fieldClass('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            onChange={handleChange}
          />
          {errors.email && <p id="register-email-error" className="mt-1 text-xs text-red-600" role="alert">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-stone-700">
            Contraseña
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldClass('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            onChange={handleChange}
          />
          {errors.password && <p id="register-password-error" className="mt-1 text-xs text-red-600" role="alert">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-semibold text-stone-700">
            Confirmar contraseña
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={fieldClass('confirmPassword')}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p id="register-confirm-password-error" className="mt-1 text-xs text-red-600" role="alert">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#087E9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
        >
          Crear cuenta
        </button>
      </form>
    </section>
  )
}
