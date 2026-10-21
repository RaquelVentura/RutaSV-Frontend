import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth/useAuth.js'

function ProtectedRoute({ roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/sin-permiso" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
