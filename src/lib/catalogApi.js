import api from '../config/axios.js'

export function extractApiError(error, fallback = 'Ocurrió un error al comunicarse con el servidor.') {
  const data = error?.response?.data
  if (!data) {
    return {
      message: error?.message || fallback,
      code: null,
      status: error?.response?.status ?? null,
      missingFields: [],
      fieldErrors: {},
    }
  }

  const fieldErrors = {}
  if (data.errors && typeof data.errors === 'object') {
    for (const [key, value] of Object.entries(data.errors)) {
      fieldErrors[key] = Array.isArray(value) ? value[0] : String(value)
    }
  }

  const missingFields = Array.isArray(data.missingFields) ? data.missingFields : []
  const firstFieldMsg = Object.values(fieldErrors)[0]
  const message =
    data.detail ||
    firstFieldMsg ||
    data.title ||
    data.message ||
    (typeof data === 'string' ? data : fallback)

  return {
    message,
    code: data.code ?? null,
    status: error?.response?.status ?? data.status ?? null,
    missingFields,
    fieldErrors,
  }
}

export function resolveAssetUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  return url.startsWith('/') ? url : `/${url}`
}

export async function getCategories() {
  const { data } = await api.get('/categories')
  return Array.isArray(data) ? data : []
}

export async function getDepartments() {
  const { data } = await api.get('/departments')
  return Array.isArray(data) ? data : []
}

export async function getMunicipalities(departmentId) {
  const path = departmentId
    ? `/departments/${departmentId}/municipalities`
    : '/municipalities'
  const { data } = await api.get(path)
  return Array.isArray(data) ? data : []
}

export async function getPublicExperiences(params = {}) {
  const clean = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value
    }
  }
  const { data } = await api.get('/experiences', { params: clean })
  return data
}

export async function getExperienceBySlugOrId(slugOrId) {
  const { data } = await api.get(`/experiences/${encodeURIComponent(slugOrId)}`)
  return data
}

export async function getMyExperiences(params = {}) {
  const clean = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value
    }
  }
  const { data } = await api.get('/experiences/my', { params: clean })
  return data
}

export async function createExperience(payload) {
  const { data } = await api.post('/experiences', payload)
  return data
}

export async function updateExperience(id, payload) {
  const { data } = await api.put(`/experiences/${id}`, payload)
  return data
}

export async function publishExperience(id) {
  const { data } = await api.post(`/experiences/${id}/publish`)
  return data
}

export async function pauseExperience(id) {
  const { data } = await api.post(`/experiences/${id}/pause`)
  return data
}

export async function deleteExperience(id) {
  await api.delete(`/experiences/${id}`)
}

export async function withdrawExperience(id, reason) {
  const { data } = await api.post(`/experiences/${id}/withdraw`, { reason })
  return data
}

export async function restoreExperience(id) {
  const { data } = await api.post(`/experiences/${id}/restore`)
  return data
}

export async function removeExperienceImage(experienceId, imageId) {
  const { data } = await api.delete(`/experiences/${experienceId}/images/${imageId}`)
  return data
}

export async function uploadExperienceImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/experiences/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getMyCompanies() {
  const { data } = await api.get('/companies/my')
  return Array.isArray(data) ? data : []
}

export async function getCompanyProfile(idOrSlug) {
  const { data } = await api.get(`/companies/${encodeURIComponent(idOrSlug)}`)
  return data
}

export async function updateCompany(id, payload) {
  const { data } = await api.put(`/companies/${id}`, payload)
  return data
}

export async function uploadCompanyLogo(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/companies/logo/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
