import { Link } from 'react-router-dom'

function DashboardSummary({ admin, categories, onLogout, products, restaurant, subcategories }) {
  const publicMenuPath = restaurant ? `/carta/${restaurant.slug}?preview=admin` : null
  const availableProducts = products.filter((product) => product.isAvailable).length

  return (
    <>
      <header className="dashboard-header">
        <div>
          <Link className="dashboard-header__brand" to="/">
            Gastro Carta
          </Link>
          <p className="dashboard-header__eyebrow">Panel admin</p>
          <h1>Gestión de la carta</h1>
          {restaurant && (
            <p className="dashboard-header__meta">
              Hola, {admin.name}. Estás gestionando <strong>{restaurant.name}</strong>
            </p>
          )}
        </div>
        <nav className="dashboard-nav" aria-label="Navegación del panel">
          {publicMenuPath && (
            <Link className="button button--primary" to={publicMenuPath}>
              Carta
            </Link>
          )}
          <button className="button button--ghost" type="button" aria-disabled="true">
            Estadísticas
          </button>
          <button className="button button--ghost" type="button" aria-disabled="true">
            Restaurante
          </button>
          <button className="button button--danger" type="button" onClick={onLogout}>
            Salir
          </button>
        </nav>
      </header>

      <section className="dashboard-grid" aria-label="Resumen del restaurante">
        <article className="dashboard-card">
          <p className="dashboard-card__label">Restaurante activo</p>
          {restaurant ? (
            <>
              <h2>{restaurant.name}</h2>
              <p>{restaurant.slug}</p>
              {restaurant.description && <p>{restaurant.description}</p>}
            </>
          ) : (
            <p>No hay restaurante asociado a esta cuenta.</p>
          )}
        </article>

        <article className="dashboard-card dashboard-card--accent">
          <p className="dashboard-card__label">Carta pública</p>
          {publicMenuPath ? (
            <>
              <h2>Tu carta pública</h2>
              <p>Revisa cómo verán tus clientes los cambios publicados.</p>
              <Link className="button button--primary" to={publicMenuPath}>
                Previsualizar carta pública
              </Link>
            </>
          ) : (
            <p>Cuando tengas restaurante asociado, aquí aparecerá el enlace público.</p>
          )}
        </article>
      </section>

      <section className="admin-summary" aria-label="Resumen de carta">
        <article>
          <span>{categories.length}</span>
          <p>Categorías</p>
        </article>
        <article>
          <span>{subcategories.length}</span>
          <p>Subcategorías</p>
        </article>
        <article>
          <span>{products.length}</span>
          <p>Productos</p>
        </article>
        <article>
          <span>{availableProducts}</span>
          <p>Disponibles</p>
        </article>
      </section>
    </>
  )
}

export default DashboardSummary
