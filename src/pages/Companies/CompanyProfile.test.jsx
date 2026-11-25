import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios.js'
import CompanyProfile from './CompanyProfile.jsx'

vi.mock('../../config/axios.js', () => ({
  default: {
    get: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(cleanup)

function renderProfile(slug) {
  return render(
    <MemoryRouter initialEntries={[`/empresas/${slug}`]}>
      <Routes>
        <Route path="/empresas/:slug" element={<CompanyProfile />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Perfil de la empresa', () => {
  it('muestra la empresa y sus experiencias desde el backend', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        id: 'comp-1',
        tradeName: 'Olas de El Tunco',
        description: 'Escuela local de surf.',
        contactEmail: 'hola@olas.sv',
        contactPhone: '7777-8888',
        municipalityName: 'Tamanique',
        departmentName: 'La Libertad',
        experiences: [
          {
            id: 'exp-1',
            slug: 'surf-el-tunco',
            title: 'Surf al atardecer',
            shortDescription: 'Clase de surf guiada.',
            municipalityName: 'Tamanique',
            departmentName: 'La Libertad',
            durationMinutes: 120,
            price: 45,
            averageRating: 4.8,
            hasLimitedCapacity: true,
            maxPeople: 8,
            coverImageUrl: 'https://example.com/surf.jpg',
          },
        ],
      },
    })

    renderProfile('olas-de-el-tunco')

    expect(await screen.findByRole('heading', { level: 1, name: 'Olas de El Tunco' })).toBeInTheDocument()
    expect(screen.getByText('Surf al atardecer')).toBeInTheDocument()
    expect(screen.getByText(/hola@olas\.sv/)).toBeInTheDocument()
  })

  it('muestra mensaje si la empresa no existe', async () => {
    api.get.mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'No encontrada' } },
    })

    renderProfile('no-existe')

    expect(await screen.findByRole('heading', { name: /empresa no encontrada/i })).toBeInTheDocument()
  })
})
