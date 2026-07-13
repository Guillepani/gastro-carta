import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginForm({ error, isSubmitting, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          disabled={isSubmitting}
          required
        />
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Comprobando acceso...' : 'Entrar al panel'}
      </button>

      <p className="auth-form__hint">
        ¿Todavía no tienes cuenta? <Link to="/admin/register">Registra tu restaurante</Link>
      </p>
    </form>
  )
}

export default LoginForm
