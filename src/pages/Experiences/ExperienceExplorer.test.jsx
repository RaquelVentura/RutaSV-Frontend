import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ExperienceExplorer from './ExperienceExplorer.jsx'

function renderExplorer(path = '/experiencias') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/experiencias" element={<ExperienceExplorer today={new Date(2026, 10, 4)} />} />
      </Routes>
    </MemoryRouter>,
  )
}

const cards = () => screen.getAllByRole('heading', { level: 3 })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 4, 9, 0, 0))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Explorar experiencias', () => {
  it('lista el catálogo con paginación de 6 en 6', () => {
    renderExplorer()

    expect(screen.getByRole('heading', { level: 1, name: /sal de la rutina/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /13 experiencias para descubrir/ })).toBeInTheDocument()
    expect(cards()).toHaveLength(6)

    fireEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(cards()).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeDisabled()
  })

  it('filtra por categoría y departamento al aplicar los filtros', () => {
    renderExplorer()
    const filters = screen.getByRole('form', { name: 'Filtros' })

    fireEvent.click(within(filters).getByLabelText('Café y naturaleza'))
    fireEvent.click(within(filters).getByLabelText('Sonsonate'))
    fireEvent.click(within(filters).getByRole('button', { name: 'Aplicar filtros' }))

    expect(screen.getByRole('heading', { name: /2 experiencias para descubrir/ })).toBeInTheDocument()
    expect(screen.getByText('Cata de café en una finca de Juayúa')).toBeInTheDocument()
    expect(screen.getByText('Ruta del cacao en Izalco')).toBeInTheDocument()
  })

  it('filtra por rango de precio', () => {
    renderExplorer()
    const filters = screen.getByRole('form', { name: 'Filtros' })

    fireEvent.change(within(filters).getByLabelText('Hasta'), { target: { value: '25' } })
    fireEvent.click(within(filters).getByRole('button', { name: 'Aplicar filtros' }))

    const titles = cards().map((heading) => heading.textContent)
    expect(titles).toEqual(
      expect.arrayContaining(['Yoga al amanecer en El Sunzal', 'Sabores de la feria gastronómica de Juayúa']),
    )
    expect(titles).not.toContain('Surf al atardecer en El Tunco')
  })

  it('la barra de precio y los campos se mantienen sincronizados', () => {
    renderExplorer()
    const filters = screen.getByRole('form', { name: 'Filtros' })

    expect(within(filters).getByText('$0 – $100+')).toBeInTheDocument()

    fireEvent.change(within(filters).getByLabelText('Precio máximo, barra'), { target: { value: '30' } })
    expect(within(filters).getByLabelText('Hasta')).toHaveValue(30)
    expect(within(filters).getByText('$0 – $30')).toBeInTheDocument()

    fireEvent.change(within(filters).getByLabelText('Desde'), { target: { value: '20' } })
    expect(within(filters).getByLabelText('Precio mínimo, barra')).toHaveValue('20')

    // La barra no deja que el mínimo pase al máximo.
    fireEvent.change(within(filters).getByLabelText('Precio mínimo, barra'), { target: { value: '60' } })
    expect(within(filters).getByLabelText('Desde')).toHaveValue(30)

    fireEvent.click(within(filters).getByRole('button', { name: 'Aplicar filtros' }))
    const prices = screen.getAllByText(/^\$\d+ USD$/).map((node) => Number(node.textContent.match(/\d+/)[0]))
    expect(prices.length).toBeGreaterThan(0)
    expect(prices.every((price) => price === 30)).toBe(true)
  })

  it('ordena por precio de menor a mayor', () => {
    renderExplorer()

    fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'precio-asc' } })

    expect(cards()[0]).toHaveTextContent('Centro histórico de San Salvador a pie')
  })

  it('excluye las experiencias cerradas en la fecha elegida (lunes)', () => {
    renderExplorer()

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-11-09' } })
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar búsqueda' }))

    expect(screen.getByRole('status')).toHaveTextContent(/no encontramos experiencias/i)
  })

  it('busca por texto con el parámetro q del encabezado', () => {
    renderExplorer('/experiencias?q=cacao')

    expect(screen.getByText('Resultados para «cacao».')).toBeInTheDocument()
    expect(cards()).toHaveLength(1)
    expect(cards()[0]).toHaveTextContent('Ruta del cacao en Izalco')
  })

  it('cambia entre la vista en lista y en mapa', () => {
    renderExplorer()

    fireEvent.click(screen.getByRole('button', { name: 'Vista en mapa' }))
    expect(screen.getByRole('img', { name: /mapa ilustrativo/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Vista en lista' }))
    expect(cards()).toHaveLength(6)
  })

  it('limpia los filtros', () => {
    renderExplorer()
    const filters = screen.getByRole('form', { name: 'Filtros' })

    fireEvent.click(within(filters).getByLabelText('Surf y playa'))
    fireEvent.click(within(filters).getByRole('button', { name: 'Aplicar filtros' }))
    expect(screen.getByRole('heading', { name: /4 experiencias para descubrir/ })).toBeInTheDocument()

    fireEvent.click(within(filters).getByRole('button', { name: 'Limpiar' }))
    expect(screen.getByRole('heading', { name: /13 experiencias para descubrir/ })).toBeInTheDocument()
  })
})
