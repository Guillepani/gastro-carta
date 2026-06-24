import AllergenBadge from './AllergenBadge.jsx'

function AllergenLegend({ allergens }) {
  if (!allergens.length) return null

  return (
    <section className="allergen-legend" aria-labelledby="allergen-legend-title">
      <div className="allergen-legend__heading">
        <p>Información alimentaria</p>
        <h2 id="allergen-legend-title">Leyenda de alérgenos</h2>
      </div>
      <div className="allergen-legend__grid">
        {allergens.map((allergen) => (
          <AllergenBadge key={allergen.id} allergen={allergen} />
        ))}
      </div>
    </section>
  )
}

export default AllergenLegend
