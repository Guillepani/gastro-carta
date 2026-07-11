import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/admin/DashboardShell.jsx'
import ErrorState from '../components/public-menu/ErrorState.jsx'
import LoadingState from '../components/public-menu/LoadingState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../services/apiClient.js'
import '../styles/pages/admin-dashboard.css'

function AdminDashboardPage() {
  const { admin, restaurant, logout, refreshSession } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()

    refreshSession({ signal: controller.signal })
      .then(() => setError(null))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          if (requestError instanceof ApiError && requestError.status === 401) {
            logout()
            navigate('/admin', { replace: true })
            return
          }

          setError(requestError)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [logout, navigate, refreshSession])

  function handleLogout() {
    logout()
    navigate('/admin', { replace: true })
  }

  if (isLoading) return <LoadingState message="Cargando panel..." />

  if (error) {
    return (
      <ErrorState
        title="No hemos podido cargar el panel"
        message="Vuelve a iniciar sesión para continuar."
        actionLabel="Volver al login"
        actionTo="/admin"
      />
    )
  }

  return (
    <DashboardShell
      admin={admin}
      restaurant={restaurant}
      onLogout={handleLogout}
    />
  )
}

export default AdminDashboardPage
