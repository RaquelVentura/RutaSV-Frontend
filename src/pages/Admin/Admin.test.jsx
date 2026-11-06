import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  const jsonPayload = JSON.stringify(payload)
  const utf8Bytes = new TextEncoder().encode(jsonPayload)
  const binary = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('')
  const base64Payload = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${base64Payload}.signature`
}

const sampleBackendRequests = [
  {
    id: 'a9c1b8e2-4f3a-4b1c-9e2d-1a2b3c4d5e6f',
    userId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    companyId: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
    status: 'PENDIENTE',
    message: 'Contamos con guías certificados y 5 años de experiencia local.',
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: '2026-10-30T15:30:00Z',
    updatedAt: '2026-10-30T15:30:00Z',
    user: {
      id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      email: 'josue.antonio@correo.com',
      firstName: 'Josue',
      lastName: 'Antonio',
      phone: '+50377889900',
      role: 'VISITANTE',
      status: 'ACTIVO',
    },
    company: {
      id: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
      operatorId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      tradeName: 'Ecoparque El Espino',
      legalName: 'Ecoparque El Espino S.A. de C.V.',
      description:
        'Bosque en las pendientes de un volcán con avifauna y senderos de excursión.',
      contactEmail: 'contacto@elespino.sv',
      contactPhone: '+50323288023',
      whatsapp: '+50377889900',
      website: 'https://instagram.com/ecoparqueelespino',
      logoUrl: null,
      municipalityId: 14,
      address: 'Blvr. Sta. Elena 20',
      status: 'PENDIENTE',
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
      createdAt: '2026-10-30T15:30:00Z',
      updatedAt: '2026-10-30T15:30:00Z',
    },
    documents: [
      {
        id: '11111111-2222-3333-4444-555555555555',
        type: 'DUI_FRENTE',
        objectKey: 'operator-requests/user-123/dui-frente.jpg',
        url: null,
        createdAt: '2026-10-30T15:30:00Z',
      },
      {
        id: '22222222-3333-4444-5555-666666666666',
        type: 'ENLACE_REDES',
        objectKey: null,
        url: 'https://instagram.com/ecoparqueelespino',
        createdAt: '2026-10-30T15:30:00Z',
      },
    ],
  },
]

function setAdminSession() {
  const token = createMockJwt({
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'admin@rutasv.com',
    given_name: 'Admin',
    family_name: 'RutaSV',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'ADMIN',
    email_verified: 'true',
    exp: 4102444800,
  })
  localStorage.setItem('token', token)
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  setAdminSession()
  api.get.mockResolvedValue({
    data: {
      data: sampleBackendRequests,
      totalRecords: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
  })
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Vistas de administrador', () => {
  it('bloquea el acceso a /admin/solicitudes cuando el usuario es VISITANTE', () => {
    const visitorToken = createMockJwt({
      sub: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      email: 'visitante@rutasv.com',
      given_name: 'Mario',
      family_name: 'Bolaños',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
      email_verified: 'true',
      exp: 4102444800,
    })
    localStorage.setItem('token', visitorToken)

    renderAt('/admin/solicitudes')
    expect(screen.getByRole('heading', { name: /sin permiso/i })).toBeInTheDocument()
  })

  it('muestra el dashboard con resumen, solicitudes pendientes desde el backend y actividad', async () => {
    renderAt('/admin')

    expect(screen.getByRole('heading', { name: /hola, administrador/i })).toBeInTheDocument()
    expect(screen.getByText('Solicitudes pendientes')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /solicitudes de operador pendientes/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /actividad reciente/i })).toBeInTheDocument()
    expect(await screen.findByText('Josue Antonio')).toBeInTheDocument()
  })

  it('navega del dashboard a la cola de solicitudes', async () => {
    renderAt('/admin')
    fireEvent.click(screen.getByRole('link', { name: /ver solicitudes/i }))

    expect(
      await screen.findByRole('heading', { name: /solicitudes de operador/i, level: 1 }),
    ).toBeInTheDocument()
  })

  it('lista las solicitudes del backend y abre el detalle con Revisar', async () => {
    renderAt('/admin/solicitudes')

    expect(await screen.findByText('Ecoparque El Espino')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/operator-requests', {
      params: { pageNumber: 1, pageSize: 10, status: 'PENDIENTE' },
    })

    fireEvent.click(screen.getAllByRole('link', { name: /revisar/i })[0])

    expect(
      await screen.findByRole('heading', { name: /solicitud de josue antonio/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ecoparque El Espino S.A. de C.V.')).toBeInTheDocument()
    expect(screen.getByText('operator-requests/user-123/dui-frente.jpg')).toBeInTheDocument()
  })

  it('filtra la cola y muestra el estado vacío sin coincidencias', async () => {
    renderAt('/admin/solicitudes')

    await screen.findByText('Ecoparque El Espino')

    fireEvent.change(screen.getByLabelText(/buscar solicitudes/i), {
      target: { value: 'zzzz' },
    })

    expect(screen.getByText(/ninguna solicitud coincide/i)).toBeInTheDocument()
  })

  it('aprueba una solicitud enviando POST /operator-requests/:id/review con isApproved=true', async () => {
    const requestId = 'a9c1b8e2-4f3a-4b1c-9e2d-1a2b3c4d5e6f'
    api.post.mockResolvedValueOnce({
      data: {
        ...sampleBackendRequests[0],
        status: 'APROBADA',
        reviewedAt: '2026-10-31T10:00:00Z',
        user: {
          ...sampleBackendRequests[0].user,
          role: 'OPERADOR',
        },
        company: {
          ...sampleBackendRequests[0].company,
          status: 'APROBADA',
        },
      },
    })

    renderAt(`/admin/solicitudes/${requestId}`)

    await screen.findByRole('heading', { name: /solicitud de josue antonio/i })

    fireEvent.click(screen.getByRole('button', { name: /aprobar solicitud/i }))
    const dialog = screen.getByRole('dialog', { name: /¿aprobar la solicitud\?/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /sí, aprobar/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/operator-requests/${requestId}/review`,
        {
          isApproved: true,
          rejectionReason: null,
        },
      )
    })

    expect(
      await screen.findByText(/solicitud aprobada\. se envió un correo/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('exige un motivo para rechazar y envía POST /operator-requests/:id/review con isApproved=false', async () => {
    const requestId = 'a9c1b8e2-4f3a-4b1c-9e2d-1a2b3c4d5e6f'
    api.post.mockResolvedValueOnce({
      data: {
        ...sampleBackendRequests[0],
        status: 'RECHAZADA',
        rejectionReason: 'La fotografía del DUI es ilegible.',
        reviewedAt: '2026-10-31T10:05:00Z',
        company: {
          ...sampleBackendRequests[0].company,
          status: 'RECHAZADA',
          rejectionReason: 'La fotografía del DUI es ilegible.',
        },
      },
    })

    renderAt(`/admin/solicitudes/${requestId}`)

    await screen.findByRole('heading', { name: /solicitud de josue antonio/i })

    fireEvent.click(screen.getByRole('button', { name: /^rechazar solicitud$/i }))
    expect(screen.getByText(/escribe un motivo para poder rechazar/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/motivo del rechazo/i), {
      target: { value: 'La fotografía del DUI es ilegible.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^rechazar solicitud$/i }))
    const dialog = screen.getByRole('dialog', { name: /rechazar solicitud/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /^rechazar solicitud$/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/operator-requests/${requestId}/review`,
        {
          isApproved: false,
          rejectionReason: 'La fotografía del DUI es ilegible.',
        },
      )
    })

    expect(
      await screen.findByText(/solicitud rechazada\. se notificó/i),
    ).toBeInTheDocument()
  })

  it('avisa cuando la solicitud no existe', async () => {
    renderAt('/admin/solicitudes/no-existe')
    expect(
      await screen.findByRole('heading', { name: /solicitud no encontrada/i }),
    ).toBeInTheDocument()
  })

  it('lista usuarios y filtra por rol', () => {
    renderAt('/admin/usuarios')

    expect(screen.getByText('Ana López')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'OPERADOR' } })

    expect(screen.queryByText('Ana López')).not.toBeInTheDocument()
    expect(screen.getByText('Marta Rivas')).toBeInTheDocument()
  })

  it('crea un usuario y vuelve a la lista con aviso', () => {
    renderAt('/admin/usuarios')
    fireEvent.click(screen.getByRole('link', { name: /crear usuario/i }))

    expect(screen.getByRole('heading', { name: /^crear usuario$/i })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Mena' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'ana.mena@correo.com' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña temporal/i), {
      target: { value: 'Temporal123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^crear usuario$/i }))

    expect(screen.getByRole('heading', { name: /^usuarios$/i })).toBeInTheDocument()
    expect(screen.getByText(/usuario creado: ana mena/i)).toBeInTheDocument()
  })
})
