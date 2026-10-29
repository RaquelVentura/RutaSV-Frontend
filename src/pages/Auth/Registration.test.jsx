import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Home from '../Home.jsx'
import Registration from './Registration.jsx'

vi.mock('../../config/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('@react-oauth/google', () => {
  function GoogleOAuthProvider({ children }) {
    return children
  }

  function GoogleLogin({ onSuccess, onError }) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onSuccess({ credential: 'google-register-token-123' })}
        >
          Registrarse con Google
        </button>
        <button type="button" onClick={() => onError()}>
          Error Google Registro
        </button>
      </div>
    )
  }

  return { GoogleOAuthProvider, GoogleLogin }
})

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

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registration />} />
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

describe('Registration', () => {
  it('envía el payload a /auth/register, autentica con el token y redirige al inicio', async () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'ana@correo.com',
      given_name: 'Ana',
      family_name: 'López',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      exp: 4102444800,
    })

    let resolveRequest
    api.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    renderRegistration()

    fireEvent.change(screen.getByLabelText(/^nombre$/i), {
      target: { value: 'Ana' },
    })
    fireEvent.change(screen.getByLabelText(/^apellido$/i), {
      target: { value: 'López' },
    })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'ana@correo.com' },
    })
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '7000-0000' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password123' },
    })

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'ana@correo.com',
      password: 'password123',
      firstName: 'Ana',
      lastName: 'López',
      phone: '7000-0000',
    })

    resolveRequest({ data: { token } })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /qué bueno verte, ana lópez/i }),
      ).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBe(token)
  })

  it('muestra el mensaje de error de error.response.data cuando falla el registro', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'El correo electrónico ya está registrado.' },
      },
    })

    renderRegistration()

    fireEvent.change(screen.getByLabelText(/^nombre$/i), {
      target: { value: 'Ana' },
    })
    fireEvent.change(screen.getByLabelText(/^apellido$/i), {
      target: { value: 'López' },
    })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'ana@correo.com' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El correo electrónico ya está registrado.',
      )
    })
  })

  it('permite registrarse o iniciar sesión con Google enviando { idToken: credential } a /auth/google', async () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'evervc.dev@gmail.com',
      given_name: 'Ever',
      family_name: 'Vásquez',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      exp: 4102444800,
    })

    api.post.mockResolvedValueOnce({ data: { token } })

    renderRegistration()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse con Google' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/google', {
        idToken: 'google-register-token-123',
      })
      expect(
        screen.getByRole('heading', { name: /qué bueno verte, ever vásquez/i }),
      ).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBe(token)
  })
})
