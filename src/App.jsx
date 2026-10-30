import { Route, Routes, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/Auth/Login.jsx'
import Registration from './pages/Auth/Registration.jsx'
import EmailVerification from './pages/Auth/EmailVerification.jsx'
import VerificationResult from './pages/Auth/VerificationResult.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import OperatorRequestForm from './pages/Operators/OperatorRequestForm.jsx'

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER'

function AppContent() {
  const { pathname } = useLocation()

  if (pathname === '/operador/solicitud') {
    return <OperatorRequestForm />
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
