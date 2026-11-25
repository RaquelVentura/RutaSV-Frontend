import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import { Roles } from './lib/roles.js'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import AdminExperienceDetail from './pages/Admin/AdminExperienceDetail.jsx'
import AdminExperiences from './pages/Admin/AdminExperiences.jsx'
import CreateUser from './pages/Admin/CreateUser.jsx'
import OperatorsList from './pages/Admin/OperatorsList.jsx'
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
import OperatorRefundTicket from './pages/Operators/OperatorRefundTicket.jsx'
import OperatorReservations from './pages/Operators/OperatorReservations.jsx'
import OperatorReviews from './pages/Operators/OperatorReviews.jsx'
import OperatorSettings from './pages/Operators/OperatorSettings.jsx'
import Profile from './pages/Profile/Profile.jsx'
import ActivityFavorites from './pages/Tourist/ActivityFavorites.jsx'
import ActivityReservations from './pages/Tourist/ActivityReservations.jsx'
import CompanyProfile from './pages/Companies/CompanyProfile.jsx'
import ExperienceDetail from './pages/Experiences/ExperienceDetail.jsx'
import ExperienceExplorer from './pages/Experiences/ExperienceExplorer.jsx'
import Reservation from './pages/Tourist/Reservation.jsx'
import ReservationConfirmation from './pages/Tourist/ReservationConfirmation.jsx'

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
          <Route path="reservas/reembolso/:refundId" element={<OperatorRefundTicket />} />
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
          <Route path="operadores" element={<OperatorsList />} />
          <Route path="experiencias" element={<AdminExperiences />} />
          <Route path="experiencias/:id" element={<AdminExperienceDetail />} />
          <Route path="experiencias/:owner/:id" element={<AdminExperienceDetail />} />
          <Route
            path="solicitudes-operador"
            element={<Navigate to="/admin/solicitudes" replace />}
          />
          <Route path="solicitudes/:id" element={<RequestDetail />} />
        </Route>
      </Route>

      {/* Acceso: carrusel con el logotipo y el formulario a la par */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registration />} />
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
      </Route>

      {/* Rutas públicas y de visitante autenticado unificadas bajo MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/experiencias" element={<ExperienceExplorer />} />
        <Route path="/experiencias/:slug" element={<ExperienceDetail />} />
        <Route path="/empresas/:slug" element={<CompanyProfile />} />
        <Route path="/turista" element={<Navigate to="/experiencias" replace />} />
        <Route path="/turista/explorar" element={<Navigate to="/experiencias" replace />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/auth/register"
          element={<Navigate to="/registro" replace />}
        />

        {/* Flujo de reservación y actividad del turista (unificado bajo MainLayout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/turista/reservar" element={<Reservation />} />
          <Route
            path="/turista/reservar/confirmacion"
            element={<ReservationConfirmation />}
          />
          <Route
            path="/turista/mi-actividad"
            element={<Navigate to="/turista/mi-actividad/reservas" replace />}
          />
          <Route path="/turista/mi-actividad/reservas" element={<ActivityReservations />} />
          <Route path="/turista/mi-actividad/favoritos" element={<ActivityFavorites />} />
          <Route path="/mis-reservas" element={<Navigate to="/turista/mi-actividad/reservas" replace />} />
          <Route path="/favoritos" element={<Navigate to="/turista/mi-actividad/favoritos" replace />} />
        </Route>

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

        {/* Perfil de la cuenta: cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<Profile />} />
        </Route>

        <Route path="/sin-permiso" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
