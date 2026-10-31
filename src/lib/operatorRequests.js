import api from '../config/axios.js'

export const OperatorRequestStatus = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
}

export const OperatorRequestDocumentType = {
  DUI_FRENTE: 'DUI_FRENTE',
  DUI_REVERSO: 'DUI_REVERSO',
  FOTO_NEGOCIO: 'FOTO_NEGOCIO',
  ENLACE_REDES: 'ENLACE_REDES',
  REGISTRO_TURISMO: 'REGISTRO_TURISMO',
  OTRO: 'OTRO',
}

export const DocumentTypeLabels = {
  DUI_FRENTE: 'DUI (Frente)',
  DUI_REVERSO: 'DUI (Reverso)',
  FOTO_NEGOCIO: 'Foto del negocio',
  ENLACE_REDES: 'Enlace a redes sociales',
  REGISTRO_TURISMO: 'Registro de turismo',
  OTRO: 'Otro documento',
}

export const StatusMeta = {
  PENDIENTE: { tone: 'pending', label: 'Pendiente' },
  APROBADA: { tone: 'success', label: 'Aprobada' },
  RECHAZADA: { tone: 'danger', label: 'Rechazada' },
  CANCELADA: { tone: 'neutral', label: 'Cancelada' },
}

export function extractBackendErrorMessage(
  error,
  fallback = 'Ocurrió un error al procesar la solicitud.',
) {
  const data = error?.response?.data
  if (!data) {
    return error?.message || fallback
  }

  if (typeof data === 'string' && data.trim()) {
    return data.trim()
  }

  if (data.errors && typeof data.errors === 'object') {
    const fieldMessages = Object.values(data.errors).flat().filter(Boolean)
    if (fieldMessages.length > 0) {
      return fieldMessages.join(' ')
    }
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail.trim()
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim()
  }

  if (typeof data.title === 'string' && data.title.trim()) {
    return data.title.trim()
  }

  return fallback
}

export function formatShortDate(dateValue) {
  if (!dateValue) return 'Reciente'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function formatLongDate(dateValue) {
  if (!dateValue) return 'Fecha no disponible'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function normalizeOperatorRequest(dto) {
  if (!dto || typeof dto !== 'object') return null

  const user = dto.user ?? {}
  const company = dto.company ?? {}
  const documents = Array.isArray(dto.documents) ? dto.documents : []

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  const status = String(dto.status || 'PENDIENTE').toUpperCase()
  const companyStatus = String(company.status || status || 'PENDIENTE').toUpperCase()

  const socialDoc = documents.find(
    (doc) => String(doc.type).toUpperCase() === 'ENLACE_REDES' && doc.url,
  )

  const createdAt = dto.createdAt || company.createdAt || null
  const createdTimestamp = createdAt ? new Date(createdAt).getTime() : 0

  return {
    id: String(dto.id ?? ''),
    userId: dto.userId ?? user.id ?? null,
    companyId: dto.companyId ?? company.id ?? null,
    status,
    companyStatus,
    message: dto.message ?? null,
    rejectionReason: dto.rejectionReason ?? company.rejectionReason ?? null,
    reviewedBy: dto.reviewedBy ?? company.approvedBy ?? null,
    reviewedAt: dto.reviewedAt ?? company.approvedAt ?? null,
    createdAt,
    updatedAt: dto.updatedAt ?? company.updatedAt ?? null,
    order: Number.isFinite(createdTimestamp) ? createdTimestamp : 0,
    sentAt: dto.sentAt || formatShortDate(createdAt),
    sentShort: dto.sentShort || formatShortDate(createdAt),
    sentLong: dto.sentLong || formatLongDate(createdAt),
    name: fullName || dto.name || user.email || 'Solicitante',
    email: user.email || dto.email || '—',
    userPhone: user.phone || '—',
    userRole: user.role || 'VISITANTE',
    userStatus: user.status || 'ACTIVO',
    business: company.tradeName || dto.business || 'Sin nombre comercial',
    tradeName: company.tradeName || dto.business || 'Sin nombre comercial',
    legalName: company.legalName || null,
    description: company.description || dto.description || 'Sin descripción',
    contactEmail: company.contactEmail || user.email || dto.email || '—',
    phone: company.contactPhone || user.phone || dto.phone || '—',
    whatsapp: company.whatsapp || null,
    website: company.website || socialDoc?.url || dto.link || null,
    logoUrl: company.logoUrl || null,
    municipalityId: company.municipalityId ?? null,
    address: company.address || dto.address || 'Sin dirección especificada',
    user,
    company,
    documents,
  }
}

export function resolveDocumentImageUrl(doc) {
  if (!doc || typeof doc !== 'object') return null
  const typeKey = String(doc.type || '').toUpperCase()
  if (typeKey === OperatorRequestDocumentType.ENLACE_REDES) {
    return null
  }

  if (typeof doc.url === 'string' && doc.url.trim()) {
    return doc.url.trim()
  }

  if (typeof doc.objectKey === 'string' && doc.objectKey.trim()) {
    return `/api/operator-requests/documents/file?objectKey=${encodeURIComponent(
      doc.objectKey.trim(),
    )}`
  }

  return null
}

export async function uploadOperatorRequestDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

  const response = await fetch('/api/operator-requests/documents/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`)
  }

  const data = await response.json()
  return {
    objectKey: data?.objectKey || null,
    url: data?.url || null,
  }
}

export async function getMyOperatorRequest() {
  const response = await api.get('/operator-requests/my')
  if (!response || response.status === 204 || !response.data) {
    return null
  }
  return normalizeOperatorRequest(response.data)
}

export async function createOperatorRequest(payload) {
  const response = await api.post('/operator-requests', payload)
  return normalizeOperatorRequest(response.data)
}

export async function updateOperatorRequest(requestId, payload) {
  const response = await api.put(`/operator-requests/${requestId}`, payload)
  return normalizeOperatorRequest(response.data)
}

export async function getOperatorRequests({
  pageNumber = 1,
  pageSize = 10,
  status,
} = {}) {
  const params = {
    pageNumber,
    pageSize,
  }

  if (status && status !== 'todos' && status !== 'TODOS') {
    params.status = status
  }

  const response = await api.get('/operator-requests', { params })
  const raw = response.data ?? {}
  const items = Array.isArray(raw.data)
    ? raw.data.map(normalizeOperatorRequest).filter(Boolean)
    : []

  return {
    data: items,
    totalRecords: raw.totalRecords ?? items.length,
    totalPages: raw.totalPages ?? 1,
    currentPage: raw.currentPage ?? pageNumber,
    pageSize: raw.pageSize ?? pageSize,
  }
}

export async function reviewOperatorRequest(
  requestId,
  { isApproved, rejectionReason = null },
) {
  const response = await api.post(`/operator-requests/${requestId}/review`, {
    isApproved: Boolean(isApproved),
    rejectionReason: isApproved ? null : rejectionReason?.trim() || null,
  })
  return normalizeOperatorRequest(response.data)
}
