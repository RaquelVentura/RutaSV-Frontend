import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios.js'
import { AuthContext } from '../../context/AuthContext.jsx'
import OperatorsList from './OperatorsList.jsx'

vi.mock('../../config/axios.js', () => ({
  default: {
    get: vi.fn(),
  },
}))

function Where() {
  const { pathname, search } = useLocation()
  return <p data-testid="ruta">{`${pathname}${search}`}</p>
}

function renderList() {
  return render(
    <AuthContext.Provider value={{ user: { role: 'ADMIN' }, isAuthenticated: true }}>
      <MemoryRouter initialEntries={['/admin/operadores']}>
        <Routes>
          <Route path="/admin/operadores" element={<OperatorsList />} />
          <Route path="/empresas/:slug" element={<h1>Perfil de empresa</h1>} />
          <Route path="/admin/experiencias" element={<h1>Experiencias del admin</h1>} />
        </Routes>
        <Where />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const approved = {
  id: 'req-1',
  status: 'APROBADA',
  createdAt: '2026-11-10T10:00:00Z',
  reviewedAt: '2026-11-11T10:00:00Z',
  user: { id: 'u1', email: 'dueno@negocio.com', firstName: 'Dana', lastName: 'Rojas' },
  company: { id: 'company-1', tradeName: 'Volcán Tours', contactEmail: 'hola@volcantours.com' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(cleanup)

describe('Operadores (admin)', () => {
  it('lista los negocios con solicitud aprobada, sin datos de ejemplo', async () => {
    api.get.mockResolvedValue({ data: { data: [approved], totalRecords: 1, totalPages: 1 } })
    renderList()

    expect(await screen.findByText('Volcán Tours')).toBeInTheDocument()
    expect(screen.getByText('hola@volcantours.com')).toBeInTheDocument()
    expect(screen.queryByText('Olas de El Tunco')).not.toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/operator-requests', {
      params: expect.objectContaining({ status: 'APROBADA' }),
    })
  })

  it('«Ver perfil» y «Ver experiencias» llevan a su destino', async () => {
    api.get.mockResolvedValue({ data: { data: [approved], totalRecords: 1, totalPages: 1 } })
    renderList()

    fireEvent.click(await screen.findByRole('link', { name: 'Ver perfil de Volcán Tours' }))
    expect(screen.getByTestId('ruta')).toHaveTextContent('/empresas/company-1')
  })

  it('«Ver experiencias» abre las experiencias filtradas por el negocio', async () => {
    api.get.mockResolvedValue({ data: { data: [approved], totalRecords: 1, totalPages: 1 } })
    renderList()

    fireEvent.click(await screen.findByRole('link', { name: 'Ver experiencias de Volcán Tours' }))
    expect(screen.getByTestId('ruta')).toHaveTextContent('/admin/experiencias?q=Volc%C3%A1n%20Tours')
  })

  it('avisa cuando todavía no hay operadores aprobados', async () => {
    api.get.mockResolvedValue({ data: { data: [], totalRecords: 0, totalPages: 1 } })
    renderList()

    expect(await screen.findByText('Aún no hay operadores aprobados')).toBeInTheDocument()
  })
})
