import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/admin/AuthLayout.jsx'
import LoginForm from '../components/admin/LoginForm.jsx'
import LoadingState from '../components/public-menu/LoadingState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../services/apiClient.js'
import '../styles/pages/admin-auth.css'

function getLoginErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Email o contraseña incorrectos.'
    return error.message
  }

  return 'No se pudo iniciar sesión. Inténtalo de nuevo.'
}

function AdminLoginPage() {
  const { isAuthenticated, isInitializing, login } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/admin/dashboard'

  if (isInitializing) return <LoadingState message="Comprobando sesión..." />
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />

  async function handleSubmit(payload) {
    setError('')
    setIsSubmitting(true)

    try {
      await login(payload)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(getLoginErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Acceso admin"
      title="Entra a tu panel"
      description="Gestiona la información básica de tu restaurante desde un espacio privado."
    >
      <LoginForm error={error} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
    </AuthLayout>
  )
}

export default AdminLoginPage
