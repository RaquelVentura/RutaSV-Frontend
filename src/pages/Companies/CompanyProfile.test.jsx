import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthContext } from '../../context/AuthContext.jsx'
import CompanyProfile from './CompanyProfile.jsx'

function renderProfile({ user = null, path = '/empresas/olas-de-el-tunco' } = {}) {
  return render(
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user) }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/empresas/:slug" element={<CompanyProfile />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

afterEach(cleanup)

describe('Perfil de la empresa', () => {
  it('muestra la empresa y sus experiencias, cada una con enlace a su detalle', () => {
    renderProfile()

    expect(screen.getByRole('heading', { level: 1, name: 'Olas de El Tunco' })).toBeInTheDocument()
    const section = screen.getByRole('region', { name: 'Experiencias de Olas de El Tunco' })
    const links = within(section).getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', '/experiencias/surf-atardecer-el-tunco')
  })

  it('solo lista las experiencias de esa empresa', () => {
    renderProfile({ path: '/empresas/raices-de-cafe' })

    const section = screen.getByRole('region', { name: 'Experiencias de Raíces de Café' })
    expect(within(section).getAllByRole('link')).toHaveLength(1)
    expect(within(section).getByText('Del cafetal a tu taza en Apaneca')).toBeInTheDocument()
  })

  it('pide iniciar sesión para escribir a la empresa y ofrece el correo con sesión', () => {
    const { unmount } = renderProfile()
    expect(screen.getByRole('link', { name: 'Escribir a la empresa' })).toHaveAttribute('href', '/login')
    unmount()

    renderProfile({ user: { email: 'ana.lopez@correo.com' } })
    expect(screen.getByRole('link', { name: 'Escribir a la empresa' })).toHaveAttribute(
      'href',
      'mailto:hola@olasdeeltunco.example',
    )
  })

  it('muestra «página no encontrada» si la empresa no existe', () => {
    renderProfile({ path: '/empresas/no-existe' })

    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})
