import { describe, expect, it } from 'vitest'
import { ApiError } from './ApiError.js'
import { getErrorMessage, getErrorMessages } from './errors.js'

describe('getErrorMessages', () => {
  it('devuelve los errores de validación por campo', () => {
    const error = new ApiError(400, {
      title: 'Error de validación',
      detail: 'Uno o más campos contienen errores de validación.',
      errors: {
        Email: ['El correo electrónico es obligatorio.'],
        Password: ['La contraseña es obligatoria.', 'La contraseña debe tener al menos 8 caracteres.'],
      },
    })

    expect(getErrorMessages(error)).toEqual([
      'El correo electrónico es obligatorio.',
      'La contraseña es obligatoria.',
      'La contraseña debe tener al menos 8 caracteres.',
    ])
  })

  it('usa el detalle del backend en errores de negocio', () => {
    const error = new ApiError(401, { title: 'Credenciales inválidas', detail: 'Correo o contraseña incorrectos.' })
    expect(getErrorMessage(error)).toBe('Correo o contraseña incorrectos.')
  })

  it('traduce 403 y 500 a mensajes claros', () => {
    expect(getErrorMessage(new ApiError(403))).toBe('No tienes permiso para realizar esta acción.')
    expect(getErrorMessage(new ApiError(500, { detail: 'detalle interno' }))).toBe(
      'El servidor tuvo un problema. Inténtalo más tarde.',
    )
  })

  it('avisa cuando no hay conexión con el servidor', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'No se pudo conectar con el servidor. Revisa tu conexión.',
    )
  })
})
