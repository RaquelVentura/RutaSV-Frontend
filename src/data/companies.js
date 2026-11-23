import anfitrionSurf from '../assets/home/anfitrion-surf.jpg'
import catCafe from '../assets/home/cat-cafe.jpg'
import catPueblos from '../assets/home/cat-pueblos.jpg'
import catSurf from '../assets/home/cat-surf.jpg'
import destFlores from '../assets/home/dest-flores.jpg'
import catVolcanes from '../assets/home/cat-volcanes.jpg'
import destLibertad from '../assets/home/dest-libertad.jpg'
import destSantaAna from '../assets/home/dest-santa-ana.jpg'
import editorialCafe from '../assets/home/editorial-cafe.jpg'
import expApaneca from '../assets/home/exp-apaneca.jpg'
import expAtaco from '../assets/home/exp-ataco.jpg'
import expTunco from '../assets/home/exp-tunco.jpg'

// Perfiles de empresa de ejemplo. Se reemplazan por la consulta pública de la
// empresa y sus experiencias cuando exista la API (HU-08).

export const companies = [
  {
    slug: 'olas-de-el-tunco',
    name: 'Olas de El Tunco',
    location: 'El Tunco, La Libertad',
    since: 2018,
    languages: 'Español e inglés',
    rating: 4.9,
    reviewCount: 86,
    cover: expTunco,
    about:
      'Somos una escuela de surf local en El Tunco. Desde 2018 acompañamos a viajeros de todos los niveles con guías certificados, equipo completo y grupos pequeños para que aprendan a su ritmo y disfruten del mejor atardecer del Pacífico.',
    offers: ['Surf y playa', 'Guía local', 'Equipo incluido', 'Clases para principiantes', 'Fotos del grupo'],
    facts: [
      ['Fundada', '2018'],
      ['Idiomas', 'Español e inglés'],
      ['Grupo máximo', '8 personas'],
      ['Respuesta', 'En menos de 24 h'],
    ],
    gallery: [catSurf, expTunco, anfitrionSurf, destLibertad],
    address: 'Escuela Olas de El Tunco, acceso principal a la playa. El Tunco, La Libertad.',
    mapLabel: 'Olas de El Tunco',
    hours: 'Lunes a domingo · 7:00 – 18:00',
    contactEmail: 'hola@olasdeeltunco.example',
    reviews: [
      { author: 'Mariana R.', rating: 5, text: 'Mi primera vez surfeando y me sentí acompañada en todo momento. El atardecer fue el mejor cierre.', date: 'Septiembre 2026' },
      { author: 'Carlos M.', rating: 5, text: 'Guías muy pacientes y el equipo estaba en perfecto estado. Repetiría sin dudarlo.', date: 'Octubre 2026' },
    ],
  },
  {
    slug: 'raices-de-cafe',
    name: 'Raíces de Café',
    location: 'Apaneca, Ahuachapán',
    since: 2015,
    languages: 'Español e inglés',
    rating: 4.9,
    reviewCount: 64,
    cover: expApaneca,
    about:
      'Una finca familiar en las montañas de Apaneca que abre sus puertas para mostrar el camino del café, desde la planta hasta la taza.',
    offers: ['Café y naturaleza', 'Guía local', 'Cata guiada'],
    facts: [
      ['Fundada', '2015'],
      ['Idiomas', 'Español e inglés'],
      ['Grupo máximo', '8 personas'],
      ['Respuesta', 'En menos de 24 h'],
    ],
    gallery: [catCafe, expApaneca, editorialCafe, destFlores],
    address: 'Entrada de la finca Raíces de Café, a 1 km del parque central de Apaneca.',
    mapLabel: 'Raíces de Café',
    hours: 'Martes a domingo · 8:00 – 17:00',
    contactEmail: 'hola@raicesdecafe.example',
    reviews: [
      { author: 'Carlos M.', rating: 5, text: 'Entender todo lo que hay detrás de una taza cambió mi forma de tomar café.', date: 'Octubre 2026' },
    ],
  },
  {
    slug: 'ataco-a-pie',
    name: 'Ataco a pie',
    location: 'Ataco, Ahuachapán',
    since: 2019,
    languages: 'Español',
    rating: 4.8,
    reviewCount: 52,
    cover: expAtaco,
    about:
      'Guías de Ataco que te llevan por las calles empedradas, los murales y la comida del pueblo para conocerlo a pie y con sus historias.',
    offers: ['Pueblos con encanto', 'Guía local', 'Comida local'],
    facts: [
      ['Fundada', '2019'],
      ['Idiomas', 'Español'],
      ['Grupo máximo', '10 personas'],
      ['Respuesta', 'En menos de 24 h'],
    ],
    gallery: [catPueblos, expAtaco, destFlores, editorialCafe],
    address: 'Parque central de Ataco, frente a la iglesia.',
    mapLabel: 'Ataco a pie',
    hours: 'Lunes a domingo · 8:00 – 18:00',
    contactEmail: 'hola@atacoapie.example',
    reviews: [
      { author: 'Lucía P.', rating: 5, text: 'Nos enseñaron rincones que no salen en las guías. Volvería solo por las historias de la gente.', date: 'Septiembre 2026' },
    ],
  },
  {
    slug: 'ruta-del-lago',
    name: 'Ruta del Lago',
    location: 'Coatepeque, Santa Ana',
    since: 2020,
    languages: 'Español',
    rating: 4.6,
    reviewCount: 18,
    cover: destSantaAna,
    about:
      'Paseos en kayak y caminatas alrededor del lago de Coatepeque con guías de la zona.',
    offers: ['Volcanes y aventura', 'Guía local'],
    facts: [
      ['Fundada', '2020'],
      ['Idiomas', 'Español'],
      ['Grupo máximo', '8 personas'],
      ['Respuesta', 'En menos de 48 h'],
    ],
    gallery: [destSantaAna, catVolcanes, destFlores, catPueblos],
    address: 'Muelle principal del lago de Coatepeque.',
    mapLabel: 'Ruta del Lago',
    hours: 'Miércoles a domingo · 8:00 – 16:00',
    contactEmail: 'equipo@rutadellago.example',
    reviews: [
      { author: 'Sofía M.', rating: 5, text: 'El paseo en kayak al amanecer fue lo mejor del viaje.', date: 'Agosto 2026' },
    ],
  },
]

export function getCompanyBySlug(slug) {
  return companies.find((company) => company.slug === slug) ?? null
}
