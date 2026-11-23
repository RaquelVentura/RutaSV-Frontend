// Disponibilidad de ejemplo para el calendario del detalle. Se reemplaza por los
// cupos reales por fecha cuando la API los devuelva (HU-11 y HU-16).

const dayMs = 24 * 60 * 60 * 1000

export function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Cupos por fecha: el lunes cierra, las fechas pasadas no se pueden reservar y
// el resto se calcula de forma estable a partir del día del mes.
export function getSpotsForDate(date, capacity, today = new Date()) {
  const day = startOfDay(date)
  if (day < startOfDay(today)) return { status: 'past', spots: 0 }
  if (day.getDay() === 1) return { status: 'closed', spots: 0 }
  const seed = day.getDate() + day.getMonth() * 3
  if (seed % 11 === 0) return { status: 'full', spots: 0 }
  const taken = seed % 7 === 0 ? capacity - 2 : seed % 5 === 0 ? capacity - 4 : seed % 3 === 0 ? 2 : 0
  const spots = Math.max(capacity - taken, 1)
  return { status: spots <= Math.ceil(capacity / 2) ? 'few' : 'available', spots }
}

export function getMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const total = new Date(year, month + 1, 0).getDate()
  // Semana que empieza en lunes.
  const offset = (first.getDay() + 6) % 7
  const cells = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= total; day += 1) cells.push(new Date(year, month, day))
  return cells
}

export function findFirstAvailableDate(capacity, today = new Date()) {
  for (let i = 0; i < 90; i += 1) {
    const candidate = new Date(startOfDay(today).getTime() + i * dayMs)
    const { status } = getSpotsForDate(candidate, capacity, today)
    if (status === 'available' || status === 'few') return candidate
  }
  return null
}

const longFormatter = new Intl.DateTimeFormat('es-SV', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatLongDate(date) {
  const text = longFormatter.format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
