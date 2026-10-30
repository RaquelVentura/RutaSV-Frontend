import { Route, Routes } from 'react-router-dom'
import AuthCard from './components/AuthCard.jsx'
import PagePlaceholder from './components/PagePlaceholder.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import { Roles } from './lib/roles.js'
import Forbidden from './pages/Forbidden.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/auth/login"
          element={
            <AuthCard
              eyebrow="Tu próxima historia empieza aquí"
              title="Qué bueno verte de nuevo"
              subtitle="Ingresa para seguir descubriendo El Salvador."
            >
              <p className="text-muted">Formulario pendiente de implementar.</p>
            </AuthCard>
          }
        />
        <Route
          path="/auth/register"
          element={
            <AuthCard
              eyebrow="Viaja cerca. Vive más."
              title="Tu aventura, a un paso"
              subtitle="Crea tu cuenta y encuentra experiencias con alma local."
            >
              <p className="text-muted">Formulario pendiente de implementar.</p>
            </AuthCard>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthCard title="Verifica tu correo">
              <p className="text-muted">Pantalla pendiente de implementar.</p>
            </AuthCard>
          }
        />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/experiencias"
          element={
            <PagePlaceholder title="Catálogo de experiencias"/>
          }
        />
        <Route
          path="/experiencias/:slug"
          element={<PagePlaceholder title="Detalle de experiencia" />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/perfil"
            element={<PagePlaceholder title="Mi perfil" />}
          />
        </Route>

        <Route element={<ProtectedRoute roles={[Roles.VISITANTE]} />}>
          <Route
            path="/mis-reservas"
            element={<PagePlaceholder title="Mis reservas"/>}
          />
          <Route
            path="/favoritos"
            element={<PagePlaceholder title="Favoritos" />}
          />
          <Route
            path="/solicitar-operador"
            element={
              <PagePlaceholder title="Solicitar ser operador"/>
            }
          />
        </Route>

        <Route
          path="/operador"
          element={<ProtectedRoute roles={[Roles.OPERADOR, Roles.ADMIN]} />}
        >
          <Route
            index
            element={<PagePlaceholder title="Panel del operador" />}
          />
          <Route
            path="experiencias"
            element={<PagePlaceholder title="Mis experiencias" />}
          />
          <Route
            path="experiencias/nueva"
            element={
              <PagePlaceholder title="Publicar experiencia"/>
            }
          />
          <Route
            path="calendario"
            element={<PagePlaceholder title="Calendario" />}
          />
          <Route
            path="reservas"
            element={<PagePlaceholder title="Reservas recibidas" />}
          />
        </Route>

        <Route
          path="/admin"
          element={<ProtectedRoute roles={[Roles.ADMIN]} />}
        >
          <Route
            index
            element={<PagePlaceholder title="Panel de administración" />}
          />
          <Route
            path="solicitudes-operador"
            element={
              <PagePlaceholder title="Solicitudes de operador"/>
            }
          />
          <Route
            path="usuarios"
            element={<PagePlaceholder title="Usuarios" />}
          />
          <Route
            path="empresas"
            element={<PagePlaceholder title="Empresas" />}
          />
          <Route
            path="experiencias"
            element={<PagePlaceholder title="Moderación de experiencias" />}
          />
        </Route>

        <Route path="/sin-permiso" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
