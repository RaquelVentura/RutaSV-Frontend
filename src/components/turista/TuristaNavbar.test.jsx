import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthContext } from '../../context/AuthContext.jsx'
import TuristaLayout from '../../layouts/TuristaLayout.jsx'
import MiActividadShell from './MiActividadShell.jsx'

const user = {
  firstName: 'Cristina',
  lastName: 'Ventura',
  fullName: 'Cristina Ventura',
  name: 'Cristina Ventura',
  email: 'cristina@correo.com',
  role: 'VISITANTE',
  emailVerified: true,
}

function renderAt(path, currentUser) {
  return render(
    <AuthContext.Provider
      value={{ user: currentUser, isAuthenticated: Boolean(currentUser), logout: () => {}, refreshSession: () => {} }}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/turista" element={<TuristaLayout />}>
            <Route path="mi-actividad" element={<MiActividadShell>contenido</MiActividadShell>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

afterEach(cleanup)

describe('Barra y saludo de turista', () => {
  it('muestra el nombre de la persona que inició sesión, no uno de ejemplo', () => {
    renderAt('/turista/mi-actividad', user)

    expect(screen.getByRole('button', { name: /CV · Cristina Ventura/ })).toBeInTheDocument()
    expect(screen.getByText(/Hola, Cristina/)).toBeInTheDocument()
    expect(screen.queryByText(/Ana/)).not.toBeInTheDocument()
  })

  it('sin sesión ofrece iniciar sesión y registrarse', () => {
    renderAt('/turista/mi-actividad', null)

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Registro' })).toHaveAttribute('href', '/registro')
  })
})
