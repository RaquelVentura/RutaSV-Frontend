import api from '../config/axios.js'

function cleanParams(params = {}) {
  const clean = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value
    }
  }
  return clean
}

// --- Disponibilidad y horarios ---
export async function getExperienceAvailabilities(experienceId, params = {}) {
  const { data } = await api.get(`/experiences/${experienceId}/availabilities`, {
    params: cleanParams(params),
  })
  return Array.isArray(data) ? data : []
}

export async function getMyAvailabilities(params = {}) {
  const { data } = await api.get('/availabilities/my', {
    params: cleanParams(params),
  })
  return Array.isArray(data) ? data : []
}

export async function createAvailability(experienceId, payload) {
  const { data } = await api.post(`/experiences/${experienceId}/availabilities`, payload)
  return data
}

export async function updateAvailability(id, payload) {
  const { data } = await api.put(`/availabilities/${id}`, payload)
  return data
}

export async function cancelAvailability(id, reason = '') {
  const { data } = await api.post(`/availabilities/${id}/cancel`, { reason })
  return data
}

export async function getExperienceSchedules(experienceId) {
  const { data } = await api.get(`/experiences/${experienceId}/schedules`)
  return Array.isArray(data) ? data : []
}

export async function createExperienceSchedule(experienceId, payload) {
  const { data } = await api.post(`/experiences/${experienceId}/schedules`, payload)
  return data
}

export async function deleteExperienceSchedule(scheduleId) {
  await api.delete(`/schedules/${scheduleId}`)
}

export async function generateAvailabilities(experienceId, payload) {
  const { data } = await api.post(`/experiences/${experienceId}/availabilities/generate`, payload)
  return Array.isArray(data) ? data : []
}

// --- Favoritos ---
export async function getMyFavorites() {
  const { data } = await api.get('/favorites')
  return Array.isArray(data) ? data : []
}

export async function getMyFavoriteIds() {
  const { data } = await api.get('/favorites/ids')
  return Array.isArray(data) ? data : []
}

export async function addFavorite(experienceId) {
  await api.post(`/favorites/${experienceId}`)
}

export async function removeFavorite(experienceId) {
  await api.delete(`/favorites/${experienceId}`)
}

// --- Reservas, pagos demo, cancelaciones, incidencias RN-21 y reembolsos ---
export async function createWebReservation(payload) {
  const { data } = await api.post('/reservations', payload)
  return data
}

export async function createInPersonReservation(payload) {
  const { data } = await api.post('/reservations/in-person', payload)
  return data
}

export async function getMyReservations(params = {}) {
  const { data } = await api.get('/reservations/my', {
    params: cleanParams(params),
  })
  return data
}

export async function getOperatorReservations(params = {}) {
  const { data } = await api.get('/reservations/operator', {
    params: cleanParams(params),
  })
  return data
}

export async function getReservationById(id) {
  const { data } = await api.get(`/reservations/${id}`)
  return data
}

export async function getCancelPreview(id) {
  const { data } = await api.get(`/reservations/${id}/cancel-preview`)
  return data
}

export async function confirmReservation(id) {
  const { data } = await api.post(`/reservations/${id}/confirm`)
  return data
}

export async function rejectReservation(id, reason) {
  const { data } = await api.post(`/reservations/${id}/reject`, { reason })
  return data
}

export async function completeReservation(id) {
  const { data } = await api.post(`/reservations/${id}/complete`)
  return data
}

export async function rescheduleReservationByOperator(id, payload) {
  const { data } = await api.put(`/reservations/${id}/reschedule`, payload)
  return data
}

export async function cancelReservation(id, reason = '') {
  const { data } = await api.post(`/reservations/${id}/cancel`, { reason })
  return data
}

export async function getIncidentOptions(id) {
  const { data } = await api.get(`/reservations/${id}/incident/options`)
  return Array.isArray(data) ? data : []
}

export async function resolveIncident(id, payload) {
  const { data } = await api.post(`/reservations/${id}/incident/resolve`, payload)
  return data
}

export async function getOperatorRefunds() {
  const { data } = await api.get('/refunds')
  return Array.isArray(data) ? data : []
}

export async function getRefundByIdOrCode(idOrCode) {
  const { data } = await api.get(`/refunds/${encodeURIComponent(idOrCode)}`)
  return data
}

export async function completeRefund(id, notes = '') {
  const { data } = await api.post(`/refunds/${id}/complete`, { notes })
  return data
}
