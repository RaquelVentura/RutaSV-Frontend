import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios.js'
import { AuthContext } from '../../context/AuthContext.jsx'
import CompanyProfile from '../Companies/CompanyProfile.jsx'
import OperatorsList from './OperatorsList.jsx'

vi.mock('../../config/axios.js', () => ({
  default: {
    get: vi.fn(),
  },
}))

function Where() {
  const { pathname, search, hash } = useLocation()
  return <p data-testid="ruta">{`${pathname}${search}${hash}`}</p>
}

function renderList() {
  return render(
    <AuthContext.Provider value={{ user: { role: 'ADMIN' }, isAuthenticated: true }}>
      <MemoryRouter initialEntries={['/admin/operadores']}>
        <Routes>
          <Route path="/admin/operadores" element={<OperatorsList />} />
          <Route path="/empresas/:slug" element={<CompanyProfile />} />
          <Route path="/admin/solicitudes" element={<h1>Cola de solicitudes</h1>} />
        </Routes>
        <Where />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url.includes('olas-de-el-tunco')) {
      return Promise.resolve({
        data: { id: 'c1', tradeName: 'Olas de El Tunco', experiences: [] },
      })
    }
    if (url.includes('raices-de-cafe')) {
      return Promise.resolve({
        data: { id: 'c2', tradeName: 'Raíces de Café', experiences: [] },
      })
    }
    return Promise.resolve({ data: { id: 'c0', tradeName: 'Empresa', experiences: [] } })
  })
})

afterEach(cleanup)

describe('Operadores (admin)', () => {
  it('«Ver perfil» abre el perfil público de la empresa', async () => {
    renderList()

    fireEvent.click(screen.getByRole('link', { name: 'Ver perfil de Olas de El Tunco' }))

    expect(screen.getByTestId('ruta')).toHaveTextContent('/empresas/olas-de-el-tunco')
    expect(await screen.findByRole('heading', { level: 1, name: 'Olas de El Tunco' })).toBeInTheDocument()
  })

  it('«Ver experiencias» abre el perfil en la sección de experiencias', async () => {
    renderList()

    fireEvent.click(screen.getByRole('link', { name: 'Ver experiencias de Raíces de Café' }))

    expect(screen.getByTestId('ruta')).toHaveTextContent('/empresas/raices-de-cafe#experiencias')
    expect(await screen.findByRole('heading', { level: 1, name: 'Raíces de Café' })).toBeInTheDocument()
  })

  it('cada operador con perfil público tiene su página', () => {
    renderList()

    for (const name of ['Olas de El Tunco', 'Raíces de Café', 'Ataco a pie', 'Ruta del Lago']) {
      expect(screen.getByRole('link', { name: `Ver perfil de ${name}` }).getAttribute('href')).toMatch(/^\/empresas\//)
    }
  })

  it('«Ver solicitud» lleva a la cola de solicitudes del operador en revisión', () => {
    renderList()

    fireEvent.click(screen.getByRole('link', { name: 'Ver solicitud de Volcán y Cumbre' }))

    expect(screen.getByTestId('ruta')).toHaveTextContent('/admin/solicitudes?q=Volc%C3%A1n%20y%20Cumbre')
  })

  it('suspende y reactiva un operador', () => {
    renderList()
    const row = () => screen.getByText('Olas de El Tunco').closest('li')

    fireEvent.click(screen.getByRole('button', { name: 'Suspender de Olas de El Tunco' }))
    expect(screen.getByText('Olas de El Tunco quedó suspendido.')).toBeInTheDocument()
    expect(within(row()).getByText('Suspendido')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reactivar de Olas de El Tunco' }))
    expect(within(row()).getByText('Activo')).toBeInTheDocument()
  })
})
