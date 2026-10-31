import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'

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

function setRoleSession(role) {
  const token = createMockJwt({
    sub: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    email: `${role.toLowerCase()}@rutasv.com`,
    given_name: 'Usuario',
    family_name: role,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': role,
    email_verified: 'true',
    exp: 4102444800,
  })
  localStorage.setItem('token', token)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('muestra la portada en /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { name: /el salvador se vive/i }),
    ).toBeInTheDocument()
  })

  it('redirige a /login si un visitante no autenticado intenta abrir /operador/solicitud', () => {
    renderAt('/operador/solicitud')
    expect(
      screen.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
  })

  it('muestra el formulario de solicitud de operador en su ruta para VISITANTE autenticado', () => {
    setRoleSession('VISITANTE')
    renderAt('/operador/solicitud/formulario')
    expect(
      screen.getByRole('heading', { name: /solicita ser operador/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del negocio/i)).toBeInTheDocument()
  })

  it('muestra Sin permiso cuando un VISITANTE intenta acceder a /admin', () => {
    setRoleSession('VISITANTE')
    renderAt('/admin')
    expect(
      screen.getByRole('heading', { name: /sin permiso/i }),
    ).toBeInTheDocument()
  })

  it('muestra el panel del operador y permite abrir sus vistas', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador')

    expect(screen.getByRole('heading', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación del operador' })).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /agregar experiencia/i }).some(
        (link) => link.getAttribute('href') === '/operador/experiencias/nueva',
      ),
    ).toBe(true)
  })

  it('permite buscar y filtrar las experiencias de muestra', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias')

    const search = screen.getByRole('searchbox', { name: 'Buscar experiencias' })
    fireEvent.change(search, { target: { value: 'Apaneca' } })
    expect(screen.getByText('Ruta de café en Apaneca')).toBeInTheDocument()
    expect(screen.queryByText('Atardecer y surf en El Tunco')).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Borrador' }))
    expect(screen.getByText('Caminata al volcán de Santa Ana')).toBeInTheDocument()
    expect(screen.queryByText('Ruta de café en Apaneca')).not.toBeInTheDocument()
  })

  it('valida la publicación de experiencias e informa que aún no se guarda en backend', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar experiencia' }))
    expect(screen.getByLabelText('Nombre de la experiencia')).toBeInvalid()

    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), {
      target: { value: 'Amanecer en el volcán' },
    })
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'Naturaleza' },
    })
    fireEvent.change(screen.getByLabelText('Departamento o zona'), {
      target: { value: 'Santa Ana' },
    })
    fireEvent.change(screen.getByLabelText('Precio por persona (USD)'), {
      target: { value: '35' },
    })
    fireEvent.change(screen.getByLabelText('Capacidad máxima'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Una caminata guiada al amanecer.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar experiencia' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'la experiencia no se guardó porque esta vista aún no está conectada al backend',
    )
  })

  it('muestra cupos y filtra reservas por estado', () => {
    setRoleSession('OPERADOR')
    const { unmount } = renderAt('/operador/calendario')
    expect(screen.getByRole('heading', { name: 'Cupos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar fecha/i })).toBeInTheDocument()

    unmount()
    renderAt('/operador/reservas')
    expect(screen.getByRole('heading', { name: 'Historial de Reservas' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pendiente' }))
    expect(screen.getByText('Daniel Rivera')).toBeInTheDocument()
    expect(screen.queryByText('María López')).not.toBeInTheDocument()
  })

  it('incluye las secciones de reseñas y configuración del operador', () => {
    setRoleSession('OPERADOR')
    const { unmount } = renderAt('/operador/resenas')
    expect(screen.getByRole('heading', { name: 'Reseñas' })).toBeInTheDocument()
    expect(screen.getByText(/una experiencia increíble/i)).toBeInTheDocument()

    unmount()
    renderAt('/operador/configuracion')
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos de contacto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Avisos de reservas')).toBeInTheDocument()
  })

  it('muestra el formulario de inicio de sesión en /login', () => {
    renderAt('/login')
    expect(
      screen.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i }),
    ).toBeInTheDocument()
  })

  it('mantiene el login separado del flujo de verificación', () => {
    const { container } = renderAt('/login')
    const page = within(container)

    fireEvent.change(container.querySelector('#login-email'), {
      target: { value: 'ana@correo.com' },
    })
    fireEvent.change(container.querySelector('#login-password'), {
      target: { value: 'password' },
    })
    fireEvent.click(page.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      page.getByRole('heading', { name: /qué bueno verte de nuevo/i }),
    ).toBeInTheDocument()
    expect(page.queryByRole('heading', { name: /verifica tu correo/i })).not.toBeInTheDocument()
  })

  it('abre el registro desde el botón superior del login', () => {
    const { container } = renderAt('/login')
    fireEvent.click(within(container).getByRole('link', { name: /registro/i }))

    expect(
      within(container).getByRole('heading', { name: /crea tu cuenta/i }),
    ).toBeInTheDocument()
  })

  it('valida los campos obligatorios en el formulario de registro', () => {
    const { container } = renderAt('/registro')

    fireEvent.click(within(container).getByRole('button', { name: /crear cuenta/i }))

    expect(within(container).getByText('Ingresa tu nombre.')).toBeInTheDocument()
    expect(within(container).getByText('Ingresa tu apellido.')).toBeInTheDocument()
    expect(within(container).getByText('Ingresa tu correo electrónico.')).toBeInTheDocument()
  })

  it('renderiza la vista de verificación en /verify-email y autorrellena el token desde ?token=', () => {
    const { container } = renderAt('/verify-email?token=abc123token')

    expect(
      within(container).getByRole('heading', { name: /verifica tu correo/i }),
    ).toBeInTheDocument()
    expect(
      within(container).getByLabelText(/token de verificación/i),
    ).toHaveValue('abc123token')
  })

  it('muestra resultados de verificación aceptada y rechazada', () => {
    const { unmount } = renderAt('/registro/verificacion/aceptada')
    expect(screen.getByRole('heading', { name: /correo verificado/i })).toBeInTheDocument()

    unmount()
    renderAt('/registro/verificacion/rechazada')
    expect(screen.getByRole('heading', { name: /no se pudo verificar/i })).toBeInTheDocument()
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(
      screen.getByRole('heading', { name: /página no encontrada/i }),
    ).toBeInTheDocument()
  })
})
