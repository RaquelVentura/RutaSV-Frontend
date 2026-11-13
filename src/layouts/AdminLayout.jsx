import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/Container.jsx'
import SearchInput from '../components/admin/SearchInput.jsx'
import UserMenu from '../components/UserMenu.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useAdminSearch from '../lib/useAdminSearch.js'
import { getUserMenuItems, getUserMenuLabel } from '../lib/userMenu.js'

// Listas donde el buscador del encabezado filtra en vivo.
const searchableRoutes = ['/admin/solicitudes', '/admin/usuarios']

const sections = [
  { label: 'Resumen', to: '/admin', end: true },
  { label: 'Solicitudes', to: '/admin/solicitudes' },
  { label: 'Usuarios', to: '/admin/usuarios' },
  { label: 'Empresas' },
  { label: 'Experiencias' },
]

const pillClass = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
    isActive ? 'bg-brand text-white' : 'border border-mist bg-surface text-ink hover:bg-canvas'
  }`

function AdminLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [urlQuery, setUrlQuery] = useAdminSearch()
  const [draft, setDraft] = useState('')
  const isSearchable = searchableRoutes.includes(pathname)

  function handleSearchSubmit(event) {
    event.preventDefault()
    if (isSearchable) return
    const term = draft.trim()
    navigate(term ? `/admin/solicitudes?q=${encodeURIComponent(term)}` : '/admin/solicitudes')
    setDraft('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-mist bg-surface">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <Link to="/admin" className="text-2xl font-extrabold text-brand">
            RutaSV
          </Link>

          <form role="search" onSubmit={handleSearchSubmit} className="hidden md:block md:w-72">
            <SearchInput
              label="¿Qué vas a gestionar?"
              placeholder="¿Qué vas a gestionar?"
              value={isSearchable ? urlQuery : draft}
              onChange={(event) =>
                isSearchable ? setUrlQuery(event.target.value) : setDraft(event.target.value)
              }
            />
          </form>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-xs font-semibold text-brand sm:inline">ES / EN ▾</span>
            <UserMenu
              label={getUserMenuLabel(user)}
              items={getUserMenuItems(user)}
              onLogout={logout}
            />
          </div>
        </nav>

        <nav
          aria-label="Secciones del panel"
          className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4"
        >
          {sections.map((section) =>
            section.to ? (
              <NavLink key={section.label} to={section.to} end={section.end} className={pillClass}>
                {section.label}
              </NavLink>
            ) : (
              <button key={section.label} type="button" className={pillClass({ isActive: false })}>
                {section.label}
              </button>
            ),
          )}
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
