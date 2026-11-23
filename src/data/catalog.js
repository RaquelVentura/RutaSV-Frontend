import anfitrionSurf from '../assets/home/anfitrion-surf.jpg'
import catCafe from '../assets/home/cat-cafe.jpg'
import catPueblos from '../assets/home/cat-pueblos.jpg'
import catSurf from '../assets/home/cat-surf.jpg'
import catVolcanes from '../assets/home/cat-volcanes.jpg'
import destFlores from '../assets/home/dest-flores.jpg'
import destLibertad from '../assets/home/dest-libertad.jpg'
import destSantaAna from '../assets/home/dest-santa-ana.jpg'
import editorialCafe from '../assets/home/editorial-cafe.jpg'
import expApaneca from '../assets/home/exp-apaneca.jpg'
import expAtaco from '../assets/home/exp-ataco.jpg'
import expTunco from '../assets/home/exp-tunco.jpg'

// Catálogo de ejemplo para la pantalla Explorar. Se reemplaza por
// GET /experiencias con búsqueda, filtros y paginación (HU-12).

export const departments = ['La Libertad', 'Ahuachapán', 'Santa Ana', 'San Salvador', 'Sonsonate']

export const categories = ['Surf y playa', 'Café y naturaleza', 'Pueblos con encanto', 'Volcanes y aventura']

export const catalog = [
  { slug: 'surf-atardecer-el-tunco', title: 'Surf al atardecer en El Tunco', location: 'El Tunco, La Libertad', department: 'La Libertad', category: 'Surf y playa', price: 45, rating: 4.9, duration: '2 horas', capacity: 8, image: expTunco },
  { slug: 'cafetal-a-tu-taza-apaneca', title: 'Del cafetal a tu taza en Apaneca', location: 'Apaneca, Ahuachapán', department: 'Ahuachapán', category: 'Café y naturaleza', price: 32, rating: 4.9, duration: '2 horas', capacity: 8, image: expApaneca },
  { slug: 'colores-y-sabores-ataco', title: 'Colores y sabores de Ataco', location: 'Ataco, Ahuachapán', department: 'Ahuachapán', category: 'Pueblos con encanto', price: 28, rating: 4.8, duration: '2 horas', capacity: 10, image: expAtaco },
  { slug: 'amanecer-volcan-ilamatepec', title: 'Amanecer en el volcán Ilamatepec', location: 'Santa Ana, Santa Ana', department: 'Santa Ana', category: 'Volcanes y aventura', price: 40, rating: 4.9, duration: '5 horas', capacity: 4, image: catVolcanes },
  { slug: 'clase-de-surf-principiantes-el-tunco', title: 'Clase de surf para principiantes', location: 'El Tunco, La Libertad', department: 'La Libertad', category: 'Surf y playa', price: 38, rating: 4.8, duration: '3 horas', capacity: 8, image: catSurf },
  { slug: 'sesion-de-fotos-en-las-olas-el-tunco', title: 'Sesión de fotos en las olas', location: 'El Tunco, La Libertad', department: 'La Libertad', category: 'Surf y playa', price: 30, rating: 4.9, duration: '1 hora', capacity: 4, image: destLibertad },
  { slug: 'yoga-al-amanecer-playa-el-sunzal', title: 'Yoga al amanecer en El Sunzal', location: 'El Sunzal, La Libertad', department: 'La Libertad', category: 'Surf y playa', price: 25, rating: 4.7, duration: '1 hora y media', capacity: 12, image: anfitrionSurf },
  { slug: 'cata-de-cafe-en-finca-juayua', title: 'Cata de café en una finca de Juayúa', location: 'Juayúa, Sonsonate', department: 'Sonsonate', category: 'Café y naturaleza', price: 28, rating: 4.8, duration: '2 horas', capacity: 10, image: editorialCafe },
  { slug: 'feria-gastronomica-juayua', title: 'Sabores de la feria gastronómica de Juayúa', location: 'Juayúa, Sonsonate', department: 'Sonsonate', category: 'Pueblos con encanto', price: 22, rating: 4.7, duration: '3 horas', capacity: 12, image: catPueblos },
  { slug: 'cascadas-de-los-naranjos', title: 'Cascadas de Los Naranjos', location: 'Los Naranjos, Sonsonate', department: 'Sonsonate', category: 'Volcanes y aventura', price: 30, rating: 4.6, duration: '4 horas', capacity: 8, image: destFlores },
  { slug: 'kayak-lago-de-coatepeque', title: 'Kayak en el lago de Coatepeque', location: 'Coatepeque, Santa Ana', department: 'Santa Ana', category: 'Volcanes y aventura', price: 36, rating: 4.8, duration: '2 horas', capacity: 8, image: destSantaAna },
  { slug: 'centro-historico-san-salvador-a-pie', title: 'Centro histórico de San Salvador a pie', location: 'San Salvador, San Salvador', department: 'San Salvador', category: 'Pueblos con encanto', price: 18, rating: 4.7, duration: '2 horas y media', capacity: 15, image: expAtaco },
  { slug: 'ruta-del-cacao-izalco', title: 'Ruta del cacao en Izalco', location: 'Izalco, Sonsonate', department: 'Sonsonate', category: 'Café y naturaleza', price: 26, rating: 4.7, duration: '3 horas', capacity: 8, image: catCafe },
]
