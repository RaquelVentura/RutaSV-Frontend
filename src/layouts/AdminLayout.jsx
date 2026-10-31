import { Link, NavLink, Outlet, useMatch } from 'react-router-dom'
import Container from '../components/Container.jsx'
import SearchInput from '../components/admin/SearchInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const navClass = ({ isActive }) =>
  `text-sm font-medium hover:text-brand ${isActive ? 'text-brand' : 'text-ink'}`

function AdminLayout() {
  const { user } = useAuth()
  const isDashboard = useMatch({ path: '/admin', end: true })
  const adminName = user?.role === 'ADMIN' && user?.name ? user.name : 'RutaSV'

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-mist bg-surface">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <Link to="/admin" className="text-2xl font-extrabold text-brand">
            RutaSV
          </Link>

          {!isDashboard && (
            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="hidden md:block md:w-72"
            >
              <SearchInput label="¿Qué vas a gestionar?" placeholder="¿Qué vas a gestionar?" />
            </form>
          )}

          <div className="flex items-center gap-x-8 md:ml-auto">
            <NavLink to="/admin/solicitudes" className={navClass}>
              Solicitudes
            </NavLink>
            <NavLink to="/admin/usuarios" className={navClass}>
              Usuarios
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <span className="hidden text-xs font-semibold text-brand sm:inline">ES / EN ▾</span>
            <span className="rounded-full bg-info-soft px-4 py-2 text-xs font-bold text-brand">
              ADMIN {adminName}
            </span>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Container className="py-8">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

export default AdminLayout
