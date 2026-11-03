import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UserMenu from './UserMenu.jsx'

afterEach(cleanup)

function renderMenu(onLogout = vi.fn()) {
  render(
    <MemoryRouter>
      <UserMenu
        label="ADMIN Ana"
        items={[{ to: '/perfil', label: 'Mi perfil' }]}
        onLogout={onLogout}
      />
    </MemoryRouter>,
  )
  return onLogout
}

describe('UserMenu', () => {
  it('despliega las opciones al hacer clic y permite cerrar sesión', () => {
    const onLogout = renderMenu()

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /admin ana/i }))

    expect(screen.getByRole('menuitem', { name: /mi perfil/i })).toHaveAttribute('href', '/perfil')
    fireEvent.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

    expect(onLogout).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('se cierra con Escape y al hacer clic fuera', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: /admin ana/i })

    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(trigger)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
