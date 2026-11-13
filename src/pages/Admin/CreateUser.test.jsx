import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App.jsx'
import api from '../../config/axios'

vi.mock('../../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${base64Payload}.signature`
}

const adminToken = createMockJwt({
  sub: '11111111-1111-1111-1111-111111111111',
  email: 'admin@rutasv.com',
  given_name: 'Admin',
  family_name: 'RutaSV',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'ADMIN',
  email_verified: 'true',
  exp: 4102444800,
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  localStorage.setItem('token', adminToken)
  api.get.mockResolvedValue({ data: { data: [], totalRecords: 0, totalPages: 1, currentPage: 1 } })
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/admin/usuarios/nuevo']}>
      <App />
    </MemoryRouter>,
  )
}

function fillForm({ password = 'Temporal123' } = {}) {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Lucía' } })
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Mejía' } })
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'lucia@correo.com' },
  })
  fireEvent.change(screen.getByLabelText('Contraseña temporal'), { target: { value: password } })
}

describe('Crear usuario (admin)', () => {
  it('crea la cuenta con POST /auth/register y vuelve a la lista con aviso', async () => {
    api.post.mockResolvedValue({ data: { token: 'token-de-la-cuenta-nueva' } })
    renderForm()

    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'lucia@correo.com',
        password: 'Temporal123',
        firstName: 'Lucía',
        lastName: 'Mejía',
      }),
    )
    expect(
      await screen.findByText(/usuario creado: lucía mejía/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument()
  })

  it('no reemplaza la sesión del administrador con el token de la cuenta nueva', async () => {
    api.post.mockResolvedValue({ data: { token: 'token-de-la-cuenta-nueva' } })
    renderForm()

    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    await screen.findByText(/usuario creado/i)

    expect(localStorage.getItem('token')).toBe(adminToken)
  })

  it('muestra el error del backend y se queda en el formulario', async () => {
    api.post.mockRejectedValue({
      response: { data: { detail: 'Ya existe una cuenta con ese correo.' } },
    })
    renderForm()

    fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese correo.',
    )
    expect(screen.getByRole('heading', { name: 'Crear usuario' })).toBeInTheDocument()
  })

  it('valida la contraseña antes de llamar al backend', () => {
    renderForm()

    fillForm({ password: 'corta' })
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 8 caracteres/i)
    expect(api.post).not.toHaveBeenCalled()
  })

  it('solo permite crear cuentas con rol Visitante', () => {
    renderForm()

    const role = screen.getByLabelText('Rol')
    expect(role).toBeDisabled()
    expect(role).toHaveValue('Visitante')
  })
})
