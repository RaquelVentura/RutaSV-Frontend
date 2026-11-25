// Panel del operador: contiene la barra de navegación y el contenido de cada sección.

import { Link, Outlet } from 'react-router-dom'
import OperatorHeader from '../../components/operator/OperatorHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function OperatorLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <div className="min-h-screen w-full bg-canvas">
        <OperatorHeader />

        {user && !user.emailVerified && (
          <div role="status" className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 md:px-8 lg:px-12 2xl:px-16">
            <strong>Verifica tu correo para recibir avisos.</strong>{' '}
            Mientras no lo verifiques no te enviaremos avisos de reservas, cancelaciones ni cambios.{' '}
            <Link to="/verify-email" className="font-semibold underline">Verificar ahora</Link>
          </div>
        )}

        <main className="px-5 pb-12 pt-8 md:px-8 lg:px-12 2xl:px-16">
          <section>
            <Outlet />
          </section>
        </main>
      </div>
      <footer className="bg-ink text-white">
        <div className="flex w-full flex-wrap items-center justify-between gap-5 px-5 py-7 text-xs md:px-8 lg:px-12 2xl:px-16">
          <div>
            <p className="text-lg font-extrabold tracking-tight">RutaSV</p>
            <p className="mt-2 text-white/65">© 2026 RutaSV · Hecho en El Salvador</p>
          </div>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-5 gap-y-2 text-white/75">
            <a href="mailto:ayuda@rutasv.com" className="transition hover:text-white">Ayuda</a>
            <span>Privacidad</span>
            <span>Términos</span>
            <span>ES / EN · USD</span>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default OperatorLayout
