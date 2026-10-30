import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppLayout({ user: propUser, onLogout, children }) {
  const { user: authUser, isAuthenticated: authIsAuthenticated, logout } = useAuth()
  const currentUser = authUser ?? propUser ?? null
  const isAuthenticated = authIsAuthenticated || Boolean(propUser)
  const handleLogout = onLogout ?? logout

  const displayName =
    currentUser?.name ||
    [currentUser?.given_name, currentUser?.family_name].filter(Boolean).join(' ') ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.email ||
    'Usuario'

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-xl font-bold text-[#087E9A]">
            RutaSV
          </Link>
          {isAuthenticated ? (
            <div
              aria-label="Menú de perfil"
              className="flex items-center gap-4"
            >
              <span className="text-sm text-stone-600">
                Hola, {displayName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-[#087E9A] px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800"
              >
                Registro
              </Link>
            </div>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
