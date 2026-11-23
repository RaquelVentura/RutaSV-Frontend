import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios.js'
import { AuthContext } from '../../context/AuthContext.jsx'
import ExperienceExplorer from './ExperienceExplorer.jsx'

vi.mock('../../config/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const sampleExperiences = [
  {
    id: 'exp-1',
    slug: 'surf-el-tunco',
    title: 'Surf al atardecer en El Tunco',
    shortDescription: 'Aprende surf con instructores locales.',
    municipalityName: 'Tamanique',
    departmentName: 'La Libertad',
    latitude: 13.4926,
    longitude: -89.3831,
    durationMinutes: 120,
    price: 45,
    averageRating: 4.9,
    hasLimitedCapacity: true,
    maxPeople: 6,
    coverImageUrl: 'https://example.com/surf.jpg',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url === '/categories') {
      return Promise.resolve({ data: [{ id: 1, name: 'Playa' }, { id: 3, name: 'Surf' }] })
    }
    if (url === '/departments') {
      return Promise.resolve({ data: [{ id: 5, name: 'La Libertad' }] })
    }
    if (url === '/favorites/ids') {
      return Promise.resolve({ data: [] })
    }
    if (url === '/experiences') {
      return Promise.resolve({
        data: {
          data: sampleExperiences,
          totalRecords: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 9,
        },
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(cleanup)

function renderExplorer(path = '/experiencias', isAuthenticated = true) {
  return render(
    <AuthContext.Provider value={{ user: isAuthenticated ? { id: 'u1', role: 'VISITANTE' } : null, isAuthenticated }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/experiencias" element={<ExperienceExplorer />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('Explorar experiencias (integrado con Backend)', () => {
  it('carga catálogo, categorías y departamentos desde el backend', async () => {
    renderExplorer()

    expect(await screen.findByText('Surf al atardecer en El Tunco')).toBeInTheDocument()
    expect(screen.getByText('1 experiencia disponible')).toBeInTheDocument()
  })

  it('envía filtros y ordenamiento a GET /experiences', async () => {
    renderExplorer()
    await screen.findByText('Surf al atardecer en El Tunco')

    fireEvent.change(screen.getByLabelText('Ordenar experiencias'), {
      target: { value: 'price_asc' },
    })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/experiences',
        expect.objectContaining({
          params: expect.objectContaining({ sortBy: 'price_asc' }),
        }),
      )
    })
  })

  it('permite agregar y quitar de favoritos desde la tarjeta', async () => {
    api.post.mockResolvedValueOnce({ status: 204 })
    api.delete.mockResolvedValueOnce({ status: 204 })

    renderExplorer()
    await screen.findByText('Surf al atardecer en El Tunco')

    const favButton = screen.getByRole('button', { name: 'Agregar a favoritos' })
    fireEvent.click(favButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/favorites/exp-1')
    })

    const removeFavButton = await screen.findByRole('button', { name: 'Quitar de favoritos' })
    fireEvent.click(removeFavButton)

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/favorites/exp-1')
    })
  })
})
