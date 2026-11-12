// Panel del operador: contiene la barra de navegación y el contenido de cada sección.

import { Link, NavLink, Outlet } from 'react-router-dom'
import UserMenu from '../../components/UserMenu.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getOperatorDisplayName } from './operatorRepository.js'

const navigation = [
  { to: '/operador', label: 'Resumen', end: true },
  { to: '/operador/experiencias', label: 'Mis experiencias' },
  { to: '/operador/cupos', label: 'Cupos' },
  { to: '/operador/reservas', label: 'Historial de Reservas' },
  { to: '/operador/resenas', label: 'Reseñas' },
  { to: '/operador/configuracion', label: 'Configuración' },
]

function NavigationLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `rounded-lg px-2.5 py-3 text-center text-sm transition hover:bg-info-soft ${
          isActive
            ? 'bg-info-soft font-bold text-brand'
            : 'font-medium text-muted hover:text-brand'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}

function OperatorLayout() {
  const { user, logout } = useAuth()
  const operatorName = getOperatorDisplayName(user)

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <div className="min-h-screen w-full bg-canvas">
        <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-black/10 bg-white px-5 md:px-8 lg:px-12 2xl:px-16">
          <Link to="/" className="text-[28px] font-extrabold tracking-tight text-brand">
            RutaSV
          </Link>
          <UserMenu
            label={`OT · ${operatorName}`}
            items={[
              { to: '/operador/configuracion', label: 'Configuración del negocio' },
              { to: '/perfil', label: 'Mi perfil' },
              { to: '/', label: 'Ver sitio' },
            ]}
            onLogout={logout}
            className="max-w-[65%] md:max-w-sm"
          />
        </header>

        <main className="px-5 pb-12 pt-8 md:px-8 md:pt-10 lg:px-12 lg:pt-12 2xl:px-16">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">
            Panel del operador · {operatorName}
          </p>
          <nav
            aria-label="Navegación del operador"
            className="mt-5 grid grid-cols-2 gap-2 border-b border-black/10 pb-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"
          >
            {navigation.map((item) => (
              <NavigationLink key={item.to} item={item} />
            ))}
          </nav>

          <section className="pt-7 md:pt-9">
            <Outlet />
          </section>
        </main>
      </div>
      <footer className="bg-ink text-white">
        <div className="flex w-full flex-wrap items-center justify-between gap-5 px-5 py-7 text-xs md:px-8 lg:px-12 2xl:px-16">
          <div>
            <p className="text-lg font-extrabold tracking-tight">RutaSV</p>
            <p className="mt-2 text-white/65">© 2026 RutaSV · Hecho en El Salvador</p>
          </div>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-5 gap-y-2 text-white/75">
            <a href="mailto:ayuda@rutasv.com" className="transition hover:text-white">Ayuda</a>
            <span>Privacidad</span>
            <span>Términos</span>
            <span>ES / EN · USD</span>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default OperatorLayout
