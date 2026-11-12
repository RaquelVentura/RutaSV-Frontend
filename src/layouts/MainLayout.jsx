import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import NavBar from '../components/NavBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function MainLayout() {
  const { user, logout, refreshSession } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar user={user} onLogout={logout} onMenuOpen={refreshSession} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
