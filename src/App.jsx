import Notifications from './components/Notifications.jsx'
import AuthProvider from './lib/auth/AuthProvider.jsx'
import AppRoutes from './router.jsx'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Notifications />
    </AuthProvider>
  )
}

export default App
