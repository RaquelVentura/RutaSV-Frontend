import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AppLayout from './AppLayout.jsx'

describe('AppLayout', () => {
  it('muestra navegación de sesión para usuario autenticado', () => {
    const onLogout = vi.fn()
    render(
      <MemoryRouter>
        <AppLayout user={{ name: 'Ana' }} onLogout={onLogout}>
          <p>Contenido de la cuenta</p>
        </AppLayout>
      </MemoryRouter>,
    )

    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /registro/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('muestra navegación de visitante cuando no hay sesión', () => {
    render(
      <MemoryRouter>
        <AppLayout user={null}>
          <p>Contenido público</p>
        </AppLayout>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registro/i })).toBeInTheDocument()
  })
})
