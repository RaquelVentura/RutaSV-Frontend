import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/Auth/Login.jsx'
import Registration from './pages/Auth/Registration.jsx'
import EmailVerification from './pages/Auth/EmailVerification.jsx'
import VerificationResult from './pages/Auth/VerificationResult.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import CreateUser from './pages/Admin/CreateUser.jsx'
import RequestDetail from './pages/Admin/RequestDetail.jsx'
import RequestsQueue from './pages/Admin/RequestsQueue.jsx'
import UsersList from './pages/Admin/UsersList.jsx'
import OperatorAvailability from './pages/Operators/OperatorAvailability.jsx'
import OperatorDashboard from './pages/Operators/OperatorDashboard.jsx'
import OperatorExperienceForm from './pages/Operators/OperatorExperienceForm.jsx'
import OperatorExperiences from './pages/Operators/OperatorExperiences.jsx'
import OperatorLayout from './pages/Operators/OperatorLayout.jsx'
import OperatorReservations from './pages/Operators/OperatorReservations.jsx'
import OperatorReviews from './pages/Operators/OperatorReviews.jsx'
import OperatorSettings from './pages/Operators/OperatorSettings.jsx'
import OperatorRequestForm from './pages/Operators/OperatorRequestForm.jsx'

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER'

function AppContent() {
  const { pathname } = useLocation()

  if (pathname === '/operador/solicitud') {
    return (
      <AppLayout>
        <OperatorRequestForm />
      </AppLayout>
    )
  } else if (pathname.startsWith('/operador')) {
    return (
      <Routes>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  } else if (pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsersList />} />
          <Route path="usuarios/nuevo" element={<CreateUser />} />
          <Route path="solicitudes" element={<RequestsQueue />} />
          <Route path="solicitudes/:id" element={<RequestDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App