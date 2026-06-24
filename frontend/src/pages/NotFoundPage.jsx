import { Link } from 'react-router-dom'
import '../styles/pages/not-found.css'

function NotFoundPage() {
  return (
    <main className="not-found container">
      <p className="not-found__code">404</p>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe o ha cambiado.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  )
}

export default NotFoundPage
