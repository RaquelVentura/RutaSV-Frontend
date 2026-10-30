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

    expect(screen.getByRole('link', { name: 'Ana' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^registro$/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /salir/i }))
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

    expect(screen.getByRole('link', { name: /^login$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^registro$/i })).toBeInTheDocument()
  })

  it('incluye el pie de página', () => {
    render(
      <MemoryRouter>
        <AppLayout user={null}>
          <p>Contenido</p>
        </AppLayout>
      </MemoryRouter>,
    )

    expect(screen.getByText(/hecho en el salvador/i)).toBeInTheDocument()
  })
})
