import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../App.jsx'

afterEach(cleanup)

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Vistas de administrador', () => {
  it('muestra el dashboard con resumen, solicitudes pendientes y actividad', () => {
    renderAt('/admin')

    expect(screen.getByRole('heading', { name: /hola, administrador/i })).toBeInTheDocument()
    expect(screen.getByText('Solicitudes pendientes')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /solicitudes de operador pendientes/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /actividad reciente/i })).toBeInTheDocument()
  })

  it('navega del dashboard a la cola de solicitudes', () => {
    renderAt('/admin')
    fireEvent.click(screen.getByRole('link', { name: /ver solicitudes/i }))

    expect(
      screen.getByRole('heading', { name: /solicitudes de operador/i, level: 1 }),
    ).toBeInTheDocument()
  })

  it('lista las solicitudes y abre el detalle con Revisar', () => {
    renderAt('/admin/solicitudes')

    expect(screen.getByText('Ecoparque El Espino')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('link', { name: /revisar/i })[0])

    expect(screen.getByRole('heading', { name: /solicitud de josue antonio/i })).toBeInTheDocument()
  })

  it('filtra la cola y muestra el estado vacío sin coincidencias', () => {
    renderAt('/admin/solicitudes')

    fireEvent.change(screen.getByLabelText(/buscar solicitudes/i), {
      target: { value: 'zzzz' },
    })

    expect(screen.getByText(/ninguna solicitud coincide/i)).toBeInTheDocument()
  })

  it('aprueba una solicitud desde el diálogo de confirmación', () => {
    renderAt('/admin/solicitudes/josue-antonio')

    fireEvent.click(screen.getByRole('button', { name: /aprobar solicitud/i }))
    const dialog = screen.getByRole('dialog', { name: /¿aprobar la solicitud\?/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /sí, aprobar/i }))

    expect(screen.getByText(/solicitud aprobada\. se envió un correo/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('exige un motivo para rechazar y luego confirma el rechazo', () => {
    renderAt('/admin/solicitudes/josue-antonio')

    fireEvent.click(screen.getByRole('button', { name: /^rechazar solicitud$/i }))
    expect(screen.getByText(/escribe un motivo para poder rechazar/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/motivo del rechazo/i), {
      target: { value: 'Las imágenes no muestran la actividad.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^rechazar solicitud$/i }))
    const dialog = screen.getByRole('dialog', { name: /rechazar solicitud/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /^rechazar solicitud$/i }))

    expect(screen.getByText(/solicitud rechazada\. se notificó/i)).toBeInTheDocument()
  })

  it('avisa cuando la solicitud no existe', () => {
    renderAt('/admin/solicitudes/no-existe')
    expect(screen.getByRole('heading', { name: /solicitud no encontrada/i })).toBeInTheDocument()
  })

  it('lista usuarios y filtra por rol', () => {
    renderAt('/admin/usuarios')

    expect(screen.getByText('Ana López')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'OPERADOR' } })

    expect(screen.queryByText('Ana López')).not.toBeInTheDocument()
    expect(screen.getByText('Marta Rivas')).toBeInTheDocument()
  })

  it('crea un usuario y vuelve a la lista con aviso', () => {
    renderAt('/admin/usuarios')
    fireEvent.click(screen.getByRole('link', { name: /crear usuario/i }))

    expect(screen.getByRole('heading', { name: /^crear usuario$/i })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Mena' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'ana.mena@correo.com' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña temporal/i), {
      target: { value: 'Temporal123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^crear usuario$/i }))

    expect(screen.getByRole('heading', { name: /^usuarios$/i })).toBeInTheDocument()
    expect(screen.getByText(/usuario creado: ana mena/i)).toBeInTheDocument()
  })
})
