import MenuProductCard from './MenuProductCard.jsx'

function MenuSubcategory({ subcategory }) {
  return (
    <section
      className="menu-subcategory"
      aria-labelledby={`subcategory-title-${subcategory.id}`}
    >
      <h3 id={`subcategory-title-${subcategory.id}`}>{subcategory.name}</h3>
      <div className="product-grid">
        {subcategory.products.map((product) => (
          <MenuProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default MenuSubcategory
