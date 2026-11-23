import { useEffect, useState } from 'react'
import AnimatedLogo from './AnimatedLogo.jsx'

const autoplayMs = 5500

function ArrowButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-ink transition hover:bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}

// Carrusel de las pantallas de acceso. El índice vive en el padre para que
// no se reinicie al cambiar entre Login y Registro.
function AuthCarousel({ slides, index, onIndexChange, autoplay = true, rounded = true }) {
  const [paused, setPaused] = useState(false)
  const total = slides.length

  useEffect(() => {
    if (!autoplay || paused || total < 2) return undefined
    const timer = setInterval(() => onIndexChange((index + 1) % total), autoplayMs)
    return () => clearInterval(timer)
  }, [autoplay, paused, index, total, onIndexChange])

  const go = (next) => onIndexChange((next + total) % total)

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Novedades de RutaSV"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative h-full min-h-[22rem] w-full overflow-hidden bg-[#e4f4fe] transition-[border-radius] duration-700 ${
        rounded ? 'rounded-3xl' : 'rounded-none'
      }`}
    >
      {slides.map((slide, i) => {
        const active = i === index
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {slide.type === 'logo' ? (
              <div className="flex h-full w-full items-center justify-center p-8">
                <div className="w-[70%] max-w-md">
                  <AnimatedLogo label={slide.alt} />
                </div>
              </div>
            ) : (
              <>
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  Publicidad
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 pb-20 text-white">
                  <p className="text-2xl font-extrabold leading-tight">{slide.title}</p>
                  <p className="mt-2 max-w-md text-sm text-white/90">{slide.text}</p>
                </div>
              </>
            )}
          </div>
        )
      })}

      <div className="absolute inset-x-0 bottom-5 flex justify-center">
        <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm">
          <ArrowButton label="Diapositiva anterior" onClick={() => go(index - 1)}>
            ‹
          </ArrowButton>
          <div className="flex items-center gap-1.5 px-1">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  i === index ? 'w-6 bg-brand' : 'w-2 bg-mist hover:bg-muted'
                }`}
              />
            ))}
          </div>
          <ArrowButton label="Diapositiva siguiente" onClick={() => go(index + 1)}>
            ›
          </ArrowButton>
        </div>
      </div>
    </section>
  )
}

export default AuthCarousel
