import hojas from '../../assets/brand/logo/hojas.png'
import agua from '../../assets/brand/logo/agua.png'
import letras from '../../assets/brand/logo/letras.png'
import maleta from '../../assets/brand/logo/maleta.png'
import pin from '../../assets/brand/logo/pin.png'
import sol from '../../assets/brand/logo/sol.png'

// Logotipo de RutaSV por capas (x, y, ancho, alto sobre un lienzo de 498 x 476).
// Secuencia: el sol recorre el camino azul, rodea el volcán y se acomoda en su
// lugar; después aparecen el agua, las hojas, la maleta y, por último, las letras.
const layers = {
  pin: { src: pin, x: 137, y: 13, width: 249, height: 322 },
  agua: { src: agua, x: 185, y: 132, width: 125, height: 60 },
  hojas: { src: hojas, x: 46, y: 170, width: 158, height: 151 },
  maleta: { src: maleta, x: 304, y: 198, width: 128, height: 125 },
  letras: { src: letras, x: 19, y: 345, width: 460, height: 101 },
}

// Centro del sol en su lugar final y recorrido: del extremo del camino, por la
// curva, hasta el círculo, alrededor del volcán y a su sitio.
const sunRest = { x: 287.5, y: 96.5 }
const sunPath =
  'M 382 329 C 340 330, 300 322, 272 312 C 236 299, 214 288, 218 272 C 222 255, 262 236, 306 208 ' +
  'C 322 198, 316 176, 296 160 C 276 150, 232 156, 206 142 C 190 128, 196 104, 224 94 C 246 86, 272 82, 287.5 96.5'

const sunStart = '0.7s'
const sunDuration = '2.4s'

function Layer({ name, className }) {
  const layer = layers[name]
  return (
    <image
      href={layer.src}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      className={`logo-part ${className}`}
    />
  )
}

function AnimatedLogo({ label }) {
  return (
    <svg
      viewBox="0 0 498 476"
      role="img"
      aria-label={label}
      className="h-auto w-full"
    >
      <Layer name="pin" className="logo-pin" />

      <g opacity="0">
        <set attributeName="opacity" to="1" begin={sunStart} fill="freeze" />
        <animateMotion
          path={sunPath}
          begin={sunStart}
          dur={sunDuration}
          fill="freeze"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.45 0 0.2 1"
        />
        <image
          href={sol}
          x={264 - sunRest.x}
          y={73 - sunRest.y}
          width="47"
          height="47"
        />
      </g>

      <Layer name="agua" className="logo-water" />
      <Layer name="hojas" className="logo-leaves" />
      <Layer name="maleta" className="logo-case" />
      <Layer name="letras" className="logo-letters" />
    </svg>
  )
}

export default AnimatedLogo
