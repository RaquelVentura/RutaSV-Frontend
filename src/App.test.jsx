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

// Las vistas del operador guardan sus datos localmente (operatorRepository.js)
// con una clave que depende del perfil activo; la buscamos por colección.
function readSaved(collection) {
  const keys = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  )
  const key = keys.find(
    (item) => item.startsWith('rutasv:operator:') && item.endsWith(`:${collection}`),
  )
  return key ? JSON.parse(localStorage.getItem(key)) : null
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

  it('personaliza el resumen con el perfil activo', () => {
    localStorage.setItem(
      'token',
      createMockJwt({
        sub: 'operator-a',
        email: 'operator-a@rutasv.com',
        business_name: 'Volcan Tours',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'OPERADOR',
        email_verified: 'true',
        exp: 4102444800,
      }),
    )

    renderAt('/operador')

    expect(
      screen.getByText('Hola, Volcan Tours. Aquí tienes la actividad de tu negocio.'),
    ).toBeInTheDocument()
    expect(readSaved('experiences')).toBeNull()
  })

  it('permite buscar y filtrar las experiencias de muestra', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias')

    const search = screen.getByRole('searchbox', { name: 'Buscar experiencias' })
    fireEvent.change(search, { target: { value: 'Apaneca' } })
    expect(screen.getByText('Ruta de café en Apaneca')).toBeInTheDocument()
    expect(screen.queryByText('Atardecer y surf en El Tunco')).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'Borrador' } })
    expect(screen.getByText('Caminata al volcán de Santa Ana')).toBeInTheDocument()
    expect(screen.queryByText('Ruta de café en Apaneca')).not.toBeInTheDocument()
  })

  it('guarda una experiencia localmente como preparación para el backend', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe el nombre de la experiencia')

    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), {
      target: { value: 'Amanecer en el volcán' },
    })
    fireEvent.change(screen.getByLabelText('Categoría'), {
      target: { value: 'Naturaleza' },
    })
    fireEvent.change(screen.getByLabelText('Departamento'), {
      target: { value: 'Santa Ana' },
    })
    fireEvent.change(screen.getByLabelText('Municipio'), {
      target: { value: 'Coatepeque' },
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
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    expect(screen.getByRole('heading', { name: 'Mis experiencias' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Borrador «Amanecer en el volcán» guardado.')
    expect(readSaved('experiences')).toContainEqual(
      expect.objectContaining({
        title: 'Amanecer en el volcán',
        category: 'Naturaleza',
        department: 'Santa Ana',
        municipality: 'Coatepeque',
        location: 'Coatepeque, Santa Ana',
        price: 35,
        capacity: 8,
        status: 'Borrador',
      }),
    )
  })

  it('el municipio depende del departamento', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    const municipality = screen.getByLabelText('Municipio')
    expect(municipality).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: 'La Libertad' } })
    expect(screen.getByLabelText('Municipio')).toBeEnabled()
    expect(within(screen.getByLabelText('Municipio')).getByRole('option', { name: 'Tamanique' })).toBeInTheDocument()
    expect(within(screen.getByLabelText('Municipio')).queryByRole('option', { name: 'Coatepeque' })).not.toBeInTheDocument()
  })

  it('exige mínimo 3 fotos para publicar y permite agregarlas', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), { target: { value: 'Yoga en la playa' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Playa' } })
    fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: 'La Libertad' } })
    fireEvent.change(screen.getByLabelText('Municipio'), { target: { value: 'Tamanique' } })
    fireEvent.change(screen.getByLabelText('Precio por persona (USD)'), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText('Capacidad máxima'), { target: { value: '10' } })

    expect(screen.getByText(/0 de 3 fotos mínimas/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar experiencia' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Sube al menos 3 fotos para publicar. Faltan 3.')

    const files = ['a.jpg', 'b.jpg', 'c.png'].map(
      (name) => new File(['x'], name, { type: name.endsWith('png') ? 'image/png' : 'image/jpeg' }),
    )
    fireEvent.change(screen.getByLabelText(/Agregar imágenes/), { target: { files } })
    expect(screen.getByText(/3 fotos · Máximo 8 por experiencia/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Publicar experiencia' }))
    expect(screen.getByRole('status')).toHaveTextContent('«Yoga en la playa» quedó publicada.')
    expect(readSaved('experiences')).toContainEqual(
      expect.objectContaining({ title: 'Yoga en la playa', status: 'Publicada', photoCount: 3 }),
    )
  })

  it('desactiva una experiencia con confirmación y permite reactivarla', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias')

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar Atardecer y surf en El Tunco' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('¿Desactivar esta experiencia?')).toBeInTheDocument()

    // Cancelar no cambia nada.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar Atardecer y surf en El Tunco' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desactivar' }))

    expect(screen.getByRole('status')).toHaveTextContent('«Atardecer y surf en El Tunco» quedó desactivada.')
    expect(readSaved('experiences').find((item) => item.id === 1)).toMatchObject({
      status: 'Desactivada',
      previousStatus: 'Publicada',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reactivar Atardecer y surf en El Tunco' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reactivar' }))
    expect(readSaved('experiences').find((item) => item.id === 1).status).toBe('Publicada')
  })

  it('no crea la misma experiencia varias veces al volver a enviar', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), { target: { value: 'Solo una vez' } })
    const draft = screen.getByRole('button', { name: 'Guardar borrador' })
    fireEvent.click(draft)
    fireEvent.click(draft)

    expect(readSaved('experiences').filter((item) => item.title === 'Solo una vez')).toHaveLength(1)
  })

  it('rechaza archivos que no son JPG o PNG', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva')

    fireEvent.change(screen.getByLabelText(/Agregar imágenes/), {
      target: { files: [new File(['x'], 'documento.pdf', { type: 'application/pdf' })] },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('no es JPG ni PNG')
  })

  it('carga y guarda los cambios al editar una experiencia', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/experiencias/nueva?editar=1')

    expect(screen.getByRole('heading', { name: 'Editar experiencia' })).toBeInTheDocument()
    expect(screen.getByLabelText('Departamento')).toHaveValue('La Libertad')
    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), {
      target: { value: 'Surf al atardecer' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    expect(readSaved('experiences').find((item) => item.id === 1).title).toBe(
      'Surf al atardecer',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados en «Surf al atardecer».')
  })

  it('muestra cupos y filtra reservas por estado', () => {
    setRoleSession('OPERADOR')
    const { unmount } = renderAt('/operador/calendario')
    expect(screen.getByRole('heading', { name: 'Cupos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar fecha/i })).toBeInTheDocument()

    unmount()
    renderAt('/operador/reservas')
    expect(screen.getByRole('heading', { name: 'Historial de Reservas' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filtrar reservas por estado'), { target: { value: 'Pendiente' } })
    expect(screen.getByText('Daniel Rivera')).toBeInTheDocument()
    expect(screen.queryByText('María López')).not.toBeInTheDocument()
  })

  it('muestra el calendario de cupos con el detalle del día seleccionado', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/cupos')

    const calendar = screen.getByRole('region', { name: 'Calendario de disponibilidad' })
    expect(within(calendar).getByRole('heading', { name: /noviembre de 2026/i })).toBeInTheDocument()
    expect(within(calendar).getByRole('button', { name: '14 de noviembre, 6 de 8 cupos' })).toBeInTheDocument()
    expect(within(calendar).getByRole('button', { name: '2 de noviembre, sin sesiones' })).toBeInTheDocument()

    fireEvent.click(within(calendar).getByRole('button', { name: '21 de noviembre, 4 de 8 cupos' }))
    const detail = screen.getByRole('region', { name: 'Fecha seleccionada' })
    expect(within(detail).getByText(/sábado, 21 de noviembre de 2026/i)).toBeInTheDocument()
    expect(within(detail).getByText('4 de 8 espacios disponibles')).toBeInTheDocument()

    fireEvent.click(within(detail).getByRole('button', { name: 'Editar cupos' }))
    expect(screen.getByLabelText('Cupos disponibles')).toHaveValue(4)

    fireEvent.click(within(calendar).getByRole('button', { name: 'Siguiente ›' }))
    expect(within(calendar).getByRole('heading', { name: /diciembre de 2026/i })).toBeInTheDocument()
  })

  it('el resumen del operador muestra el calendario de disponibilidad', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador')

    expect(screen.getByRole('region', { name: 'Calendario de disponibilidad' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /editar cupos/i })).toHaveAttribute('href', '/operador/cupos')
  })

  it('permite añadir una fecha, hora y cupos disponibles', () => {
    setRoleSession('OPERADOR')
    renderAt('/operador/cupos')
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar fecha' }))
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '2026-12-10' } })
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10:30' } })
    fireEvent.change(screen.getByLabelText('Capacidad total'), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText('Cupos disponibles'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cupos' }))

    expect(readSaved('availability')).toContainEqual(
      expect.objectContaining({
        date: '2026-12-10',
        time: '10:30',
        available: 10,
        capacity: 12,
      }),
    )
  })

  it('incluye las secciones de reseñas y configuración del operador', () => {
    setRoleSession('OPERADOR')
    const { unmount } = renderAt('/operador/resenas')
    expect(screen.getByRole('heading', { name: 'Reseñas' })).toBeInTheDocument()
    expect(screen.getByText(/una experiencia increíble/i)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Responder' })[0])
    expect(screen.getAllByLabelText('Respuesta pública')[0]).toBeVisible()
    fireEvent.change(screen.getAllByLabelText('Respuesta pública')[0], {
      target: { value: '¡Gracias por visitarnos!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar respuesta' }))
    expect(readSaved('reviews')[0].reply).toBe('¡Gracias por visitarnos!')

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
