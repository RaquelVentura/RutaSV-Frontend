import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthContext } from '../../context/AuthContext.jsx'
import CompanyProfile from '../Companies/CompanyProfile.jsx'
import OperatorsList from './OperatorsList.jsx'

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

afterEach(cleanup)

describe('Operadores (admin)', () => {
  it('«Ver perfil» abre el perfil público de la empresa', () => {
    renderList()

    fireEvent.click(screen.getByRole('link', { name: 'Ver perfil de Olas de El Tunco' }))

    expect(screen.getByTestId('ruta')).toHaveTextContent('/empresas/olas-de-el-tunco')
    expect(screen.getByRole('heading', { level: 1, name: 'Olas de El Tunco' })).toBeInTheDocument()
  })

  it('«Ver experiencias» abre el perfil en la sección de experiencias', () => {
    renderList()

    fireEvent.click(screen.getByRole('link', { name: 'Ver experiencias de Raíces de Café' }))

    expect(screen.getByTestId('ruta')).toHaveTextContent('/empresas/raices-de-cafe#experiencias')
    expect(screen.getByRole('region', { name: 'Experiencias de Raíces de Café' })).toBeInTheDocument()
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
