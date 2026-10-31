import catSurf from '../assets/home/cat-surf.jpg'
import catCafe from '../assets/home/cat-cafe.jpg'
import catPueblos from '../assets/home/cat-pueblos.jpg'
import catVolcanes from '../assets/home/cat-volcanes.jpg'
import expTunco from '../assets/home/exp-tunco.jpg'
import expApaneca from '../assets/home/exp-apaneca.jpg'
import expAtaco from '../assets/home/exp-ataco.jpg'
import destLibertad from '../assets/home/dest-libertad.jpg'
import destFlores from '../assets/home/dest-flores.jpg'
import destSantaAna from '../assets/home/dest-santa-ana.jpg'

// Contenido de ejemplo de la portada. Se reemplaza por datos de la API cuando el catálogo esté conectado.

export const searchCategories = [
  'Surf, café, pueblos',
  'Surf y playa',
  'Café y naturaleza',
  'Pueblos con encanto',
  'Volcanes y aventura',
]

export const valueProps = [
  {
    icon: 'pin',
    title: '100% local',
    description: 'Guías que conocen cada rincón',
  },
  {
    icon: 'users',
    title: 'Grupos pequeños',
    description: 'Más conexión, menos multitudes',
  },
  {
    icon: 'heart',
    title: 'Turismo con propósito',
    description: 'Tu viaje apoya a la comunidad',
  },
]

export const categories = [
  { id: 'surf', title: 'Surf y playa', count: 12, image: catSurf },
  { id: 'cafe', title: 'Café y naturaleza', count: 18, image: catCafe },
  { id: 'pueblos', title: 'Pueblos con encanto', count: 15, image: catPueblos },
  { id: 'volcanes', title: 'Volcanes y aventura', count: 9, image: catVolcanes },
]

export const featuredExperiences = [
  {
    slug: 'surf-atardecer-el-tunco',
    image: expTunco,
    location: 'El Tunco, La Libertad',
    rating: 4.9,
    title: 'Surf al atardecer en El Tunco',
    details: 'Guía local · Grupo pequeño · 2 horas',
    price: 45,
    spots: 6,
  },
  {
    slug: 'cafetal-a-tu-taza-apaneca',
    image: expApaneca,
    location: 'Apaneca, Ahuachapán',
    rating: 4.9,
    title: 'Del cafetal a tu taza en Apaneca',
    details: 'Guía local · Grupo pequeño · 2 horas',
    price: 32,
    spots: 8,
  },
  {
    slug: 'colores-y-sabores-ataco',
    image: expAtaco,
    location: 'Ataco, Ahuachapán',
    rating: 4.8,
    title: 'Colores y sabores de Ataco',
    details: 'Guía local · Grupo pequeño · 2 horas',
    price: 28,
    spots: 10,
  },
]

export const destinations = [
  {
    id: 'la-libertad',
    title: 'La Libertad',
    description: 'Olas, atardeceres y vida costera',
    image: destLibertad,
  },
  {
    id: 'ruta-de-las-flores',
    title: 'Ruta de las Flores',
    description: 'Pueblos, café y caminos verdes',
    image: destFlores,
  },
  {
    id: 'santa-ana',
    title: 'Santa Ana',
    description: 'Aventura entre volcanes y lagos',
    image: destSantaAna,
  },
]

export const steps = [
  {
    number: '01',
    title: 'Encuentra tu plan',
    description:
      'Elige entre surf, café, pueblos y aventura. Hay un rincón para cada ánimo.',
  },
  {
    number: '02',
    title: 'Reserva a tu ritmo',
    description:
      'Revisa fechas, conoce a tu guía y encuentra espacio para tu grupo.',
  },
  {
    number: '03',
    title: 'Llévate una historia',
    description:
      'Llega al punto de encuentro. Tu anfitrión se encarga de hacerte sentir en casa.',
  },
]

export const testimonials = [
  {
    id: 'mariana',
    quote:
      'Nunca había tocado una tabla. El guía tuvo toda la paciencia y terminamos viendo un atardecer increíble.',
    author: 'Mariana R.',
    trip: 'Surf en El Tunco',
  },
  {
    id: 'carlos',
    quote:
      'Entender todo lo que hay detrás de una taza cambió mi forma de tomar café. Una experiencia muy cercana.',
    author: 'Carlos M.',
    trip: 'Café en Apaneca',
  },
  {
    id: 'lucia',
    quote:
      'Nos enseñaron rincones que no salen en las guías. Volvería solo por las historias de la gente.',
    author: 'Lucía P.',
    trip: 'Paseo por Ataco',
  },
]
