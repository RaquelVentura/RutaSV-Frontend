import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Roles } from '../lib/roles.js'
import Button from './Button.jsx'
import LinkButton from './LinkButton.jsx'

const linkClass = 'text-sm font-medium text-ink hover:text-brand'

function getPublishPath(user) {
  if (!user) return '/auth/register'
  if (user.role === Roles.VISITANTE) return '/solicitar-operador'
  return '/operador/experiencias/nueva'
}

function NavBar({ user = null, onLogout }) {
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
          {user?.role === Roles.VISITANTE && (
            <>
              <Link to="/mis-reservas" className={linkClass}>
                Mis reservas
              </Link>
              <Link to="/favoritos" className={linkClass}>
                Favoritos
              </Link>
            </>
          )}
          {(user?.role === Roles.OPERADOR || user?.role === Roles.ADMIN) && (
            <Link to="/operador" className={linkClass}>
              Panel de operador
            </Link>
          )}
          {user?.role === Roles.ADMIN && (
            <Link to="/admin" className={linkClass}>
              Administración
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-brand lg:inline">ES / EN ▾</span>
          {user ? (
            <>
              <Link to="/perfil" className={linkClass}>
                {user.firstName ?? user.name}
              </Link>
              <Button variant="outline" onClick={onLogout}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <LinkButton to="/auth/login" variant="outline">
                Login
              </LinkButton>
              <LinkButton to="/auth/register">Registro</LinkButton>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default NavBar
