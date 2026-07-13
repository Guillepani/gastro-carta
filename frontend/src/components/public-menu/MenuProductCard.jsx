import AllergenBadge from './AllergenBadge.jsx'
import '../../styles/components/menu-product.css'

const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

function MenuProductCard({ product }) {
  return (
    <article className={`product-card${product.isFeatured ? ' product-card--featured' : ''}`}>
      <div className="product-card__heading">
        <h4>{product.name}</h4>
        <span className="product-card__dots" aria-hidden="true" />
        <p className="product-card__price">{priceFormatter.format(product.price)}</p>
      </div>
      {product.description && (
        <p className="product-card__description">{product.description}</p>
      )}
      {product.allergens.length > 0 && (
        <div className="product-card__allergens" aria-label="Alérgenos">
          {product.allergens.map((allergen) => (
            <AllergenBadge key={allergen.id} allergen={allergen} compact />
          ))}
        </div>
      )}
    </article>
  )
}

export default MenuProductCard
