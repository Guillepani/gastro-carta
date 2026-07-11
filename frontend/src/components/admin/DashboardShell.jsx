import { Link } from 'react-router-dom'

function DashboardShell({ admin, restaurant, onLogout }) {
  const publicMenuPath = restaurant ? `/carta/${restaurant.slug}` : null

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <Link className="dashboard-header__brand" to="/">
            Gastro Carta
          </Link>
          <p className="dashboard-header__eyebrow">Panel privado</p>
          <h1>Hola, {admin.name}</h1>
        </div>
        <button className="button button--ghost" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <section className="dashboard-grid" aria-label="Resumen del restaurante">
        <article className="dashboard-card">
          <p className="dashboard-card__label">Admin autenticado</p>
          <h2>{admin.name}</h2>
          <p>{admin.email}</p>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-card__label">Restaurante asociado</p>
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
              <h2>Tu carta ya tiene dirección</h2>
              <p>Comparte este enlace con tus clientes cuando esté lista.</p>
              <Link className="button button--primary" to={publicMenuPath}>
                Ver carta pública
              </Link>
            </>
          ) : (
            <p>Cuando tengas restaurante asociado, aquí aparecerá el enlace público.</p>
          )}
        </article>
      </section>
    </main>
  )
}

export default DashboardShell
