import Footer from '../components/Footer.jsx'
import NavBar from '../components/NavBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppLayout({ user: propUser, onLogout, children }) {
  const { user: authUser, logout } = useAuth()
  const user = authUser ?? propUser ?? null

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar user={user} onLogout={onLogout ?? logout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
