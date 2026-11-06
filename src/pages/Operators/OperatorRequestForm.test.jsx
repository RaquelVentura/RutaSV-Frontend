import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../../config/axios'
import { AuthProvider } from '../../context/AuthContext.jsx'
import MyOperatorRequest from './MyOperatorRequest.jsx'
import OperatorRequestForm from './OperatorRequestForm.jsx'

vi.mock('../../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function createMockJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const jsonPayload = JSON.stringify(payload)
  const utf8Bytes = new TextEncoder().encode(jsonPayload)
  const binary = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('')
  const base64Payload = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${base64Payload}.signature`
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  const token = createMockJwt({
    sub: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    email: 'turista@rutasv.com',
    given_name: 'Mario',
    family_name: 'Bolaños',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'VISITANTE',
    email_verified: 'true',
    exp: 4102444800,
  })
  localStorage.setItem('token', token)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

function renderForm(initialPath = '/operador/solicitud/formulario') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/operador/solicitud" element={<MyOperatorRequest />} />
          <Route
            path="/operador/solicitud/formulario"
            element={<OperatorRequestForm />}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

function completeBusinessDetails() {
  fireEvent.change(screen.getByLabelText(/nombre del negocio/i), {
    target: { value: 'Aventuras El Boquerón' },
  })
  fireEvent.change(screen.getByLabelText(/razón social/i), {
    target: { value: 'Aventuras El Boquerón S.A. de C.V.' },
  })
  fireEvent.change(screen.getByLabelText(/tipo de servicio/i), {
    target: { value: 'Senderismo' },
  })
  fireEvent.change(screen.getByLabelText(/departamento \/ zona/i), {
    target: { value: 'La Libertad' },
  })
  fireEvent.change(screen.getByLabelText(/dirección o punto/i), {
    target: { value: 'Km 18 Carretera al Boquerón, Santa Tecla' },
  })
  fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
    target: { value: '+50322113344' },
  })
  fireEvent.change(screen.getByLabelText(/describe tu negocio/i), {
    target: {
      value: 'Tours guiados de senderismo y avistamiento en el volcán de San Salvador.',
    },
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

    expect(screen.getByLabelText(/nombre del negocio/i)).toHaveValue('Aventuras El Boquerón')
  })

  it('requiere al menos una evidencia antes de enviar al backend', () => {
    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    expect(
      screen.getByText('Adjunta al menos una imagen de tu actividad.'),
    ).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('envía la solicitud a POST /operator-requests con el formato del backend y muestra mensaje de éxito', async () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:evidencia'),
      revokeObjectURL: vi.fn(),
    })

    api.post.mockResolvedValueOnce({
      status: 201,
      data: {
        id: 'a9c1b8e2-4f3a-4b1c-9e2d-1a2b3c4d5e6f',
        userId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
        companyId: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
        status: 'PENDIENTE',
        message: 'Servicio: Senderismo · Zona: La Libertad',
        createdAt: '2026-10-30T15:30:00Z',
        user: {
          id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
          email: 'turista@rutasv.com',
          firstName: 'Mario',
          lastName: 'Bolaños',
          role: 'VISITANTE',
          status: 'ACTIVO',
        },
        company: {
          id: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
          tradeName: 'Aventuras El Boquerón',
          status: 'PENDIENTE',
        },
        documents: [
          {
            id: '11111111-2222-3333-4444-555555555555',
            type: 'FOTO_NEGOCIO',
            objectKey: 'operator-requests/3f2504e0-4f89-11d3-9a0c-0305e82c3301/evidencia.png',
            url: null,
          },
        ],
      },
    })

    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    fireEvent.change(screen.getByLabelText('Adjuntar evidencias de tu actividad'), {
      target: {
        files: [new File(['imagen'], 'evidencia.png', { type: 'image/png' })],
      },
    })
    fireEvent.change(screen.getByLabelText(/enlace a redes/i), {
      target: { value: 'https://www.instagram.com/aventurasboqueron.sv' },
    })

    expect(screen.getByAltText('Evidencia: evidencia.png')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/operator-requests', {
        company: {
          tradeName: 'Aventuras El Boquerón',
          legalName: 'Aventuras El Boquerón S.A. de C.V.',
          description:
            'Tours guiados de senderismo y avistamiento en el volcán de San Salvador.',
          contactEmail: 'turista@rutasv.com',
          contactPhone: '+50322113344',
          whatsapp: null,
          website: 'https://www.instagram.com/aventurasboqueron.sv',
          logoUrl: null,
          municipalityId: null,
          address: 'Km 18 Carretera al Boquerón, Santa Tecla',
        },
        message: 'Servicio: Senderismo · Zona: La Libertad',
        documents: [
          {
            type: 'FOTO_NEGOCIO',
            objectKey:
              'operator-requests/3f2504e0-4f89-11d3-9a0c-0305e82c3301/evidencia.png',
            url: null,
          },
          {
            type: 'ENLACE_REDES',
            objectKey: null,
            url: 'https://www.instagram.com/aventurasboqueron.sv',
          },
        ],
      })
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      /solicitud enviada con éxito/i,
    )
  })

  it('muestra error de conflicto 409 cuando el usuario ya tiene una solicitud pendiente', async () => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:evidencia'),
      revokeObjectURL: vi.fn(),
    })

    api.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          title: 'Solicitud de operador pendiente existente',
          detail: 'Ya existe una solicitud de operador pendiente para este usuario.',
        },
      },
    })

    renderForm()
    completeBusinessDetails()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.change(screen.getByLabelText('Adjuntar evidencias de tu actividad'), {
      target: {
        files: [new File(['imagen'], 'evidencia.png', { type: 'image/png' })],
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una solicitud de operador pendiente para este usuario.',
    )
  })

  it('muestra la vista de estado vacío en /operador/solicitud cuando no hay solicitud y permite ir al formulario', async () => {
    api.get.mockResolvedValueOnce({ status: 204, data: null })

    renderForm('/operador/solicitud')

    expect(
      await screen.findByRole('heading', { name: /solicitud de operador/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/aún no has enviado ninguna solicitud/i),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /crear solicitud de operador/i }))

    expect(
      await screen.findByRole('heading', { name: /solicita ser operador/i }),
    ).toBeInTheDocument()
  })

  it('muestra el motivo de rechazo en /operador/solicitud y permite modificar y reenviar con PUT /operator-requests/:id', async () => {
    const rejectedDto = {
      id: '98c5934f-b45d-485b-9819-f99a4fd1d91b',
      userId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      companyId: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
      status: 'RECHAZADA',
      message: 'Servicio: Surf · Zona: La Libertad',
      rejectionReason: 'La foto del DUI está borrosa, por favor sube una más clara.',
      reviewedAt: '2026-10-31T10:00:00Z',
      createdAt: '2026-10-30T15:30:00Z',
      company: {
        id: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
        tradeName: 'Surf El Tunco',
        legalName: 'Surf El Tunco S.A.',
        description: 'Clases de surf en playa El Tunco.',
        contactEmail: 'turista@rutasv.com',
        contactPhone: '+50370001122',
        address: 'Playa El Tunco, Tamanique',
        status: 'RECHAZADA',
        rejectionReason: 'La foto del DUI está borrosa, por favor sube una más clara.',
      },
      documents: [
        {
          id: '11111111-2222-3333-4444-555555555555',
          type: 'FOTO_NEGOCIO',
          objectKey: 'operator-requests/3f2504e0-4f89-11d3-9a0c-0305e82c3301/surf.png',
          url: '/api/operator-requests/documents/file?objectKey=operator-requests%2F3f2504e0-4f89-11d3-9a0c-0305e82c3301%2Fsurf.png',
        },
      ],
    }

    api.get.mockResolvedValue({ status: 200, data: rejectedDto })
    api.put.mockResolvedValueOnce({
      status: 200,
      data: {
        ...rejectedDto,
        status: 'PENDIENTE',
        rejectionReason: null,
        company: {
          ...rejectedDto.company,
          tradeName: 'Surf El Tunco Renovado',
          status: 'PENDIENTE',
          rejectionReason: null,
        },
      },
    })

    renderForm('/operador/solicitud')

    expect(
      await screen.findByRole('heading', { name: /mi solicitud de operador/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/la foto del dui está borrosa/i),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('link', { name: /corregir y reenviar solicitud/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /solicita ser operador/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del negocio/i)).toHaveValue('Surf El Tunco')

    fireEvent.change(screen.getByLabelText(/nombre del negocio/i), {
      target: { value: 'Surf El Tunco Renovado' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/operator-requests/98c5934f-b45d-485b-9819-f99a4fd1d91b',
        expect.objectContaining({
          company: expect.objectContaining({
            tradeName: 'Surf El Tunco Renovado',
          }),
        }),
      )
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      /solicitud enviada con éxito/i,
    )
  })
})
