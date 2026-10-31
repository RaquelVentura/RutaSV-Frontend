export const experiences = [
  {
    id: 1,
    title: 'Atardecer y surf en El Tunco',
    category: 'Aventura',
    location: 'La Libertad',
    price: 35,
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
    bookings: 0,
    status: 'Borrador',
    color: 'bg-stone-100 text-stone-700',
  },
]

export const reservations = [
  {
    id: 'RS-2048',
    guest: 'María López',
    experience: 'Atardecer y surf en El Tunco',
    date: 'Hoy, 3:00 p. m.',
    guests: 2,
    status: 'Confirmada',
  },
  {
    id: 'RS-2047',
    guest: 'Daniel Rivera',
    experience: 'Ruta de café en Apaneca',
    date: 'Mañana, 9:00 a. m.',
    guests: 4,
    status: 'Pendiente',
  },
  {
    id: 'RS-2046',
    guest: 'Sofía Martínez',
    experience: 'Atardecer y surf en El Tunco',
    date: '2 nov, 3:00 p. m.',
    guests: 1,
    status: 'Confirmada',
  },
  {
    id: 'RS-2045',
    guest: 'Carlos Hernández',
    experience: 'Ruta de café en Apaneca',
    date: '3 nov, 10:00 a. m.',
    guests: 3,
    status: 'Completada',
  },
]

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
