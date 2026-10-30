import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../config/axios'
import { useAuth } from '../../context/AuthContext.jsx'

function getApiErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data

  if (!data) {
    return fallbackMessage
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error
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

  return fallbackMessage
}

export default function EmailVerification() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, markEmailAsVerified } = useAuth()

  const urlToken = searchParams.get('token') ?? ''
  const [token, setToken] = useState(urlToken)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const userEmail = user?.email || location.state?.email || ''

  async function handleVerifySubmit(event) {
    event.preventDefault()

    const trimmedToken = token.trim()
    if (!trimmedToken) {
      setSuccessMessage('')
      setErrorMessage('Ingresa el token de verificación.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const response = await api.post('/auth/verify-email', {
        token: trimmedToken,
      })

      const message =
        response?.data?.message || 'Correo electrónico verificado exitosamente.'

      markEmailAsVerified(response?.data?.token)
      setSuccessMessage(message)
      navigate('/', { state: { notice: message } })
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No se pudo verificar el correo electrónico. Verifica que el token sea válido.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendEmail() {
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const payload = userEmail ? { email: userEmail } : {}
      const response = await api.post('/auth/resend-verification-email', payload)

      const message =
        response?.data?.message ||
        'Se ha enviado un nuevo correo de verificación.'
      setSuccessMessage(message)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No se pudo reenviar el correo de verificación. Inténtalo de nuevo.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
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
          {userEmail ? (
            <>
              Ingresa el token de verificación enviado a{' '}
              <strong>{userEmail}</strong>.
            </>
          ) : (
            'Ingresa el token de verificación que enviamos a tu correo electrónico.'
          )}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      <form className="mt-6 space-y-4" noValidate onSubmit={handleVerifySubmit}>
        <div>
          <label
            htmlFor="verification-token"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Token de verificación
          </label>
          <input
            id="verification-token"
            name="token"
            type="text"
            value={token}
            disabled={isLoading}
            placeholder="Ingresa o pega tu token de verificación"
            aria-invalid={Boolean(errorMessage)}
            onChange={(event) => {
              setToken(event.target.value)
              if (errorMessage) {
                setErrorMessage('')
              }
            }}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-cyan-700 disabled:bg-stone-100 ${
              errorMessage ? 'border-red-500' : 'border-stone-200'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#087E9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Procesando...' : 'Verificar'}
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleResendEmail}
          className="w-full rounded-xl border border-[#087E9A] bg-white px-4 py-3 text-sm font-semibold text-[#087E9A] transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reenviar correo
        </button>

        <Link
          to="/"
          className="block w-full py-2 text-center text-sm font-medium text-stone-600 hover:text-[#087E9A] hover:underline"
        >
          Volver al inicio
        </Link>
      </form>
    </section>
  )
}
