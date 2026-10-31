import { useEffect, useRef, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppLayout({ user: propUser, onLogout, children }) {
  const {
    user: authUser,
    isAuthenticated: authIsAuthenticated,
    logout,
    refreshSession,
  } = useAuth()
  const currentUser = authUser ?? propUser ?? null
  const isAuthenticated = authIsAuthenticated || Boolean(propUser)
  const handleLogout = onLogout ?? logout

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName =
    currentUser?.name ||
    [currentUser?.given_name, currentUser?.family_name].filter(Boolean).join(' ') ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.email ||
    'Usuario'

  const isEmailVerified =
    currentUser?.emailVerified === true ||
    currentUser?.email_verified === true ||
    currentUser?.email_verified === 'true'

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-xl font-bold text-[#087E9A]">
            RutaSV
          </Link>
          {isAuthenticated ? (
            <div
              ref={menuRef}
              aria-label="Menú de perfil"
              className="relative"
            >
              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setIsMenuOpen((open) => {
                    const nextOpen = !open
                    if (nextOpen) {
                      refreshSession?.()
                    }
                    return nextOpen
                  })
                }}
                className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-cyan-700"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-[#087E9A]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>{displayName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className={`h-4 w-4 text-stone-500 transition-transform ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  aria-label="Opciones de usuario"
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-stone-200 bg-white py-2 shadow-lg"
                >
                  <Link
                    to="/perfil/editar"
                    role="menuitem"
                    onClick={closeMenu}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#087E9A]"
                  >
                    Editar perfil
                  </Link>
                  {(!currentUser?.role || currentUser?.role === 'VISITANTE') && (
                    <Link
                      to="/operador/solicitud"
                      role="menuitem"
                      onClick={closeMenu}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#087E9A]"
                    >
                      Solicitud de Operador
                    </Link>
                  )}
                  {(currentUser?.role === 'OPERADOR' ||
                    currentUser?.role === 'ADMIN') && (
                    <Link
                      to="/operador"
                      role="menuitem"
                      onClick={closeMenu}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#087E9A]"
                    >
                      Panel de operador
                    </Link>
                  )}
                  {currentUser?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      role="menuitem"
                      onClick={closeMenu}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#087E9A]"
                    >
                      Panel de administración
                    </Link>
                  )}
                  {!isEmailVerified && (
                    <Link
                      to="/verify-email"
                      role="menuitem"
                      onClick={closeMenu}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#087E9A]"
                    >
                      Verificar Correo
                    </Link>
                  )}
                  <div className="my-1 border-t border-stone-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      closeMenu()
                      handleLogout()
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
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
      <main className="mx-auto max-w-5xl px-4 py-8">{children ?? <Outlet />}</main>
    </div>
  )
}
