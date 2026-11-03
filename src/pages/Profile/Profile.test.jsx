import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Profile from './Profile.jsx'

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  const body = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${header}.${body}.signature`
}

function renderProfile(role, extra = {}) {
  localStorage.setItem(
    'token',
    createMockJwt({
      sub: 'ec25601c-d3fb-41ff-a022-2b143afade36',
      email: 'ana.lopez@correo.com',
      given_name: 'Ana',
      family_name: 'López',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': role,
      email_verified: 'true',
      exp: 4102444800,
      ...extra,
    }),
  )

  render(
    <MemoryRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Profile', () => {
  it('muestra los datos de la cuenta y el correo en solo lectura', () => {
    renderProfile('VISITANTE')

    expect(screen.getByRole('heading', { name: /^mi perfil$/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue('Ana')
    expect(screen.getByLabelText(/apellidos/i)).toHaveValue('López')
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('readonly')
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })

  it('muestra el botón para solicitar ser operador a los visitantes y apunta a la solicitud', () => {
    renderProfile('VISITANTE')

    expect(screen.getByRole('link', { name: /solicitar ser operador/i })).toHaveAttribute(
      'href',
      '/operador/solicitud',
    )
  })

  it('oculta el botón de solicitar ser operador a quienes ya tienen otro rol', () => {
    renderProfile('OPERADOR')

    expect(screen.queryByRole('link', { name: /solicitar ser operador/i })).not.toBeInTheDocument()
  })

  it('habilita guardar solo cuando hay cambios y valida los campos obligatorios', () => {
    renderProfile('VISITANTE')

    const save = screen.getByRole('button', { name: /guardar cambios/i })
    expect(save).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: '' } })
    expect(save).toBeEnabled()

    fireEvent.click(save)
    expect(screen.getByText(/escribe tu nombre/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'Anita' } })
    expect(screen.queryByText(/escribe tu nombre/i)).not.toBeInTheDocument()
  })

  it('cancelar restaura los valores guardados', () => {
    renderProfile('VISITANTE')

    fireEvent.change(screen.getByLabelText(/nombre público/i), { target: { value: 'Otra' } })
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.getByLabelText(/nombre público/i)).toHaveValue('Ana')
  })

  it('cierra la sesión desde el menú de cuenta', () => {
    renderProfile('VISITANTE')

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(localStorage.getItem('token')).toBeNull()
  })
})
