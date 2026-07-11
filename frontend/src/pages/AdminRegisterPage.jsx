import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/admin/AuthLayout.jsx'
import RegisterForm from '../components/admin/RegisterForm.jsx'
import LoadingState from '../components/public-menu/LoadingState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../services/apiClient.js'
import '../styles/pages/admin-auth.css'

function getRegisterErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return 'Ese email ya está registrado.'
    }

    if (error.code === 'SLUG_ALREADY_EXISTS') {
      return 'Ese slug de restaurante ya está en uso.'
    }

    return error.message
  }

  return 'No se pudo crear la cuenta. Inténtalo de nuevo.'
}

function AdminRegisterPage() {
  const { isAuthenticated, isInitializing, register } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  if (isInitializing) return <LoadingState message="Comprobando sesión..." />
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />

  async function handleSubmit(payload) {
    setError('')
    setIsSubmitting(true)

    try {
      await register(payload)
      navigate('/admin/dashboard', { replace: true })
    } catch (requestError) {
      setError(getRegisterErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Nuevo restaurante"
      title="Crea tu cuenta admin"
      description="Registra el admin y el restaurante en un solo paso para empezar con una carta base."
    >
      <RegisterForm error={error} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
    </AuthLayout>
  )
}

export default AdminRegisterPage
