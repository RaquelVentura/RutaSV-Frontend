import { catalog } from './catalog.js'
import catSurf from '../assets/home/cat-surf.jpg'
import destLibertad from '../assets/home/dest-libertad.jpg'
import anfitrionSurf from '../assets/home/anfitrion-surf.jpg'
import expApaneca from '../assets/home/exp-apaneca.jpg'
import expAtaco from '../assets/home/exp-ataco.jpg'
import expTunco from '../assets/home/exp-tunco.jpg'
import catCafe from '../assets/home/cat-cafe.jpg'
import catPueblos from '../assets/home/cat-pueblos.jpg'
import editorialCafe from '../assets/home/editorial-cafe.jpg'
import destFlores from '../assets/home/dest-flores.jpg'

// Contenido de ejemplo del detalle. Se reemplaza por GET /experiencias/{id}
// cuando el backend lo exponga (HU-11).

export const experienceDetails = [
  {
    slug: 'surf-atardecer-el-tunco',
    title: 'Surf al atardecer en El Tunco',
    category: 'Surf y playa',
    badge: 'Favorita de viajeros',
    region: 'La Libertad',
    city: 'El Tunco',
    location: 'El Tunco, La Libertad',
    rating: 4.9,
    reviewCount: 86,
    guide: 'Guía local',
    price: 45,
    duration: '2 horas',
    capacity: 8,
    level: 'Nivel principiante',
    operator: {
      slug: 'olas-de-el-tunco',
      name: 'Olas de El Tunco',
      since: 2018,
      languages: 'Español e inglés',
    },
    photos: [expTunco, catSurf, anfitrionSurf, destLibertad, expTunco],
    totalPhotos: 8,
    headline: 'Una ola, un atardecer, una nueva historia',
    description: [
      'Aprende a leer el mar y a ponerte de pie sobre la tabla con un guía de El Tunco. Empezamos en la arena, practicamos en olas suaves y cerramos la tarde con uno de los atardeceres más lindos del Pacífico.',
      'No necesitas experiencia previa. Te acompañamos a tu ritmo, en un grupo pequeño, con equipo listo y una charla de seguridad antes de entrar al agua.',
    ],
    includes: ['Tabla de surf y leash', 'Charla de seguridad', 'Instructor local bilingüe', 'Agua para hidratarte'],
    notIncluded: 'No incluye transporte ni alimentos. Trae traje de baño, toalla y protector solar.',
    meetingPoint: 'Escuela Olas de El Tunco, acceso principal a la playa. Llega 15 minutos antes.',
    mapLabel: 'Olas de El Tunco · Encuentro',
    beforeBooking:
      'Edad mínima: 12 años. Debes saber nadar. Cancelación gratuita hasta 48 horas antes. Si el mar no permite una sesión segura, coordinamos una nueva fecha.',
    schedules: ['15:00–17:00', '16:00–18:00'],
    review: { author: 'Mariana R.', date: 'Septiembre 2026', text: 'Mi primera vez surfeando y me sentí acompañada en todo momento. El atardecer fue el mejor cierre.' },
  },
  {
    slug: 'cafetal-a-tu-taza-apaneca',
    title: 'Del cafetal a tu taza en Apaneca',
    category: 'Café y naturaleza',
    badge: 'Ruta de las Flores',
    region: 'Ahuachapán',
    city: 'Apaneca',
    location: 'Apaneca, Ahuachapán',
    rating: 4.9,
    reviewCount: 64,
    guide: 'Guía local',
    price: 32,
    duration: '2 horas',
    capacity: 8,
    level: 'Apta para todos',
    operator: {
      slug: 'raices-de-cafe',
      name: 'Raíces de Café',
      since: 2015,
      languages: 'Español e inglés',
    },
    photos: [expApaneca, catCafe, editorialCafe, destFlores, expApaneca],
    totalPhotos: 6,
    headline: 'Camina entre cafetales y aprende a catar',
    description: [
      'Recorre una finca familiar entre las montañas de Apaneca y sigue el camino del café: desde la planta hasta la taza.',
      'Cerramos con una cata guiada para que aprendas a reconocer aromas y sabores del café salvadoreño.',
    ],
    includes: ['Recorrido por la finca', 'Cata guiada de café', 'Guía local', 'Una bolsa de café para llevar'],
    notIncluded: 'No incluye transporte ni almuerzo. Usa calzado cómodo.',
    meetingPoint: 'Entrada de la finca Raíces de Café, a 1 km del parque central de Apaneca.',
    mapLabel: 'Raíces de Café · Encuentro',
    beforeBooking: 'Apta para todas las edades. Cancelación gratuita hasta 48 horas antes. La lluvia no suspende la visita.',
    schedules: ['09:00–11:00', '14:00–16:00'],
    review: { author: 'Carlos M.', date: 'Octubre 2026', text: 'Entender todo lo que hay detrás de una taza cambió mi forma de tomar café.' },
  },
  {
    slug: 'colores-y-sabores-ataco',
    title: 'Colores y sabores de Ataco',
    category: 'Pueblos con encanto',
    badge: 'Ruta de las Flores',
    region: 'Ahuachapán',
    city: 'Ataco',
    location: 'Ataco, Ahuachapán',
    rating: 4.8,
    reviewCount: 52,
    guide: 'Guía local',
    price: 28,
    duration: '2 horas',
    capacity: 10,
    level: 'Caminata suave',
    operator: {
      slug: 'ataco-a-pie',
      name: 'Ataco a pie',
      since: 2019,
      languages: 'Español',
    },
    photos: [expAtaco, catPueblos, destFlores, editorialCafe, expAtaco],
    totalPhotos: 7,
    headline: 'Murales, café y comida local a pie',
    description: [
      'Un paseo guiado por las calles empedradas de Ataco para conocer sus murales, su mercado y a las personas que mantienen vivas sus tradiciones.',
      'Probamos platillos locales en el camino y terminamos con un café en una casa del pueblo.',
    ],
    includes: ['Recorrido a pie', 'Degustación de comida local', 'Guía local', 'Café de cierre'],
    notIncluded: 'No incluye transporte. Lleva efectivo para compras opcionales.',
    meetingPoint: 'Parque central de Ataco, frente a la iglesia.',
    mapLabel: 'Ataco a pie · Encuentro',
    beforeBooking: 'Apta para todas las edades. Cancelación gratuita hasta 48 horas antes.',
    schedules: ['09:00–11:00', '16:00–18:00'],
    review: { author: 'Lucía P.', date: 'Septiembre 2026', text: 'Nos enseñaron rincones que no salen en las guías. Volvería solo por las historias de la gente.' },
  },
]

