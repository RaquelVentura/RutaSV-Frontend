import { ApiError } from './ApiError.js'

const fallbackMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.'

export function getErrorMessages(error) {
  if (error instanceof ApiError) {
    const fieldMessages = Object.values(error.fieldErrors).flat()
    if (fieldMessages.length > 0) return fieldMessages
    if (error.status === 403) {
      return ['No tienes permiso para realizar esta acción.']
    }
    if (error.status >= 500) {
      return ['El servidor tuvo un problema. Inténtalo más tarde.']
    }
    return [error.message || fallbackMessage]
  }

  if (error instanceof TypeError) {
    return ['No se pudo conectar con el servidor. Revisa tu conexión.']
  }

  return [error?.message || fallbackMessage]
}

export function getErrorMessage(error) {
  return getErrorMessages(error).join(' ')
}
