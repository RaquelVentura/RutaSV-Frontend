import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext.jsx'

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

const sampleClaims = {
  sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
  email: 'juan.perez@gmail.com',
  given_name: 'Juan',
  family_name: 'Perez',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
  email_verified: 'true',
  jti: 'e1b6e42e-3ba3-4218-a547-010638b0d2f5',
  exp: 4102444800,
  iss: 'RutaSV.Api',
  aud: 'RutaSV.Client',
}

function TestConsumer({ tokenToLogin }) {
  const { user, isAuthenticated, login, logout } = useAuth()

  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? 'autenticado' : 'invitado'}</p>
      {user && (
        <div>
          <p data-testid="user-name">{user.name}</p>
          <p data-testid="user-given-name">{user.given_name}</p>
          <p data-testid="user-family-name">{user.family_name}</p>
          <p data-testid="user-role">{user.role}</p>
          <p data-testid="user-email">{user.email}</p>
        </div>
      )}
      <button type="button" onClick={() => login(tokenToLogin)}>
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('AuthContext', () => {
  it('inicializa desde LocalStorage decodificando los claims de .NET', () => {
    const token = createMockJwt(sampleClaims)
    localStorage.setItem('token', token)

    render(
      <AuthProvider>
        <TestConsumer tokenToLogin={token} />
      </AuthProvider>,
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Juan Perez')
    expect(screen.getByTestId('user-given-name')).toHaveTextContent('Juan')
    expect(screen.getByTestId('user-family-name')).toHaveTextContent('Perez')
    expect(screen.getByTestId('user-role')).toHaveTextContent('VISITANTE')
    expect(screen.getByTestId('user-email')).toHaveTextContent('juan.perez@gmail.com')
  })

  it('permite iniciar y cerrar sesión actualizando LocalStorage y el estado', () => {
    const token = createMockJwt(sampleClaims)

    render(
      <AuthProvider>
        <TestConsumer tokenToLogin={token} />
      </AuthProvider>,
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('invitado')

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Juan Perez')
    expect(localStorage.getItem('token')).toBe(token)

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(screen.getByTestId('auth-status')).toHaveTextContent('invitado')
    expect(localStorage.getItem('token')).toBeNull()
  })
})
