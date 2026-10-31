import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext.jsx'
import OperatorRequestForm from './OperatorRequestForm.jsx'

afterEach(cleanup)
afterEach(() => vi.unstubAllGlobals())

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/operador/solicitud']}>
      <AuthProvider>
        <OperatorRequestForm />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function completeBusinessDetails() {
  fireEvent.change(screen.getByLabelText(/nombre del negocio/i), {
    target: { value: 'Olas del Pacífico' },
  })
  fireEvent.change(screen.getByLabelText(/tipo de servicio/i), {
    target: { value: 'Surf' },
  })
  fireEvent.change(screen.getByLabelText(/departamento \/ zona/i), {
    target: { value: 'La Libertad' },
  })
  fireEvent.change(screen.getByLabelText(/dirección o punto/i), {
    target: { value: 'El Tunco' },
  })
  fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
    target: { value: '+503 7000 0000' },
  })
  fireEvent.change(screen.getByLabelText(/describe tu negocio/i), {
    target: { value: 'Clases de surf para visitantes.' },
  })
  fireEvent.click(screen.getByRole('checkbox'))
}

describe('OperatorRequestForm', () => {
  it('muestra la primera etapa y valida los campos requeridos', () => {
    renderForm()

    expect(
      screen.getByRole('heading', { name: 'Solicita ser operador' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByText('Ingresa el nombre del negocio o guía.')).toBeInTheDocument()
    expect(screen.getByText('Confirma que los datos son verídicos.')).toBeInTheDocument()
  })

  it('permite avanzar, volver y conserva los datos ingresados', () => {
    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByRole('heading', { name: 'Muéstranos lo que haces' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))

    expect(screen.getByLabelText(/nombre del negocio/i)).toHaveValue('Olas del Pacífico')
  })

  it('requiere una evidencia y no presenta la solicitud como enviada sin backend', () => {
    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    expect(
      screen.getByText('Adjunta al menos una imagen de tu actividad.'),
    ).toBeInTheDocument()
  })

  it('previsualiza una evidencia e informa que el envío requiere conexión al backend', () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:evidencia'),
      revokeObjectURL: vi.fn(),
    })
    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.change(screen.getByLabelText('Adjuntar evidencias de tu actividad'), {
      target: {
        files: [new File(['imagen'], 'evidencia.png', { type: 'image/png' })],
      },
    })

    expect(screen.getByAltText('Evidencia: evidencia.png')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'la solicitud no se envió porque esta vista aún no está conectada al backend',
    )
  })
})
