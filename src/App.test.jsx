import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import api from './config/axios.js'

vi.mock('./config/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@react-oauth/google', () => {
  function GoogleOAuthProvider({ children }) {
    return children
  }
  function GoogleLogin() {
    return <button type="button">Google Login</button>
  }
  return { GoogleOAuthProvider, GoogleLogin }
})

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  const body = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${header}.${body}.sig`
}

function setSession(role = 'VISITANTE', emailVerified = 'true') {
  localStorage.setItem(
    'token',
    createMockJwt({
      sub: '11111111-1111-1111-1111-111111111111',
      email: `${role.toLowerCase()}@rutasv.com`,
      given_name: 'Ana',
      family_name: 'Rivera',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': role,
      email_verified: emailVerified,
      exp: 4102444800,
    }),
  )
}

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url === '/categories') return Promise.resolve({ data: [{ id: 1, name: 'Playa' }] })
    if (url === '/departments') return Promise.resolve({ data: [{ id: 5, name: 'La Libertad' }] })
    if (url.includes('/municipalities')) return Promise.resolve({ data: [{ id: 16, departmentId: 5, name: 'Tamanique' }] })
    if (url === '/experiences' || url === '/experiences/my') {
      return Promise.resolve({
        data: {
          data: [
            {
              id: 'exp-1',
              slug: 'surf-el-tunco',
              title: 'Surf al atardecer en El Tunco',
              shortDescription: 'Clase de surf guiada',
              description: 'Disfruta una clase de surf en Playa El Tunco.',
              municipalityName: 'Tamanique',
              departmentName: 'La Libertad',
              latitude: 13.4926,
              longitude: -89.3831,
              price: 45,
              currency: 'USD',
              hasLimitedCapacity: true,
              minPeople: 1,
              maxPeople: 6,
              status: 'PUBLICADA',
              company: { id: 'c1', tradeName: 'Olas de El Tunco' },
              images: [{ id: 'img-1', url: 'https://example.com/1.jpg', isCover: true }],
            },
          ],
          totalRecords: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      })
    }
    if (url === '/availabilities/my') return Promise.resolve({ data: [] })
    if (url === '/refunds') return Promise.resolve({ data: [] })
    if (url === '/favorites' || url === '/favorites/ids') return Promise.resolve({ data: [] })
    if (url === '/reservations/my' || url === '/reservations/operator') {
      return Promise.resolve({
        data: {
          data: [
            {
              id: 'res-1',
              reservationCode: 'RSV-2026-ABC123',
              experienceId: 'exp-1',
              experienceTitle: 'Surf al atardecer en El Tunco',
              experienceSlug: 'surf-el-tunco',
              activityDate: '2026-12-20',
              startTime: '09:00',
              peopleCount: 2,
              unitPrice: 45,
              total: 90,
              currency: 'USD',
              source: 'WEB',
              status: 'CONFIRMADA',
              paymentStatus: 'PAGADO_DEMO',
              contactName: 'Ana Rivera',
              contactEmail: 'visitante@rutasv.com',
              history: [{ id: 'h1', newStatus: 'CONFIRMADA', notes: 'Pago demo', createdAt: '2026-11-23T10:00:00Z' }],
            },
          ],
          totalRecords: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 20,
        },
      })
    }
    if (url === '/reservations/res-1/cancel-preview') {
      return Promise.resolve({
        data: {
          reservationId: 'res-1',
          canCancel: true,
          hoursUntilStart: 72,
          refundPercentage: 100,
          refundAmount: 90,
          currency: 'USD',
          policyDescription: 'Cancelación con 48 horas o más: corresponde reembolso del 100 %.',
        },
      })
    }
    if (url === '/companies/my') {
      return Promise.resolve({
        data: [{ id: 'c1', tradeName: 'Olas de El Tunco', contactEmail: 'hola@olas.sv', municipalityId: 16 }],
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('App — Integración end-to-end (rutas, turista, operador y admin)', () => {
  it('protege /operador para VISITANTE y permite acceso a OPERADOR mostrando métricas reales', async () => {
    setSession('VISITANTE')
    renderApp('/operador')
    expect(screen.getByRole('heading', { name: /sin permiso/i })).toBeInTheDocument()

    cleanup()
    setSession('OPERADOR')
    renderApp('/operador')
    expect(await screen.findByRole('heading', { name: /resumen operativo/i })).toBeInTheDocument()
    expect(await screen.findByText('RSV-2026-ABC123')).toBeInTheDocument()
  })

  it('redirige /turista/explorar al explorador unificado bajo MainLayout', async () => {
    renderApp('/turista/explorar')
    expect(await screen.findByRole('heading', { name: /experiencias turísticas/i })).toBeInTheDocument()
    expect(await screen.findByText('Surf al atardecer en El Tunco')).toBeInTheDocument()
  })

  it('permite al turista ver su historial de reservas y abrir modal de cancelación con cálculo de reembolso', async () => {
    setSession('VISITANTE')
    api.post.mockResolvedValueOnce({
      data: {
        id: 'res-1',
        reservationCode: 'RSV-2026-ABC123',
        status: 'CANCELADA',
        refund: { refundCode: 'REF-2026-999999', percentage: 100, amount: 90, status: 'EN_PROCESO' },
      },
    })

    renderApp('/turista/mi-actividad/reservas')

    expect(await screen.findByText('RSV-2026-ABC123')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar reserva' }))

    expect(await screen.findByText(/corresponde reembolso del 100 %/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/reservations/res-1/cancel', { reason: '' })
    })
  })

  it('permite al operador gestionar sus experiencias, reservas y configuración de empresa', async () => {
    setSession('OPERADOR')
    renderApp('/operador/experiencias')
    expect(await screen.findByText('Surf al atardecer en El Tunco')).toBeInTheDocument()

    cleanup()
    renderApp('/operador/configuracion')
    expect(await screen.findByDisplayValue('Olas de El Tunco')).toBeInTheDocument()
  })

  it('permite al admin listar y acceder a la moderación de experiencias', async () => {
    setSession('ADMIN')
    renderApp('/admin/experiencias')
    expect(await screen.findByText('Surf al atardecer en El Tunco')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Moderar' })).toHaveAttribute('href', '/admin/experiencias/exp-1')
  })

  it('muestra página 404 para rutas desconocidas', () => {
    renderApp('/ruta-que-no-existe')
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})