// Otras experiencias de Olas de El Tunco, para el perfil de la empresa.
const surfBase = experienceDetails[0]

experienceDetails.push(
  {
    ...surfBase,
    slug: 'clase-de-surf-principiantes-el-tunco',
    title: 'Clase de surf para principiantes',
    badge: 'Clases en grupo',
    rating: 4.8,
    reviewCount: 41,
    price: 38,
    duration: '3 horas',
    photos: [catSurf, expTunco, destLibertad, anfitrionSurf, catSurf],
    totalPhotos: 6,
    headline: 'Tu primera clase, paso a paso',
    description: [
      'Una clase completa para quien nunca ha surfeado: técnica en la arena, seguridad en el agua y práctica en olas pequeñas con instructores locales.',
      'Grupos de hasta 8 personas para que cada quien reciba atención.',
    ],
    schedules: ['08:00–11:00', '14:00–17:00'],
    review: { author: 'Diego S.', date: 'Octubre 2026', text: 'En una mañana pasé de no saber nada a pararme en la tabla. Los instructores son muy pacientes.' },
  },
  {
    ...surfBase,
    slug: 'sesion-de-fotos-en-las-olas-el-tunco',
    title: 'Sesión de fotos en las olas',
    badge: 'Con fotógrafo local',
    rating: 4.9,
    reviewCount: 23,
    price: 30,
    duration: '1 hora',
    capacity: 4,
    photos: [destLibertad, expTunco, catSurf, anfitrionSurf, destLibertad],
    totalPhotos: 5,
    headline: 'Llévate tu mejor día de surf en fotos',
    description: [
      'Un fotógrafo local te acompaña durante tu sesión y captura tus mejores olas y el atardecer.',
      'Recibes las fotos editadas en un enlace privado en las siguientes 48 horas.',
    ],
    includes: ['Fotógrafo local', 'Fotos editadas', 'Enlace privado de descarga', 'Agua para hidratarte'],
    schedules: ['16:00–17:00', '17:00–18:00'],
    review: { author: 'Valeria T.', date: 'Noviembre 2026', text: 'Las fotos quedaron increíbles y el fotógrafo me dio muy buenos consejos.' },
  },
)

// Las experiencias del catálogo que aún no tienen una ficha propia se muestran con
// un detalle genérico, para que todas las tarjetas del explorador abran una página.
function buildGenericDetail(entry) {
  const city = entry.location.split(',')[0]
  return {
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    badge: 'Experiencia local',
    region: entry.department,
    city,
    location: entry.location,
    rating: entry.rating,
    reviewCount: 18,
    guide: 'Guía local',
    price: entry.price,
    duration: entry.duration,
    capacity: entry.capacity,
    level: 'Apta para todos',
    operator: { slug: null, name: 'Anfitrión local verificado', since: 2020, languages: 'Español' },
    photos: [entry.image, catSurf, expApaneca, expAtaco, destLibertad],
    totalPhotos: 5,
    headline: entry.title,
    description: [
      `Una experiencia guiada por anfitriones de ${city} para conocer el lugar como lo viven quienes lo habitan.`,
      'Grupos pequeños, ritmo tranquilo y todo lo necesario para disfrutar. Te enviamos los detalles al reservar.',
    ],
    includes: ['Guía local', 'Grupo pequeño', 'Agua para hidratarte', 'Atención durante toda la experiencia'],
    notIncluded: 'No incluye transporte ni alimentos, salvo que se indique lo contrario.',
    meetingPoint: `Punto de encuentro en ${city}. Te lo confirmamos al reservar.`,
    mapLabel: `${city} · Encuentro`,
    beforeBooking: 'Cancelación gratuita hasta 48 horas antes. Si las condiciones no son seguras, coordinamos una nueva fecha.',
    schedules: ['09:00–11:00', '14:00–16:00'],
    review: { author: 'Viajero RutaSV', date: 'Octubre 2026', text: 'Una experiencia muy cercana, con gente local que conoce cada rincón.' },
  }
}

export function getExperienceBySlug(slug) {
  const detailed = experienceDetails.find((experience) => experience.slug === slug)
  if (detailed) return detailed
  const entry = catalog.find((item) => item.slug === slug)
  return entry ? buildGenericDetail(entry) : null
}
