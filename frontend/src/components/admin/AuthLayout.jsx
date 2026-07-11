import { Link } from 'react-router-dom'

function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-card__brand" to="/">
          Gastro Carta
        </Link>
        <p className="auth-card__eyebrow">{eyebrow}</p>
        <h1 id="auth-title">{title}</h1>
        {description && <p className="auth-card__description">{description}</p>}
        {children}
        {footer && <div className="auth-card__footer">{footer}</div>}
      </section>
    </main>
  )
}

export default AuthLayout
