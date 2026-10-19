const baseUrl = '/api'

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${path}`)
  }

  return response.status === 204 ? null : response.json()
}
