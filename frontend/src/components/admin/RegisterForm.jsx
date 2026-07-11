import { useState } from 'react'
import { Link } from 'react-router-dom'

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  password: '',
  restaurantName: '',
  restaurantSlug: '',
}

function RegisterForm({ error, isSubmitting, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...formData,
      restaurantSlug: formData.restaurantSlug.trim() || undefined,
    })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="register-name">Nombre del admin</label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          required
        />
        <p className="form-field__help">Mínimo 8 caracteres.</p>
      </div>

      <div className="form-field">
        <label htmlFor="register-restaurant-name">Nombre del restaurante</label>
        <input
          id="register-restaurant-name"
          name="restaurantName"
          type="text"
          value={formData.restaurantName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-restaurant-slug">Slug público opcional</label>
        <input
          id="register-restaurant-slug"
          name="restaurantSlug"
          type="text"
          value={formData.restaurantSlug}
          onChange={handleChange}
          placeholder="mi-restaurante"
        />
        <p className="form-field__help">
          Si lo dejas vacío, se generará desde el nombre del restaurante.
        </p>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta y restaurante'}
      </button>

      <p className="auth-form__hint">
        ¿Ya tienes cuenta? <Link to="/admin">Inicia sesión</Link>
      </p>
    </form>
  )
}

export default RegisterForm
