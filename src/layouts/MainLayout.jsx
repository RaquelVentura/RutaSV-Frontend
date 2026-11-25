import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/admin/AdminHeader.jsx'
import Footer from '../components/Footer.jsx'
import NavBar from '../components/NavBar.jsx'
import OperatorHeader from '../components/operator/OperatorHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Roles } from '../lib/roles.js'

// El admin y el operador ven su propio encabezado en todas las páginas (también en el
// sitio público); el resto de usuarios ve el encabezado del sitio.
function MainLayout() {
  const { user, logout, refreshSession } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {user?.role === Roles.ADMIN ? (
        <AdminHeader />
      ) : user?.role === Roles.OPERADOR ? (
        <OperatorHeader />
      ) : (
        <NavBar user={user} onLogout={logout} onMenuOpen={refreshSession} />
      )}
      <main className="w-full max-w-none flex-1 pb-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
