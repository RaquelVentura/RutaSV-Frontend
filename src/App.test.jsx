import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.jsx'

afterEach(cleanup)

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('muestra la portada en /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { name: /descubre el salvador/i }),
    ).toBeInTheDocument()
  })

  it('muestra el formulario de inicio de sesión en /login', () => {
    renderAt('/login')
    expect(
      screen.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i }),
    ).toBeInTheDocument()
  })

  it('mantiene el login separado del flujo de verificación', () => {
    const { container } = renderAt('/login')
    const page = within(container)

    fireEvent.change(container.querySelector('#login-email'), {
      target: { value: 'ana@correo.com' },
    })
    fireEvent.change(container.querySelector('#login-password'), {
      target: { value: 'password' },
    })
    fireEvent.click(page.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      page.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
    expect(page.queryByRole('heading', { name: /verifica tu correo/i })).not.toBeInTheDocument()
  })

  it('abre el registro desde el botón superior del login', () => {
    const { container } = renderAt('/login')
    fireEvent.click(within(container).getByRole('link', { name: /registro/i }))

    expect(
      within(container).getByRole('heading', { name: /crea tu cuenta/i }),
    ).toBeInTheDocument()
  })

  it('continúa desde el registro a ingresar el código con el correo registrado', () => {
    const { container } = renderAt('/registro')

    fireEvent.change(container.querySelector('#register-name'), {
      target: { value: 'Ana López' },
    })
    fireEvent.change(container.querySelector('#register-email'), {
      target: { value: 'ana@correo.com' },
    })
    fireEvent.change(container.querySelector('#register-password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(container.querySelector('#register-confirm-password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(within(container).getByRole('button', { name: /crear cuenta/i }))

    expect(
      within(container).getByRole('heading', { name: /verifica tu correo/i }),
    ).toBeInTheDocument()
    expect(within(container).getByText(/ana@correo\.com/)).toBeInTheDocument()
    expect(within(container).getByText(/no se ha enviado ningún código/i)).toBeInTheDocument()
  })

  it('permite omitir la verificación y vuelve a la vista de visitante', () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/registro/verificar',
            state: { email: 'ana@correo.com' },
          },
        ]}
      >
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(within(container).getByRole('link', { name: /omitir por ahora/i }))

    expect(
      within(container).getByRole('heading', { name: /descubre el salvador/i }),
    ).toBeInTheDocument()
    expect(within(container).getByRole('status')).toHaveTextContent(
      /no se guardaron porque falta conectar el backend/i,
    )
  })

  it('redirige al registro si se abre verificación sin venir del registro', () => {
    const { container } = renderAt('/registro/verificar')

    expect(
      within(container).getByRole('heading', { name: /crea tu cuenta/i }),
    ).toBeInTheDocument()
  })

  it('muestra resultados de verificación aceptada y rechazada', () => {
    const { unmount } = renderAt('/registro/verificacion/aceptada')
    expect(screen.getByRole('heading', { name: /correo verificado/i })).toBeInTheDocument()

    unmount()
    renderAt('/registro/verificacion/rechazada')
    expect(screen.getByRole('heading', { name: /no se pudo verificar/i })).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(
      screen.getByRole('heading', { name: /página no encontrada/i }),
    ).toBeInTheDocument()
  })
})
