import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AuthCarousel from '../components/auth/AuthCarousel.jsx'
import NavBar from '../components/NavBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { authSlides } from '../data/authSlides.js'

const introKey = 'rutasv-auth-intro-visto'
const introMs = 5600

// La animación de entrada se muestra una vez por sesión del navegador.
function shouldPlayIntro() {
  try {
    return !sessionStorage.getItem(introKey)
  } catch {
    return true
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(introKey, '1')
  } catch {
    // Sin almacenamiento disponible: la animación podría repetirse; no es grave.
  }
}

const transition = 'transition-all duration-700 ease-in-out'

// Pantallas de acceso: primero el logotipo (primera imagen del carrusel) ocupa
// toda la pantalla; luego el carrusel se desliza a la izquierda y aparece el
// formulario a su lado. Login y Registro comparten este contenedor.
function AuthLayout() {
  const { user, logout, refreshSession } = useAuth()
  const [intro, setIntro] = useState(shouldPlayIntro)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!intro) return undefined
    const timer = setTimeout(() => {
      markIntroSeen()
      setIntro(false)
    }, introMs)
    return () => clearTimeout(timer)
  }, [intro])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas text-ink">
      <div
        inert={intro}
        className={`z-20 overflow-hidden ${transition} ${
          intro ? 'max-h-0 -translate-y-4 opacity-0' : 'max-h-56 translate-y-0 opacity-100'
        }`}
      >
        <NavBar user={user} onLogout={logout} onMenuOpen={refreshSession} />
      </div>

      <main
        className={`flex flex-1 ${transition} ${
          intro ? 'gap-0 p-0' : 'gap-0 px-4 py-6 lg:gap-8 lg:px-12'
        }`}
      >
        <div
          className={`relative min-w-0 basis-0 ${transition} ${
            intro ? 'grow' : 'grow-0 lg:grow'
          }`}
        >
          <AuthCarousel
            slides={authSlides}
            index={slide}
            onIndexChange={setSlide}
            autoplay={!intro}
            rounded={!intro}
          />
        </div>

        <div
          inert={intro}
          className={`min-w-0 basis-0 ${transition} ${
            intro
              ? 'grow-0 translate-x-12 overflow-hidden opacity-0'
              : 'grow translate-x-0 opacity-100'
          }`}
        >
          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-mist bg-surface p-6 shadow-sm sm:p-10 lg:min-w-[28rem] lg:p-14">
            <Outlet />
          </div>
        </div>
      </main>

      <footer
        className={`overflow-hidden text-center text-xs text-muted ${transition} ${
          intro ? 'max-h-0 py-0 opacity-0' : 'max-h-20 py-4 opacity-100'
        }`}
      >
        <span>© 2026 RutaSV</span>
        <span className="mx-1">·</span>
        <a href="#" className="hover:underline">
          Privacidad
        </a>
        <span className="mx-1">·</span>
        <a href="#" className="hover:underline">
          Términos y condiciones
        </a>
      </footer>
    </div>
  )
}

export default AuthLayout
