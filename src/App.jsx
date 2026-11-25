/*import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './router.jsx'

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER'

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
*/ 

import Metricas from "./pages/Operators/Metricas.jsx";

function App() {
  return <Metricas />;
}

export default App;