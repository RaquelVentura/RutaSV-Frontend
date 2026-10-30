import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Home from '../Home.jsx'
import EmailVerification from './EmailVerification.jsx'

vi.mock('../../config/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const jsonPayload = JSON.stringify(payload)
  const utf8Bytes = new TextEncoder().encode(jsonPayload)
  const binary = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('')
  const base64Payload = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${base64Payload}.signature`
}

function renderVerifyEmail(initialEntry = '/verify-email') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify-email" element={<EmailVerification />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('EmailVerification', () => {
  it('captura el token desde ?token=... y rellena automáticamente el input', () => {
    renderVerifyEmail('/verify-email?token=token-desde-url-999')

    const input = screen.getByLabelText(/token de verificación/i)
    expect(input).toHaveValue('token-desde-url-999')
  })

  it('llama a POST /auth/verify-email al presionar Verificar y redirige al inicio', async () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'ana@correo.com',
      given_name: 'Ana',
      family_name: 'López',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      email_verified: 'false',
      exp: 4102444800,
    })
    localStorage.setItem('token', token)

    api.post.mockResolvedValueOnce({
      data: { message: 'Correo electrónico verificado exitosamente.' },
    })

    renderVerifyEmail('/verify-email?token=token-valido-123')

    fireEvent.click(screen.getByRole('button', { name: /^verificar$/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'token-valido-123',
      })
      expect(
        screen.getByRole('heading', { name: /qué bueno verte, ana lópez/i }),
      ).toBeInTheDocument()
    })
  })

  it('llama a POST /auth/resend-verification-email al presionar Reenviar correo y muestra alerta de éxito', async () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'ana@correo.com',
      given_name: 'Ana',
      family_name: 'López',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      exp: 4102444800,
    })
    localStorage.setItem('token', token)

    api.post.mockResolvedValueOnce({
      data: { message: 'Se ha enviado un nuevo correo de verificación.' },
    })

    renderVerifyEmail('/verify-email')

    fireEvent.click(screen.getByRole('button', { name: /reenviar correo/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/resend-verification-email', {
        email: 'ana@correo.com',
      })
      expect(screen.getByRole('status')).toHaveTextContent(
        'Se ha enviado un nuevo correo de verificación.',
      )
    })
  })

  it('muestra alerta de error cuando el token de verificación es inválido', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: 'El token proporcionado es inválido o ha expirado.' },
      },
    })

    renderVerifyEmail('/verify-email')

    fireEvent.change(screen.getByLabelText(/token de verificación/i), {
      target: { value: 'token-invalido' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^verificar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El token proporcionado es inválido o ha expirado.',
      )
    })
  })
})
