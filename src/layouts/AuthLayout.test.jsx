import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'

vi.mock('@react-oauth/google', () => {
  function GoogleOAuthProvider({ children }) {
    return children
  }

  function GoogleLogin() {
    return null
  }

  return { GoogleOAuthProvider, GoogleLogin }
})

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<h1>Formulario de prueba</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  sessionStorage.clear()
})

describe('AuthLayout', () => {
  it('empieza con el logotipo como primera diapositiva y el formulario oculto', () => {
    renderLayout()

    expect(screen.getByRole('img', { name: /RutaSV: una gota de ubicación/i })).toBeInTheDocument()
    expect(document.querySelector('[inert]')).not.toBeNull()
  })

  it('muestra el formulario al terminar la animación y no la repite en la sesión', () => {
    const { unmount } = renderLayout()

    act(() => {
      vi.advanceTimersByTime(5700)
    })

    expect(document.querySelector('[inert]')).toBeNull()
    expect(sessionStorage.getItem('rutasv-auth-intro-visto')).toBe('1')

    unmount()
    renderLayout()
    expect(document.querySelector('[inert]')).toBeNull()
  })

  it('pasa a la siguiente diapositiva con los controles y por temporizador', () => {
    sessionStorage.setItem('rutasv-auth-intro-visto', '1')
    renderLayout()

    const slides = () =>
      screen.getAllByRole('group', { hidden: true }).filter((el) => el.getAttribute('aria-hidden') === 'false')

    expect(slides()).toHaveLength(1)
    expect(slides()[0]).toHaveAttribute('aria-label', '1 de 5')

    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }))
    expect(slides()[0]).toHaveAttribute('aria-label', '2 de 5')

    act(() => {
      vi.advanceTimersByTime(5600)
    })
    expect(slides()[0]).toHaveAttribute('aria-label', '3 de 5')

    fireEvent.click(screen.getByRole('button', { name: 'Ir a la diapositiva 1' }))
    expect(slides()[0]).toHaveAttribute('aria-label', '1 de 5')
  })
})
