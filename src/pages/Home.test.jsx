import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../config/axios.js'
import Home from './Home.jsx'

vi.mock('../config/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url === '/experiences') {
      return Promise.resolve({
        data: {
          data: [
            {
              id: 'exp-1',
              slug: 'surf-al-atardecer-el-tunco',
              title: 'Surf al atardecer en El Tunco',
              shortDescription: 'Clase guiada de surf para todos los niveles.',
              municipalityName: 'Tamanique',
              departmentName: 'La Libertad',
              durationMinutes: 120,
              price: 45,
              averageRating: 4.9,
              hasLimitedCapacity: true,
              maxPeople: 6,
              coverImageUrl: 'https://example.com/surf.jpg',
            },
          ],
          totalRecords: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 6,
        },
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(cleanup)

function SearchLocation() {
  const location = useLocation()
  return <p>{`${location.pathname}${location.search}`}</p>
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiencias" element={<SearchLocation />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('muestra el hero y las secciones principales', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { name: /el salvador se vive, no solo se visita/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /qué te mueve hoy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /experiencias destacadas/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tu próxima aventura en tres pasos/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /lo dicen quienes ya fueron/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /conoces un lugar que merece ser vivido/i })).toBeInTheDocument()
  })

  it('lista las experiencias destacadas desde el backend con precio y cupos', async () => {
    renderHome()

    expect(await screen.findByText('Surf al atardecer en El Tunco')).toBeInTheDocument()
    expect(screen.getByText('$45.00 USD')).toBeInTheDocument()
    expect(screen.getByText('Hasta 6 pers.')).toBeInTheDocument()
  })

  it('valida el correo del boletín', () => {
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /quiero inspirarme/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/ingresa tu correo/i)
  })
})
