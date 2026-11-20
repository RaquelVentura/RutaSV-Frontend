// Datos de ejemplo para las vistas de Turista. Cuando exista el backend,
// reemplaza estas constantes por llamadas a apiFetch (src/lib/api.js).
// Las imágenes se exportan desde Figma a /public (ver README-turista.md).

const photo = (name) => `/images/turista/${name}`;
const icon = (name) => `/icons/turista/${name}`;

export const assets = {
  hero: photo('hero.png'),
  surf: photo('surf.png'),
  cafe: photo('cafe.png'),
  ataco: photo('ataco.png'),
  volcan: photo('volcan.png'),
  plan: photo('plan-fin-de-semana.png'),
  pin: icon('pin.svg'),
  local: icon('local.svg'),
  groups: icon('groups.svg'),
  purpose: icon('purpose.svg'),
  check: icon('check.svg'),
  mail: icon('mail.svg'),
  mapPin: icon('map-pin.svg'),
  backpack: icon('backpack.svg'),
};

export const experiences = [
  {
    id: 'surf-el-tunco',
    title: 'Surf al atardecer en El Tunco',
    location: 'El Tunco, La Libertad',
    rating: 4.9,
    reviews: 86,
    meta: 'Guía local · Grupo pequeño · 2 horas',
    price: 45,
    spots: 6,
    operator: 'Olas de El Tunco',
    image: assets.surf,
  },
  {
    id: 'cafe-apaneca',
    title: 'Del cafetal a tu taza en Apaneca',
    location: 'Apaneca, Ahuachapán',
    rating: 4.9,
    meta: 'Guía local · Grupo pequeño · 2 horas',
    price: 32,
    spots: 8,
    operator: 'Raíces de Café',
    image: assets.cafe,
  },
  {
    id: 'ataco',
    title: 'Colores y sabores de Ataco',
    location: 'Ataco, Ahuachapán',
    rating: 4.8,
    meta: 'Guía local · Grupo pequeño · 2 horas',
    price: 28,
    spots: 10,
    operator: 'Ataco a pie',
    image: assets.ataco,
  },
  {
    id: 'volcan-ilamatepec',
    title: 'Amanecer en el volcán Ilamatepec',
    location: 'Santa Ana, Santa Ana',
    rating: 4.9,
    meta: 'Guía local · Grupo pequeño · 2 horas',
    price: 40,
    spots: 4,
    image: assets.volcan,
  },
];

export const benefits = [
  { icon: assets.local, title: '100% local', text: 'Guías que conocen cada rincón' },
  { icon: assets.groups, title: 'Grupos pequeños', text: 'Más conexión, menos multitudes' },
  { icon: assets.purpose, title: 'Turismo con propósito', text: 'Tu viaje apoya a la comunidad' },
];

export const categories = [
  { name: 'Surf y playa', count: 12, image: assets.surf },
  { name: 'Café y naturaleza', count: 18, image: assets.cafe },
  { name: 'Pueblos con encanto', count: 15, image: assets.ataco },
  { name: 'Volcanes y aventura', count: 9, image: assets.volcan },
];

export const destinations = [
  { name: 'La Libertad', text: 'Olas, atardeceres y vida costera', image: assets.surf },
  { name: 'Ruta de las Flores', text: 'Pueblos, café y caminos verdes', image: assets.ataco },
  { name: 'Santa Ana', text: 'Aventura entre volcanes y lagos', image: assets.volcan },
];

export const testimonials = [
  {
    quote: 'Nunca había tocado una tabla. El guía tuvo toda la paciencia y terminamos viendo un atardecer increíble.',
    author: 'Mariana R.',
    trip: 'Surf en El Tunco',
  },
  {
    quote: 'Entender todo lo que hay detrás de una taza cambió mi forma de tomar café. Una experiencia muy cercana.',
    author: 'Carlos M.',
    trip: 'Café en Apaneca',
  },
  {
    quote: 'Nos enseñaron rincones que no salen en las guías. Volvería solo por las historias de la gente.',
    author: 'Lucía P.',
    trip: 'Paseo por Ataco',
  },
];

export const defaultBooking = {
  experience: experiences[0],
  date: 'Sábado 21 de noviembre de 2026',
  time: '15:00–17:00',
  people: 2,
  reference: 'RSV-261121-0842',
  freeCancelUntil: '19 nov 2026 a las 15:00',
  operatorPhone: '+503 7890 1234',
  contactName: 'Ana López',
  contactEmail: 'ana.lopez@correo.com',
};

export const paymentMethods = [
  { id: 'paypal', title: 'PayPal', description: 'Paga con tu cuenta de PayPal.', brands: ['PayPal'] },
  {
    id: 'card',
    title: 'Tarjeta de crédito o débito',
    description: 'Paga con Visa, Mastercard o American Express.',
    brands: ['VISA', 'Mastercard'],
  },
  { id: 'apple', title: 'Apple Pay', description: 'Paga con Apple Pay en un toque.', brands: ['Apple Pay'] },
  {
    id: 'google',
    title: 'Google Pay',
    description: 'Paga con tu cuenta de Google en un toque.',
    brands: ['Google Pay'],
  },
];

export const initialReservations = [
  {
    id: 'RSV-261121-0842',
    status: 'activa',
    title: 'Surf al atardecer en El Tunco',
    place: 'El Tunco, La Libertad · Olas de El Tunco',
    when: '21 nov 2026 · 15:00–17:00 · 2 personas',
    total: 90,
    image: assets.surf,
  },
  {
    id: 'RSV-260928-0314',
    status: 'completada',
    title: 'Colores y sabores de Ataco',
    place: 'Ataco, Ahuachapán · Ataco a pie',
    when: '28 sep 2026 · 09:00–11:00 · 2 personas',
    total: 56,
    image: assets.ataco,
  },
  {
    id: 'RSV-261004-0271',
    status: 'cancelada',
    title: 'Del cafetal a tu taza en Apaneca',
    place: 'Apaneca, Ahuachapán · Raíces de Café',
    when: '04 oct 2026 · 10:00–12:00 · 2 personas',
    total: 64,
    image: assets.cafe,
  },
];

export const formatUsd = (value) => `$${value.toFixed(2)}`;
