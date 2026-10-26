import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import NavBar from '../components/NavBar.jsx'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
