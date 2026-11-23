// Métricas del panel del operador, calculadas a partir de sus reservas, cupos y
// experiencias. Cuando exista la API de reportes (HU-20 a HU-22) se reemplazan
// por los datos del servidor.

const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthLabels = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Estados cuyo ingreso se cuenta: la reserva ya está confirmada o realizada.
const paidStatuses = ['Confirmada', 'Completada']
const canceledStatus = 'Cancelada'

function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Los últimos `count` días, del más antiguo al de hoy.
export function lastDays(count, today = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (count - 1 - index))
    return { iso: toIso(date), label: weekdayLabels[date.getDay()], day: date.getDate(), month: date.getMonth() }
  })
}

export function dayRangeLabel(days) {
  if (days.length === 0) return ''
  const first = days[0]
  const last = days[days.length - 1]
  return first.month === last.month
    ? `${first.day}–${last.day} ${monthLabels[last.month]}`
    : `${first.day} ${monthLabels[first.month]}–${last.day} ${monthLabels[last.month]}`
}

const isActive = (reservation) => reservation.status !== canceledStatus

export function reservationsByDay(reservations, days) {
  return days.map((day) => ({
    label: day.label,
    value: reservations.filter((item) => item.isoDate === day.iso && isActive(item)).length,
  }))
}

export function revenueByDay(reservations, experiences, days) {
  const priceOf = new Map(experiences.map((item) => [String(item.id), Number(item.price) || 0]))
  return days.map((day) => ({
    label: day.label,
    value: reservations
      .filter((item) => item.isoDate === day.iso && paidStatuses.includes(item.status))
      .reduce((total, item) => total + (priceOf.get(String(item.experienceId)) ?? 0) * item.guests, 0),
  }))
}

// Reservas acumuladas al cierre de cada uno de los últimos `months` meses.
export function monthlyCumulative(reservations, months = 6, today = new Date()) {
  const active = reservations.filter((item) => isActive(item) && item.isoDate)
  return Array.from({ length: months }, (_, index) => {
    const end = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index) + 1, 0)
    const limit = toIso(end)
    return {
      label: monthLabels[end.getMonth()],
      value: active.filter((item) => item.isoDate <= limit).length,
    }
  })
}

export function cancellationShare(reservations) {
  const total = reservations.length
  const canceled = reservations.filter((item) => item.status === canceledStatus).length
  return {
    total,
    canceled,
    kept: total - canceled,
    percent: total ? Math.round((canceled / total) * 100) : 0,
  }
}

export function occupancy(availability) {
  const total = availability.reduce((sum, item) => sum + Number(item.capacity || 0), 0)
  const assigned = availability.reduce(
    (sum, item) => sum + Math.max(0, Number(item.capacity || 0) - Number(item.available || 0)),
    0,
  )
  return { total, assigned, free: total - assigned, percent: total ? Math.round((assigned / total) * 100) : 0 }
}
