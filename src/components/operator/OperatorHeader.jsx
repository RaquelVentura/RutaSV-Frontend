import { Link, NavLink } from 'react-router-dom'
import UserMenu from '../UserMenu.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserMenuItems, getUserMenuLabel } from '../../lib/userMenu.js'

const navigation = [
  { to: '/operador', label: 'Resumen', end: true },
  { to: '/operador/experiencias', label: 'Mis experiencias' },
  { to: '/operador/cupos', label: 'Cupos' },
  { to: '/operador/reservas', label: 'Historial de Reservas' },
  { to: '/operador/resenas', label: 'Reseñas' },
  { to: '/operador/configuracion', label: 'Configuración' },
  { to: '/', label: 'Ver sitio', end: true },
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

// Encabezado del operador: es el mismo en el panel y en cualquier página del sitio.
function OperatorHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8 lg:px-12 2xl:px-16">
        <Link to="/operador" className="text-[28px] font-extrabold tracking-tight text-brand">
          RutaSV
        </Link>

        <nav aria-label="Navegación del operador" className="flex flex-wrap items-center gap-1">
          {navigation.map((item) => (
            <NavigationLink key={item.label} item={item} />
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
  )
}

export default OperatorHeader
