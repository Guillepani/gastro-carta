import { useState } from 'react'
import MenuProductCard from './MenuProductCard.jsx'
import MenuSubcategory from './MenuSubcategory.jsx'

function MenuCategory({ category }) {
  const [isOpen, setIsOpen] = useState(false)
  const visibleSubcategories = category.subcategories.filter(
    (subcategory) => subcategory.products.length > 0,
  )
  const productCount =
    category.products.length +
    visibleSubcategories.reduce(
      (total, subcategory) => total + subcategory.products.length,
      0,
    )

  return (
    <section
      className={`menu-category${isOpen ? ' menu-category--open' : ''}`}
      id={`category-${category.slug}`}
      aria-labelledby={`category-title-${category.id}`}
    >
      <button
        className="menu-category__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={`category-panel-${category.id}`}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>
          <span className="menu-category__label">Selección</span>
          <span className="menu-category__title" id={`category-title-${category.id}`}>
            {category.name}
          </span>
          <span className="menu-category__count">
            {productCount} {productCount === 1 ? 'plato' : 'platos'}
          </span>
        </span>
        <span className="menu-category__icon" aria-hidden="true">
          {isOpen ? '↑' : '↓'}
        </span>
      </button>

      <div
        className="menu-category__panel"
        id={`category-panel-${category.id}`}
        hidden={!isOpen}
      >
        {category.products.length > 0 && (
          <div className="menu-category__loose-products">
            {category.products.map((product) => (
              <MenuProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {visibleSubcategories.map((subcategory) => (
          <MenuSubcategory key={subcategory.id} subcategory={subcategory} />
        ))}
      </div>
    </section>
  )
}

export default MenuCategory
