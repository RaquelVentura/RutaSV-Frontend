import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../context/AuthContext.jsx'
import { getSpotsForDate } from '../../lib/availability.js'
import ExperienceDetail from './ExperienceDetail.jsx'

function ReservationProbe() {
  const { state } = useLocation()
  return (
    <div>
      <h1>Pantalla de reserva</h1>
      <p data-testid="booking">{JSON.stringify(state?.booking ?? null)}</p>
    </div>
  )
}

function renderDetail({ user = null, path = '/experiencias/surf-atardecer-el-tunco' } = {}) {
  return render(
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user) }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/experiencias/:slug" element={<ExperienceDetail />} />
          <Route path="/login" element={<h1>Pantalla de login</h1>} />
          <Route path="/turista/reservar" element={<ReservationProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

beforeEach(() => {
  // Miércoles 4 de noviembre de 2026: un día con cupos, para fechas estables.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 4, 9, 0, 0))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Detalle de la experiencia', () => {
  it('muestra la información de la experiencia y a su anfitrión', () => {
    renderDetail()

    expect(screen.getByRole('heading', { level: 1, name: 'Surf al atardecer en El Tunco' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Una ola, un atardecer, una nueva historia' })).toBeInTheDocument()
    expect(screen.getByText(/Tabla de surf y leash/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Olas de El Tunco' })).toHaveAttribute('href', '/empresas/olas-de-el-tunco')
    expect(screen.getAllByRole('button', { name: /Ver las 8 fotos/ })).toHaveLength(2)
  })

  it('muestra «página no encontrada» si la experiencia no existe', () => {
    renderDetail({ path: '/experiencias/no-existe' })

    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })

  it('calcula el total con el número de personas', () => {
    renderDetail()

    const panel = screen.getByRole('complementary', { name: 'Reservar esta experiencia' })
    expect(within(panel).getByText('$90.00 USD')).toBeInTheDocument()

    fireEvent.change(within(panel).getByLabelText('Personas'), { target: { value: '3' } })
    expect(within(panel).getByText('$135.00 USD')).toBeInTheDocument()
  })

  it('no permite elegir fechas pasadas ni los lunes cerrados', () => {
    renderDetail()

    expect(screen.getByRole('button', { name: '2 de noviembre, fecha pasada' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '9 de noviembre, cerrado' })).toBeDisabled()
  })

  it('pide iniciar sesión antes de reservar', () => {
    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(screen.getByRole('heading', { name: 'Pantalla de login' })).toBeInTheDocument()
  })

  it('envía la reserva elegida a la pantalla de pago cuando hay sesión', () => {
    renderDetail({ user: { email: 'ana.lopez@correo.com' } })

    fireEvent.change(screen.getByLabelText('Horario'), { target: { value: '16:00–18:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }))

    const booking = JSON.parse(screen.getByTestId('booking').textContent)
    expect(booking.experience.title).toBe('Surf al atardecer en El Tunco')
    expect(booking.experience.price).toBe(45)
    expect(booking.time).toBe('16:00–18:00')
    expect(booking.people).toBe(2)
    expect(booking.reference).toMatch(/^RSV-\d{6}-\d{4}$/)
    expect(booking.contactEmail).toBe('ana.lopez@correo.com')
  })

  it('abre y cierra todas las fotos', () => {
    renderDetail()

    fireEvent.click(screen.getAllByRole('button', { name: /Ver las 8 fotos/ })[0])
    expect(screen.getByRole('dialog', { name: /Fotos de Surf al atardecer/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Disponibilidad de ejemplo', () => {
  const today = new Date(2026, 10, 4)

  it('cierra los lunes y bloquea las fechas pasadas', () => {
    expect(getSpotsForDate(new Date(2026, 10, 9), 8, today).status).toBe('closed')
    expect(getSpotsForDate(new Date(2026, 10, 3), 8, today).status).toBe('past')
  })

  it('devuelve siempre al menos un cupo en las fechas abiertas', () => {
    for (let day = 5; day <= 30; day += 1) {
      const result = getSpotsForDate(new Date(2026, 10, day), 8, today)
      if (result.status === 'available' || result.status === 'few') {
        expect(result.spots).toBeGreaterThanOrEqual(1)
        expect(result.spots).toBeLessThanOrEqual(8)
      }
    }
  })
})
