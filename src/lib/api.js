import { ApiError } from './ApiError.js'
import { getToken } from './auth/session.js'

const baseUrl = '/api'

async function readProblem(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken()

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response))
  }

  return response.status === 204 ? null : response.json()
}

export function jsonBody(data) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
