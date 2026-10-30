import Footer from '../components/Footer.jsx'
import NavBar from '../components/NavBar.jsx'

export default function AppLayout({ user, onLogout, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar user={user} onLogout={onLogout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
