import { Outlet, Route, Routes } from 'react-router-dom'
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

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER'

function PublicShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="solicitudes" element={<RequestsQueue />} />
            <Route path="solicitudes/:id" element={<RequestDetail />} />
            <Route path="usuarios" element={<UsersList />} />
            <Route path="usuarios/nuevo" element={<CreateUser />} />
          </Route>
          <Route element={<PublicShell />}>
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
          </Route>
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
