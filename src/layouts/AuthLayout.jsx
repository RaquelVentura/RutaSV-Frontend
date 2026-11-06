import { Navigate, Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import { useAuth } from '../lib/auth/useAuth.js'

function AuthLayout() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar />
      <main className="flex-1 px-6 py-16">
        <Outlet />
        <p className="mt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} RutaSV · Privacidad · Términos y
          condiciones
        </p>
      </main>
    </div>
  )
}

export default AuthLayout
