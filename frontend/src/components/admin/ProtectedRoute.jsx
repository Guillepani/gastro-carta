import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingState from '../public-menu/LoadingState.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) return <LoadingState message="Comprobando sesión..." />

  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
