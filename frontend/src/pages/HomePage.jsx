import { Link } from 'react-router-dom'
import '../styles/pages/home.css'

function HomePage() {
  return (
    <main className="site-main">
      <section className="home container" aria-labelledby="home-title">
        <p className="home__eyebrow">Gastro Carta</p>
        <h1 id="home-title">Tu carta digital empieza aquí</h1>
        <p className="home__description">
          Una experiencia clara y cómoda para descubrir cada plato desde cualquier
          dispositivo.
        </p>
        <Link className="home__link" to="/carta/las-delicias-de-isa">
          Ver carta demo
        </Link>
      </section>
    </main>
  )
}

export default HomePage
