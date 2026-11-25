import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios.js'
import { AuthContext } from '../../context/AuthContext.jsx'
import ExperienceDetail from './ExperienceDetail.jsx'

vi.mock('../../config/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const sampleExperience = {
  id: 'exp-1',
  slug: 'surf-el-tunco',
  title: 'Surf al atardecer en El Tunco',
  shortDescription: 'Aprende surf con instructores locales.',
  description: 'Clase guiada de surf de dos horas con tabla, licra y fotos incluidas.',
  price: 45,
  currency: 'USD',
  durationMinutes: 120,
  difficulty: 'FACIL',
  hasLimitedCapacity: true,
  minPeople: 1,
  maxPeople: 6,
  municipalityName: 'Tamanique',
  departmentName: 'La Libertad',
  latitude: 13.4926,
  longitude: -89.3831,
  autoConfirmation: true,
  averageRating: 4.9,
  totalReviews: 12,
  company: {
    id: 'comp-1',
    tradeName: 'Olas de El Tunco',
    description: 'Escuela local de surf.',
  },
  categories: [{ id: 3, name: 'Surf' }],
  images: [
    { id: 'img-1', url: 'https://example.com/1.jpg', isCover: true, sortOrder: 0 },
    { id: 'img-2', url: 'https://example.com/2.jpg', isCover: false, sortOrder: 1 },
  ],
}

const sampleSlots = [
  {
    id: 'slot-1',
    experienceId: 'exp-1',
    date: '2026-12-10',
    startTime: '09:00',
    endTime: '11:00',
    totalCapacity: 6,
    reservedCapacity: 2,
    availableSpots: 4,
    effectivePrice: 45,
    currency: 'USD',
    status: 'ABIERTA',
  },
]

function BookingStateEcho() {
  const location = useLocation()
  return (
    <div data-testid="booking-state">
      {location.state?.experience?.title} · {location.state?.availability?.id} ·{' '}
      {location.state?.peopleCount}
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url === '/experiences/surf-el-tunco') {
      return Promise.resolve({ data: sampleExperience })
    }
    if (url === '/experiences/exp-1/availabilities') {
      return Promise.resolve({ data: sampleSlots })
    }
    if (url === '/favorites/ids') {
      return Promise.resolve({ data: [] })
    }
    return Promise.reject({ response: { status: 404, data: { detail: 'No encontrada' } } })
  })
})

afterEach(cleanup)

function renderDetail(slug, authValue = { user: null, isAuthenticated: false }) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[`/experiencias/${slug}`]}>
        <Routes>
          <Route path="/experiencias/:slug" element={<ExperienceDetail />} />
          <Route path="/turista/reservar" element={<BookingStateEcho />} />
          <Route path="/login" element={<h1>Iniciar sesión</h1>} />
          <Route path="/verify-email" element={<h1>Verificar correo</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Detalle de experiencia (integrado con Backend)', () => {
  it('muestra la experiencia, su empresa y sus sesiones disponibles', async () => {
    renderDetail('surf-el-tunco')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Surf al atardecer en El Tunco' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Olas de El Tunco')).toBeInTheDocument()
    expect(screen.getByText('4 cupos')).toBeInTheDocument()
  })

  it('calcula el total al aumentar personas y pasa la selección al checkout si el correo está verificado', async () => {
    renderDetail('surf-el-tunco', {
      user: { id: 'u1', role: 'VISITANTE', emailVerified: true },
      isAuthenticated: true,
    })

    await screen.findByText('4 cupos')
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar personas' }))
    expect(screen.getAllByText('$90.00').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /continuar a reserva y pago/i }))
    expect(await screen.findByTestId('booking-state')).toHaveTextContent(
      'Surf al atardecer en El Tunco · slot-1 · 2',
    )
  })

  it('bloquea reserva si el usuario no ha verificado su correo (RN-20)', async () => {
    renderDetail('surf-el-tunco', {
      user: { id: 'u1', role: 'VISITANTE', emailVerified: false },
      isAuthenticated: true,
    })

    await screen.findByText('4 cupos')
    fireEvent.click(screen.getByRole('button', { name: /continuar a reserva y pago/i }))

    expect(await screen.findByRole('heading', { name: /verificar correo/i })).toBeInTheDocument()
  })

  it('permite agregar a favoritos autenticado', async () => {
    api.post.mockResolvedValueOnce({ status: 204 })
    renderDetail('surf-el-tunco', {
      user: { id: 'u1', role: 'VISITANTE', emailVerified: true },
      isAuthenticated: true,
    })

    await screen.findByRole('heading', { level: 1, name: 'Surf al atardecer en El Tunco' })
    fireEvent.click(screen.getByRole('button', { name: /agregar a favoritos/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/favorites/exp-1')
    })
  })

  it('muestra mensaje cuando la experiencia no existe', async () => {
    renderDetail('no-existe')
    expect(await screen.findByRole('heading', { name: /experiencia no encontrada/i })).toBeInTheDocument()
  })
})
