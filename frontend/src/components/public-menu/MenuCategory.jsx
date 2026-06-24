import MenuProductCard from './MenuProductCard.jsx'
import MenuSubcategory from './MenuSubcategory.jsx'

function MenuCategory({ category }) {
  return (
    <section
      className="menu-category"
      id={`category-${category.slug}`}
      aria-labelledby={`category-title-${category.id}`}
    >
      <header className="menu-category__header">
        <p>Selección</p>
        <h2 id={`category-title-${category.id}`}>{category.name}</h2>
      </header>

      {category.products.length > 0 && (
        <div className="product-grid">
          {category.products.map((product) => (
            <MenuProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {category.subcategories
        .filter((subcategory) => subcategory.products.length > 0)
        .map((subcategory) => (
          <MenuSubcategory key={subcategory.id} subcategory={subcategory} />
        ))}
    </section>
  )
}

export default MenuCategory
