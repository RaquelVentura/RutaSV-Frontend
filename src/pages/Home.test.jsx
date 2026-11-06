import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Home from './Home.jsx'

afterEach(cleanup)

function SearchLocation() {
  const location = useLocation()
  return <p>{`${location.pathname}${location.search}`}</p>
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiencias" element={<SearchLocation />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('muestra el hero y las secciones principales', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { name: /el salvador se vive, no solo se visita/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /qué te mueve hoy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /experiencias destacadas/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tu próxima aventura en tres pasos/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /lo dicen quienes ya fueron/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /conoces un lugar que merece ser vivido/i })).toBeInTheDocument()
  })

  it('lista las experiencias destacadas con precio y cupos', () => {
    renderHome()

    expect(screen.getByText('Surf al atardecer en El Tunco')).toBeInTheDocument()
    expect(screen.getByText('$45 USD')).toBeInTheDocument()
    expect(screen.getByText('6 cupos')).toBeInTheDocument()
  })

  it('envía la búsqueda del hero al catálogo con los filtros elegidos', () => {
    renderHome()

    fireEvent.change(screen.getByLabelText('Zona'), { target: { value: 'El Tunco' } })
    fireEvent.change(screen.getByLabelText('Personas'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /buscar experiencias/i }))

    expect(screen.getByText('/experiencias?zona=El+Tunco&personas=3')).toBeInTheDocument()
  })

  it('valida el correo del boletín', () => {
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: /quiero inspirarme/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/ingresa tu correo/i)
  })
})
