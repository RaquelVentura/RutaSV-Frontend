import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

export default function EmailVerification() {
  const location = useLocation()
  const email = location.state?.email
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(
    'El envío del código y su verificación requieren conectar un backend. No se ha enviado ningún código.',
  )

  if (!email) {
    return <Navigate to="/registro" replace />
  }

  function handleCodeSubmit(event) {
    event.preventDefault()

    const codeInput = event.currentTarget.elements.code
    const code = codeInput.value.trim()
    if (!code) {
      setError('Ingresa el código de verificación.')
      codeInput.focus()
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('El código debe tener 6 dígitos.')
      codeInput.focus()
      return
    }

    setError('')
    setNotice(
      'El código tiene el formato esperado, pero no puede confirmarse sin conectarlo al backend.',
    )
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <Link to="/" className="text-xl font-bold text-[#087E9A]">
        RutaSV
      </Link>

      <div className="mt-8 text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-2xl text-[#087E9A]"
        >
          ✉
        </div>
        <h1 className="mt-5 text-2xl font-bold text-stone-900">
          Verifica tu correo
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Ingresa el código de verificación para <strong>{email}</strong>.
        </p>
      </div>

      <p
        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        role="status"
      >
        {notice}
      </p>

      <form className="mt-6 space-y-4" noValidate onSubmit={handleCodeSubmit}>
        <div>
          <label
            htmlFor="verification-code"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Código de verificación
          </label>
          <input
            id="verification-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'verification-code-error' : undefined}
            onChange={() => setError('')}
            className={`w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.4em] outline-none transition focus:ring-2 focus:ring-cyan-700 ${
              error ? 'border-red-500' : 'border-stone-200'
            }`}
          />
          {error && (
            <p
              id="verification-code-error"
              className="mt-1 text-xs text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-[#087E9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
        >
          Verificar código
        </button>
        <Link
          to="/"
          state={{
            notice:
              'Omitiste la verificación por ahora. El registro y el correo no se guardaron porque falta conectar el backend.',
          }}
          className="block w-full py-2 text-center text-sm font-medium text-stone-600 hover:text-[#087E9A] hover:underline"
        >
          Omitir por ahora
        </Link>
        <Link
          to="/registro"
          className="block w-full py-2 text-center text-sm font-medium text-[#087E9A] hover:underline"
        >
          Volver al registro
        </Link>
      </form>
    </section>
  )
}
