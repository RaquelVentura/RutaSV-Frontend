export const experiences = [
  {
    id: 1,
    title: 'Atardecer y surf en El Tunco',
    category: 'Aventura',
    location: 'La Libertad',
    price: 35,
    capacity: 8,
    photoCount: 4,
    lat: 13.4917,
    lng: -89.3832,
    bookings: 18,
    status: 'Publicada',
    color: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 2,
    title: 'Ruta de café en Apaneca',
    category: 'Cultura y café',
    location: 'Ahuachapán',
    price: 28,
    capacity: 8,
    photoCount: 5,
    lat: 13.8561,
    lng: -89.8003,
    bookings: 12,
    status: 'Publicada',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    id: 3,
    title: 'Caminata al volcán de Santa Ana',
    category: 'Naturaleza',
    location: 'Santa Ana',
    price: 42,
    capacity: 10,
    photoCount: 1,
    bookings: 0,
    status: 'Borrador',
    color: 'bg-stone-100 text-stone-700',
  },
]

const hour = 60 * 60 * 1000
const inHours = (hours) => new Date(Date.now() + hours * hour).toISOString()

export const reservations = [
  {
    id: 'RS-2048',
    guest: 'María López',
    experience: 'Atardecer y surf en El Tunco',
    experienceId: 1,
    date: 'Hoy, 3:00 p. m.',
    startsAt: inHours(30),
    total: 70,
    guests: 2,
    status: 'Confirmada',
  },
  {
    id: 'RS-2047',
    guest: 'Daniel Rivera',
    experience: 'Ruta de café en Apaneca',
    experienceId: 2,
    date: 'Mañana, 9:00 a. m.',
    startsAt: inHours(60),
    total: 112,
    guests: 4,
    status: 'Pendiente',
  },
  {
    id: 'RS-2046',
    guest: 'Sofía Martínez',
    experience: 'Atardecer y surf en El Tunco',
    experienceId: 1,
    date: '2 nov, 3:00 p. m.',
    startsAt: inHours(5),
    total: 35,
    guests: 1,
    status: 'Confirmada',
  },
  {
    id: 'RS-2045',
    guest: 'Carlos Hernández',
    experience: 'Ruta de café en Apaneca',
    experienceId: 2,
    date: '3 nov, 10:00 a. m.',
    total: 84,
    guests: 3,
    status: 'Completada',
  },
]

export const reviews = [
  {
    id: 'review-1',
    name: 'María López',
    experience: 'Atardecer y surf en El Tunco',
    date: '20 oct 2026',
    rating: 5,
    text: 'Una experiencia increíble. El instructor nos guio muy bien y aprendimos a surfear en un ambiente relajado. Volveríamos sin duda.',
    reply: '',
  },
  {
    id: 'review-2',
    name: 'Daniel Rivera',
    experience: 'Ruta de café en Apaneca',
    date: '18 oct 2026',
    rating: 5,
    text: 'Todo estuvo muy bien organizado. Aprendimos muchísimo sobre el café y el recorrido fue precioso.',
    reply: '',
  },
  {
    id: 'review-3',
    name: 'Sofía Martínez',
    experience: 'Atardecer y surf en El Tunco',
    date: '15 oct 2026',
    rating: 4,
    text: 'El equipo fue amable y la clase estuvo muy divertida. Una gran forma de conocer la costa.',
    reply: '',
  },
]

export const availability = [
  {
    id: 'availability-1',
    date: '2026-11-14',
    time: '15:00',
    experienceId: 1,
    available: 6,
    capacity: 8,
  },
  {
    id: 'availability-2',
    date: '2026-11-15',
    time: '09:00',
    experienceId: 2,
    available: 8,
    capacity: 8,
  },
  {
    id: 'availability-3',
    date: '2026-11-21',
    time: '15:00',
    experienceId: 1,
    available: 4,
    capacity: 8,
  },
]

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Política de cancelación (hora de El Salvador): 48 h o más 100 %, de 24 h a menos
// de 48 h 50 %, menos de 24 h sin reembolso.
export function refundPercentage(startsAt, now = Date.now()) {
  const hoursLeft = (new Date(startsAt).getTime() - now) / hour
  if (!Number.isFinite(hoursLeft)) return 0
  if (hoursLeft >= 48) return 100
  if (hoursLeft >= 24) return 50
  return 0
}

export function formatDateTime(isoDate) {
  return new Intl.DateTimeFormat('es-SV', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/El_Salvador',
  }).format(new Date(isoDate))
}
