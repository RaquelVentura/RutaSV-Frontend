import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Login from './Login.jsx'

afterEach(cleanup)

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

describe('Login', () => {
  it('muestra errores si se envía el formulario vacío', () => {
    renderLogin()

    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form'))

    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })

  it('valida el formato del correo y elimina el error al corregirlo', () => {
    renderLogin()

    const email = screen.getByLabelText(/correo electrónico/i)
    fireEvent.change(email, { target: { value: 'correo-invalido' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form'))

    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()

    fireEvent.change(email, { target: { value: 'ana@correo.com' } })

    expect(
      screen.queryByText('Ingresa un correo electrónico válido.'),
    ).not.toBeInTheDocument()
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })
})
