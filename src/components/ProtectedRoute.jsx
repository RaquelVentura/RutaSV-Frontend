import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/sin-permiso" replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
