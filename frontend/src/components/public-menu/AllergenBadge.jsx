import '../../styles/components/allergens.css'

function AllergenBadge({ allergen, compact = false }) {
  return (
    <span
      className={`allergen-badge${compact ? ' allergen-badge--compact' : ''}`}
      title={allergen.description || allergen.name}
    >
      <span aria-hidden="true">{allergen.emoji}</span>
      <span>{allergen.name}</span>
    </span>
  )
}

export default AllergenBadge
