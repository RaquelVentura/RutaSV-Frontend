import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import PagePlaceholder from './components/PagePlaceholder.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import ContainedLayout from './layouts/ContainedLayout.jsx'
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
        <Route path="/" element={<Home />} />
        <Route element={<ContainedLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/auth/register" element={<Registration />} />
          <Route path="/registro/verificar" element={<EmailVerification />} />
          <Route
            path="/registro/verificacion/aceptada"
            element={<VerificationResult accepted />}
          />
          <Route
            path="/registro/verificacion/rechazada"
            element={<VerificationResult accepted={false} />}
          />
          <Route
            path="/experiencias"
            element={<PagePlaceholder title="Catálogo de experiencias" />}
          />
          <Route
            path="/experiencias/:slug"
            element={<PagePlaceholder title="Detalle de experiencia" />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AppLayout>
  )
}

export default App
