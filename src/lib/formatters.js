export const experienceStatusMeta = {
  BORRADOR: { label: 'Borrador', tone: 'neutral' },
  PUBLICADA: { label: 'Publicada', tone: 'success' },
  PAUSADA: { label: 'Pausada', tone: 'pending' },
  RETIRADA: { label: 'Retirada', tone: 'danger' },
  ARCHIVADA: { label: 'Archivada', tone: 'neutral' },
}

export const reservationStatusMeta = {
  PENDIENTE: { label: 'Pendiente', tone: 'pending' },
  CONFIRMADA: { label: 'Confirmada', tone: 'success' },
  PENDIENTE_DECISION: { label: 'Pendiente de decisión', tone: 'pending' },
  COMPLETADA: { label: 'Completada', tone: 'info' },
  CANCELADA: { label: 'Cancelada', tone: 'danger' },
  RECHAZADA: { label: 'Rechazada', tone: 'danger' },
}

export const paymentStatusMeta = {
  PENDIENTE: { label: 'Pago pendiente', tone: 'pending' },
  PAGADO_DEMO: { label: 'Pagado (demo)', tone: 'success' },
  REEMBOLSADO_DEMO: { label: 'Reembolsado 100 %', tone: 'info' },
  REEMBOLSADO_PARCIAL_DEMO: { label: 'Reembolsado 50 %', tone: 'info' },
}

export const refundStatusMeta = {
  EN_PROCESO: { label: 'En proceso', tone: 'pending' },
  REALIZADO: { label: 'Realizado', tone: 'success' },
}

export const availabilityStatusMeta = {
  ABIERTA: { label: 'Abierta', tone: 'success' },
  AGOTADA: { label: 'Agotada', tone: 'pending' },
  BLOQUEADA: { label: 'Bloqueada', tone: 'neutral' },
  CANCELADA: { label: 'Cancelada', tone: 'danger' },
}

export const difficultyLabels = {
  FACIL: 'Fácil',
  MODERADA: 'Moderada',
  DIFICIL: 'Difícil',
}

export const dayOfWeekLabels = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount ?? 0)
  return `${currency === 'USD' ? '$' : `${currency} `}${num.toFixed(2)}`
}

export function formatDuration(minutes) {
  if (!minutes || Number(minutes) <= 0) return 'Flexible'
  const total = Number(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`
  return `${h} h ${m} min`
}

export function formatDateReadable(isoDate) {
  if (!isoDate) return '—'
  const parts = String(isoDate).slice(0, 10).split('-')
  if (parts.length !== 3) return isoDate
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return date.toLocaleDateString('es-SV', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTimeReadable(isoDateTime) {
  if (!isoDateTime) return '—'
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return isoDateTime
  return date.toLocaleString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
