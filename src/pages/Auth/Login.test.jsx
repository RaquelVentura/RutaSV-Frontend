import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Home from '../Home.jsx'
import Login from './Login.jsx'

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
          onClick={() => onSuccess({ credential: 'google-id-token-123' })}
        >
          Simular Google Success
        </button>
        <button type="button" onClick={() => onError()}>
          Simular Google Error
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

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Login', () => {
  it('muestra errores si se envía el formulario vacío', () => {
    renderLogin()

    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form'))

    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })

  it('valida el formato del correo y elimina el error al corregirlo', () => {
    renderLogin()

    const email = screen.getByLabelText(/correo electrónico/i)
    fireEvent.change(email, { target: { value: 'correo-invalido' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form'))

    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()

    fireEvent.change(email, { target: { value: 'ana@correo.com' } })

    expect(
      screen.queryByText('Ingresa un correo electrónico válido.'),
    ).not.toBeInTheDocument()
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })

  it('autentica con Google enviando { idToken: credential } a /auth/google y redirige a /', async () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'evervc.dev@gmail.com',
      given_name: 'Ever',
      family_name: 'Vásquez',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      exp: 4102444800,
    })

    api.post.mockResolvedValueOnce({ data: { token } })

    renderLogin()

    fireEvent.click(screen.getByRole('button', { name: 'Simular Google Success' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/google', {
        idToken: 'google-id-token-123',
      })
      expect(
        screen.getByRole('heading', { name: /qué bueno verte, ever vásquez/i }),
      ).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBe(token)
  })

  it('muestra un mensaje si falla el popup de Google (onError)', () => {
    renderLogin()

    fireEvent.click(screen.getByRole('button', { name: 'Simular Google Error' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
    )
  })
})
