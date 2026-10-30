import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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
  it('muestra menú desplegable de perfil para usuario autenticado no verificado con Verificar Correo y permite cerrar sesión', () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'juan.perez@gmail.com',
      given_name: 'Juan',
      family_name: 'Perez',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      email_verified: 'false',
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

    const menuTrigger = screen.getByRole('button', { name: /juan perez/i })
    expect(menuTrigger).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /registro/i })).not.toBeInTheDocument()

    fireEvent.click(menuTrigger)

    expect(screen.getByRole('menuitem', { name: /editar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /solicitud de operador/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /verificar correo/i })).toHaveAttribute(
      'href',
      '/verify-email',
    )

    fireEvent.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registro/i })).toBeInTheDocument()
  })

  it('oculta la opción Verificar Correo cuando el JWT indica que el correo ya está verificado', () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'juan.perez@gmail.com',
      given_name: 'Juan',
      family_name: 'Perez',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      email_verified: 'true',
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

    fireEvent.click(screen.getByRole('button', { name: /juan perez/i }))

    expect(screen.getByRole('menuitem', { name: /editar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /solicitud de operador/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /verificar correo/i })).not.toBeInTheDocument()
  })

  it('muestra el acceso al panel del operador para usuarios operadores', () => {
    const token = createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'ana.operadora@gmail.com',
      given_name: 'Ana',
      family_name: 'López',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'OPERADOR',
      email_verified: 'true',
      exp: 4102444800,
    })
    localStorage.setItem('token', token)

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout>
            <p>Contenido del operador</p>
          </AppLayout>
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /ana lópez/i }))
    expect(screen.getByRole('menuitem', { name: /panel de operador/i })).toHaveAttribute(
      'href',
      '/operador',
    )
  })

  it('redirige a /verify-email al seleccionar Verificar Correo en el menú desplegable', () => {
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
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<p>Inicio</p>} />
              <Route path="/verify-email" element={<p>Vista Verificar Correo</p>} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /juan perez/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: /verificar correo/i }))

    expect(screen.getByText('Vista Verificar Correo')).toBeInTheDocument()
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

    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registro/i })).toBeInTheDocument()
  })
})
