import AdminNotice from './AdminNotice.jsx'

const MENU_THEMES = [
  {
    value: 'classic',
    name: 'Clásico',
    description: 'Carta gastobar elegante con crema, terracota y texto oscuro.',
  },
  {
    value: 'warm',
    name: 'Cálido',
    description: 'Estilo mediterráneo con beige, naranja suave y marrón.',
  },
  {
    value: 'minimal',
    name: 'Minimal',
    description: 'Limpio y moderno, con blanco, gris y acento discreto.',
  },
  {
    value: 'dark',
    name: 'Oscuro',
    description: 'Elegante nocturno con carbón, dorado y alto contraste.',
  },
  {
    value: 'fresh',
    name: 'Fresco',
    description: 'Ligero y natural, con verde suave y blanco roto.',
  },
]

function MenuThemeSelector({
  error,
  isSaving,
  message,
  onSelectTheme,
  selectedTheme = 'classic',
}) {
  return (
    <section className="admin-section theme-section" id="admin-restaurant-style">
      <div className="admin-section__heading">
        <div>
          <p className="dashboard-card__label">Restaurante</p>
          <h2>Estilo de la carta</h2>
          <p>Elige una paleta visual para que la carta pública encaje con tu local.</p>
        </div>
        <span>{MENU_THEMES.length} estilos</span>
      </div>

      <AdminNotice tone="error">{error}</AdminNotice>
      <AdminNotice>{message}</AdminNotice>

      <div className="theme-grid" role="list" aria-label="Paletas disponibles">
        {MENU_THEMES.map((theme) => {
          const isActive = selectedTheme === theme.value

          return (
            <button
              className={`theme-card theme-card--${theme.value}${isActive ? ' theme-card--active' : ''}`}
              key={theme.value}
              type="button"
              onClick={() => onSelectTheme(theme.value)}
              disabled={isSaving || isActive}
              aria-pressed={isActive}
            >
              <span className="theme-card__header">
                <span>
                  <strong>{theme.name}</strong>
                  <small>{theme.description}</small>
                </span>
                {isActive && <em>Activo</em>}
              </span>
              <span className="theme-card__swatches" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default MenuThemeSelector
