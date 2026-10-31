import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import { Roles } from './lib/roles.js'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import CreateUser from './pages/Admin/CreateUser.jsx'
import RequestDetail from './pages/Admin/RequestDetail.jsx'
import RequestsQueue from './pages/Admin/RequestsQueue.jsx'
import UsersList from './pages/Admin/UsersList.jsx'
import EmailVerification from './pages/Auth/EmailVerification.jsx'
import Login from './pages/Auth/Login.jsx'
import Registration from './pages/Auth/Registration.jsx'
import VerificationResult from './pages/Auth/VerificationResult.jsx'
import Forbidden from './pages/Forbidden.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import OperatorAvailability from './pages/Operators/OperatorAvailability.jsx'
import OperatorDashboard from './pages/Operators/OperatorDashboard.jsx'
import OperatorExperienceForm from './pages/Operators/OperatorExperienceForm.jsx'
import OperatorExperiences from './pages/Operators/OperatorExperiences.jsx'
import OperatorLayout from './pages/Operators/OperatorLayout.jsx'
import MyOperatorRequest from './pages/Operators/MyOperatorRequest.jsx'
import OperatorRequestForm from './pages/Operators/OperatorRequestForm.jsx'
import OperatorReservations from './pages/Operators/OperatorReservations.jsx'
import OperatorReviews from './pages/Operators/OperatorReviews.jsx'
import OperatorSettings from './pages/Operators/OperatorSettings.jsx'

function AppRoutes() {
  return (
    <Routes>
      {/* Panel de operador: requiere rol OPERADOR o ADMIN */}
      <Route element={<ProtectedRoute roles={[Roles.OPERADOR, Roles.ADMIN]} />}>
        <Route path="/operador" element={<OperatorLayout />}>
          <Route index element={<OperatorDashboard />} />
          <Route path="experiencias" element={<OperatorExperiences />} />
          <Route path="experiencias/nueva" element={<OperatorExperienceForm />} />
          <Route path="cupos" element={<OperatorAvailability />} />
          <Route
            path="calendario"
            element={<Navigate to="/operador/cupos" replace />}
          />
          <Route path="reservas" element={<OperatorReservations />} />
          <Route path="resenas" element={<OperatorReviews />} />
          <Route path="configuracion" element={<OperatorSettings />} />
        </Route>
      </Route>

      {/* Panel de administración: requiere rol ADMIN */}
      <Route element={<ProtectedRoute roles={[Roles.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsersList />} />
          <Route path="usuarios/nuevo" element={<CreateUser />} />
          <Route path="solicitudes" element={<RequestsQueue />} />
          <Route
            path="solicitudes-operador"
            element={<Navigate to="/admin/solicitudes" replace />}
          />
          <Route path="solicitudes/:id" element={<RequestDetail />} />
        </Route>
      </Route>

      {/* Rutas públicas y de visitante autenticado bajo AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/registro" element={<Registration />} />
        <Route
          path="/auth/register"
          element={<Navigate to="/registro" replace />}
        />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/registro/verificar" element={<EmailVerification />} />
        <Route
          path="/registro/verificacion/aceptada"
          element={<VerificationResult accepted />}
        />
        <Route
          path="/registro/verificacion/rechazada"
          element={<VerificationResult accepted={false} />}
        />

        {/* Estado y detalle de solicitud de operador */}
        <Route
          element={<ProtectedRoute roles={[Roles.VISITANTE, Roles.OPERADOR]} />}
        >
          <Route path="/operador/solicitud" element={<MyOperatorRequest />} />
          <Route
            path="/solicitar-operador"
            element={<Navigate to="/operador/solicitud" replace />}
          />
        </Route>

        {/* Creación o modificación de solicitud de operador: requiere visitante autenticado */}
        <Route element={<ProtectedRoute roles={[Roles.VISITANTE]} />}>
          <Route
            path="/operador/solicitud/formulario"
            element={<OperatorRequestForm />}
          />
        </Route>

        <Route path="/sin-permiso" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
