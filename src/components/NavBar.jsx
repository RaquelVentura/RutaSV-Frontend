import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserMenuItems, getUserMenuLabel } from '../lib/userMenu.js'
import LinkButton from './LinkButton.jsx'
import UserMenu from './UserMenu.jsx'

const linkClass = 'text-sm font-medium text-ink hover:text-brand'

function NavBar({ user = null, onLogout, onMenuOpen }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/experiencias?q=${encodeURIComponent(term)}` : '/experiencias')
  }

  return (
    <header className="border-b border-mist bg-surface">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
        <Link to="/" className="text-2xl font-extrabold text-brand">
          RutaSV
        </Link>

        <form onSubmit={handleSearch} className="hidden md:block md:w-72">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="¿A dónde quieres ir?"
            aria-label="Buscar experiencias"
            className="w-full rounded-full border border-mist bg-canvas px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </form>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:ml-auto">
          <Link to="/experiencias" className={linkClass}>
            Explorar
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-brand lg:inline">ES / EN ▾</span>
          {user ? (
            <UserMenu
              label={getUserMenuLabel(user)}
              items={getUserMenuItems(user)}
              onOpen={onMenuOpen}
              onLogout={onLogout}
            />
          ) : (
            <>
              <LinkButton to="/login" variant="outline">
                Iniciar sesión
              </LinkButton>
              <LinkButton to="/registro">Registro</LinkButton>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default NavBar
