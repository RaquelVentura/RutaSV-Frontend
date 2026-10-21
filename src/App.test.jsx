import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.jsx'
import { writeSession } from './lib/auth/session.js'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function loginAs(role) {
  writeSession({
    token: 'token-de-prueba',
    user: { id: '1', firstName: 'Ana', role },
  })
}

afterEach(() => {
  localStorage.clear()
})

describe('rutas públicas', () => {
  it('muestra la portada en /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { name: /el salvador se vive/i }),
    ).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(
      screen.getByRole('heading', { name: /página no encontrada/i }),
    ).toBeInTheDocument()
  })

  it('muestra el catálogo sin sesión', () => {
    renderAt('/experiencias')
    expect(
      screen.getByRole('heading', { name: /catálogo de experiencias/i }),
    ).toBeInTheDocument()
  })
})

describe('rutas protegidas por rol', () => {
  it('redirige al login si no hay sesión', () => {
    renderAt('/operador')
    expect(
      screen.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
  })

  it('un visitante no entra al panel del operador', () => {
    loginAs('VISITANTE')
    renderAt('/operador')
    expect(
      screen.getByRole('heading', { name: /sin permiso/i }),
    ).toBeInTheDocument()
  })

  it('un operador entra a su panel', () => {
    loginAs('OPERADOR')
    renderAt('/operador')
    expect(
      screen.getByRole('heading', { name: /panel del operador/i }),
    ).toBeInTheDocument()
  })

  it('un operador no entra a administración', () => {
    loginAs('OPERADOR')
    renderAt('/admin')
    expect(
      screen.getByRole('heading', { name: /sin permiso/i }),
    ).toBeInTheDocument()
  })

  it('un admin entra a administración', () => {
    loginAs('ADMIN')
    renderAt('/admin')
    expect(
      screen.getByRole('heading', { name: /panel de administración/i }),
    ).toBeInTheDocument()
  })

  it('un visitante con sesión no ve el login', () => {
    loginAs('VISITANTE')
    renderAt('/auth/login')
    expect(
      screen.getByRole('heading', { name: /el salvador se vive/i }),
    ).toBeInTheDocument()
  })
})
