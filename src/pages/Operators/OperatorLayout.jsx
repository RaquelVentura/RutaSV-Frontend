// Panel del operador: contiene la barra de navegación y el contenido de cada sección.

import { Link, NavLink, Outlet } from 'react-router-dom'
import UserMenu from '../../components/UserMenu.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserMenuItems, getUserMenuLabel } from '../../lib/userMenu.js'

const navigation = [
  { to: '/operador', label: 'Resumen', end: true },
  { to: '/operador/experiencias', label: 'Mis experiencias' },
  { to: '/operador/cupos', label: 'Cupos' },
  { to: '/operador/reservas', label: 'Historial de Reservas' },
  { to: '/operador/resenas', label: 'Reseñas' },
  { to: '/operador/configuracion', label: 'Configuración' },
]

// Enlaces del encabezado: sin forma de botón; el hover y el subrayado de la
// sección activa los distinguen (igual que en el panel del admin).
function NavigationLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
          isActive
            ? 'text-brand underline decoration-2 underline-offset-8'
            : 'text-ink hover:bg-canvas hover:text-brand'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}

function OperatorLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <div className="min-h-screen w-full bg-canvas">
        <header className="border-b border-black/10 bg-white">
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8 lg:px-12 2xl:px-16">
            <Link to="/" className="text-[28px] font-extrabold tracking-tight text-brand">
              RutaSV
            </Link>

            <nav aria-label="Navegación del operador" className="flex flex-wrap items-center gap-1">
              {navigation.map((item) => (
                <NavigationLink key={item.to} item={item} />
              ))}
            </nav>

            <div className="ml-auto">
              <UserMenu
                label={getUserMenuLabel(user)}
                items={getUserMenuItems(user)}
                onLogout={logout}
                className="max-w-[65%] md:max-w-sm"
              />
            </div>
          </div>
        </header>

        <main className="px-5 pb-12 pt-8 md:px-8 lg:px-12 2xl:px-16">
          <section>
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
