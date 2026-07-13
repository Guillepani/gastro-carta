import MenuProductCard from './MenuProductCard.jsx'

function MenuSubcategory({ subcategory }) {
  return (
    <section
      className="menu-subcategory"
      aria-labelledby={`subcategory-title-${subcategory.id}`}
    >
      <header className="menu-subcategory__header">
        <h3 id={`subcategory-title-${subcategory.id}`}>{subcategory.name}</h3>
        {subcategory.description && <p>{subcategory.description}</p>}
      </header>
      <div className="menu-product-list">
        {subcategory.products.map((product) => (
          <MenuProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default MenuSubcategory
