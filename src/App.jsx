import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/Auth/Login.jsx'
import Registration from './pages/Auth/Registration.jsx'
import EmailVerification from './pages/Auth/EmailVerification.jsx'
import VerificationResult from './pages/Auth/VerificationResult.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  const [user, setUser] = useState(null)

  return (
    <AppLayout user={user} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registration />} />
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

export default App
