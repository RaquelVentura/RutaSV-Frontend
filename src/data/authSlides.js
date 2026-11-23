import anfitrionSurf from '../assets/home/anfitrion-surf.jpg'
import expApaneca from '../assets/home/exp-apaneca.jpg'
import expAtaco from '../assets/home/exp-ataco.jpg'
import expTunco from '../assets/home/exp-tunco.jpg'

// Diapositivas del carrusel de acceso (Login y Registro).
// La primera es siempre el logotipo; las demás son publicidad de ejemplo.
export const authSlides = [
  {
    id: 'logo',
    type: 'logo',
    alt: 'RutaSV: una gota de ubicación con el volcán y el mar, un maletín y una hoja verde',
  },
  {
    id: 'surf',
    type: 'ad',
    image: expTunco,
    alt: 'Surfistas en la playa de El Tunco al atardecer',
    title: 'Surf al atardecer en El Tunco',
    text: 'Clases con guías locales y equipo incluido.',
  },
  {
    id: 'ataco',
    type: 'ad',
    image: expAtaco,
    alt: 'Calle empedrada y colorida de Ataco',
    title: 'Colores y sabores de Ataco',
    text: 'Un recorrido a pie por murales, café y comida local.',
  },
  {
    id: 'apaneca',
    type: 'ad',
    image: expApaneca,
    alt: 'Cafetales de Apaneca entre montañas',
    title: 'Del cafetal a tu taza en Apaneca',
    text: 'Conoce cómo se cultiva y se prepara el café salvadoreño.',
  },
  {
    id: 'anfitrion',
    type: 'ad',
    image: anfitrionSurf,
    alt: 'Guía local de surf con su tabla en la playa',
    title: '¿Eres guía o tienes un negocio local?',
    text: 'Publica tu experiencia y llega a nuevos viajeros.',
  },
]
