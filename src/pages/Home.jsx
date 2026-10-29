import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home({ user: propUser }) {
  const location = useLocation()
  const { user: authUser } = useAuth()
  const user = authUser ?? propUser ?? null

  return (
    <section>
      {location.state?.notice && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {location.state.notice}
        </p>
      )}
      {user ? (
        <>
          <h1 className="text-3xl font-bold">Qué bueno verte, {user.name}</h1>
          <p className="mt-2 text-stone-600">
            Explora experiencias turísticas locales: surf, gastronomía y rutas
            de pueblos vivos.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Descubre El Salvador</h1>
          <p className="mt-2 text-stone-600">
            Experiencias turísticas locales: surf, gastronomía y rutas de
            pueblos vivos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-white"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="rounded-full bg-[#087E9A] px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-800"
            >
              Crear cuenta
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

export default Home
