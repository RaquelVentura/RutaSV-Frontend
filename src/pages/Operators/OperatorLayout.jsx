import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

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
        `text-sm transition ${
          isActive
            ? 'font-bold text-brand'
            : 'font-medium text-muted hover:text-brand'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}

function OperatorLayout() {
  const { user } = useAuth()
  const operatorName =
    user?.businessName || user?.business_name || 'Olas de El Tunco'

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-[#213b43]">
      <div className="mx-auto min-h-screen w-full max-w-[412px] bg-[#f7f9fa] md:max-w-5xl xl:max-w-6xl">
        <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-[#e2e8e9] bg-white px-5 md:px-8 lg:px-10">
          <Link to="/" className="text-[28px] font-extrabold tracking-tight text-brand">
            RutaSV
          </Link>
          <Link
            to="/operador/configuracion"
            className="max-w-[65%] truncate rounded-full bg-[#eaf5f6] px-3 py-2 text-xs font-semibold text-[#287987] md:max-w-xs"
            aria-label={`Operador: ${operatorName}`}
          >
            OT · {operatorName}
            <span aria-hidden="true" className="ml-1">⌄</span>
          </Link>
        </header>

        <main className="px-5 pb-10 pt-7 md:px-8 md:pt-9 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-wide text-[#147c91]">
            Panel del operador · {operatorName}
          </p>
          <nav
            aria-label="Navegación del operador"
            className="mt-5 grid grid-cols-3 gap-x-3 gap-y-4 border-b border-[#dce4e5] pb-5 sm:grid-cols-6 md:gap-x-5"
          >
            {navigation.map((item) => (
              <NavigationLink key={item.to} item={item} />
            ))}
          </nav>

          <section className="pt-6 md:pt-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}

export default OperatorLayout
