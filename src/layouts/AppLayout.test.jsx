import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext.jsx'
import AppLayout from './AppLayout.jsx'

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
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('AppLayout', () => {
  it('muestra menú de perfil para usuario autenticado y permite cerrar sesión', () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'juan.perez@gmail.com',
      given_name: 'Juan',
      family_name: 'Perez',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      exp: 4102444800,
    })
    localStorage.setItem('token', token)

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout>
            <p>Contenido de la cuenta</p>
          </AppLayout>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Hola, Juan Perez')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /registro/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registro/i })).toBeInTheDocument()
  })

  it('muestra navegación de visitante cuando no hay sesión', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout>
            <p>Contenido público</p>
          </AppLayout>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /^login$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^registro$/i })).toBeInTheDocument()
  })

  it('incluye el pie de página', () => {
    render(
      <MemoryRouter>
        <AppLayout user={null}>
          <p>Contenido</p>
        </AppLayout>
      </MemoryRouter>,
    )

    expect(screen.getByText(/hecho en el salvador/i)).toBeInTheDocument()
  })
})
