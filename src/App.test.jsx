import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

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

  it('muestra el formulario de solicitud de operador en su ruta', () => {
    const { container } = renderAt('/operador/solicitud')
    expect(
      screen.getByRole('heading', { name: /solicita ser operador/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del negocio/i)).toBeInTheDocument()
    expect(container.querySelectorAll('header')).toHaveLength(1)
  })
  
  it('muestra el panel del operador y permite abrir sus vistas', () => {
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
    const payload = btoa(JSON.stringify({
      sub: 'operator-a',
      business_name: 'Volcan Tours',
      role: 'operator',
    }))
    localStorage.setItem('token', `e30.${payload}.signature`)

    renderAt('/operador')

    expect(screen.getByText('Hola, Volcan Tours. Aquí tienes la actividad de tu negocio.')).toBeInTheDocument()
    expect(localStorage.getItem('rutasv:operator:operator-a:experiences')).toBeNull()
  })

  it('permite buscar y filtrar las experiencias de muestra', () => {
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

  it('guarda una experiencia localmente como preparación para el backend', () => {
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

    expect(screen.getByRole('status')).toHaveTextContent('guardados en este navegador')
    const savedExperiences = JSON.parse(
      localStorage.getItem('rutasv:operator:demo:experiences'),
    )
    expect(savedExperiences).toContainEqual(
      expect.objectContaining({
        title: 'Amanecer en el volcán',
        category: 'Naturaleza',
        location: 'Santa Ana',
        price: 35,
        capacity: 8,
      }),
    )
  })

  it('carga y guarda los cambios al editar una experiencia', () => {
    renderAt('/operador/experiencias/nueva?editar=1')

    expect(screen.getByRole('heading', { name: 'Editar experiencia' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nombre de la experiencia'), {
      target: { value: 'Surf al atardecer' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    const savedExperiences = JSON.parse(
      localStorage.getItem('rutasv:operator:demo:experiences'),
    )
    expect(savedExperiences.find((item) => item.id === 1).title).toBe('Surf al atardecer')
    expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados')
  })

  it('muestra cupos y filtra reservas por estado', () => {
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

  it('permite añadir una fecha, hora y cupos disponibles', () => {
    renderAt('/operador/cupos')
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar fecha' }))
    fireEvent.change(screen.getByLabelText('Día'), {
      target: { value: '2026-12-10' },
    })
    fireEvent.change(screen.getByLabelText('Hora'), {
      target: { value: '10:30' },
    })
    fireEvent.change(screen.getByLabelText('Capacidad total'), {
      target: { value: '12' },
    })
    fireEvent.change(screen.getByLabelText('Cupos disponibles'), {
      target: { value: '10' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cupos' }))

    const savedAvailability = JSON.parse(
      localStorage.getItem('rutasv:operator:demo:availability'),
    )
    expect(savedAvailability).toContainEqual(
      expect.objectContaining({
        date: '2026-12-10',
        time: '10:30',
        available: 10,
        capacity: 12,
      }),
    )
  })

  it('incluye las secciones de reseñas y configuración del operador', () => {
    const { unmount } = renderAt('/operador/resenas')
    expect(screen.getByRole('heading', { name: 'Reseñas' })).toBeInTheDocument()
    expect(screen.getByText(/una experiencia increíble/i)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Responder' })[0])
    expect(screen.getAllByLabelText('Respuesta pública')[0]).toBeVisible()
    fireEvent.change(screen.getAllByLabelText('Respuesta pública')[0], {
      target: { value: '¡Gracias por visitarnos!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar respuesta' }))
    const savedReviews = JSON.parse(
      localStorage.getItem('rutasv:operator:demo:reviews'),
    )
    expect(savedReviews[0].reply).toBe('¡Gracias por visitarnos!')

    unmount()
    renderAt('/operador/configuracion')
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos de contacto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Avisos de reservas')).toBeInTheDocument()
  })

  it('muestra el formulario de solicitud en /solicitar-operador', () => {
    renderAt('/solicitar-operador')
    expect(
      screen.getByRole('heading', { name: /solicita ser operador/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /progreso de solicitud/i })).toBeInTheDocument()
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
