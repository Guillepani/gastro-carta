import { useEffect, useMemo, useState } from 'react'
import CategoryManager from './categories/CategoryManager.jsx'
import DashboardSummary from './dashboard/DashboardSummary.jsx'
import MenuThemeSelector from './dashboard/MenuThemeSelector.jsx'
import ProductManager from './products/ProductManager.jsx'
import SubcategoryManager from './subcategories/SubcategoryManager.jsx'

function DashboardShell({
  admin,
  allergens,
  categories,
  feedback,
  isSaving,
  onCreateCategory,
  onCreateProduct,
  onCreateSubcategory,
  onDeleteCategory,
  onDeleteProduct,
  onDeleteSubcategory,
  onEditCategoryCancel,
  onEditProductCancel,
  onEditSubcategoryCancel,
  onLogout,
  onStartEditCategory,
  onStartEditProduct,
  onStartEditSubcategory,
  onUpdateMenuTheme,
  onUpdateCategory,
  onUpdateProduct,
  onUpdateSubcategory,
  products,
  restaurant,
  restaurantFeedback,
  selectedCategory,
  selectedProduct,
  selectedSubcategory,
  subcategories,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState('')

  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategoryId('')
      return
    }

    const activeCategoryExists = categories.some(
      (category) => category.id === activeCategoryId,
    )

    if (!activeCategoryExists) setActiveCategoryId(categories[0].id)
  }, [activeCategoryId, categories])

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) || null,
    [activeCategoryId, categories],
  )
  const activeSubcategories = useMemo(
    () =>
      subcategories.filter(
        (subcategory) => subcategory.categoryId === activeCategoryId,
      ),
    [activeCategoryId, subcategories],
  )
  const activeProducts = useMemo(
    () => products.filter((product) => product.categoryId === activeCategoryId),
    [activeCategoryId, products],
  )
  const productsWithoutSubcategory = useMemo(
    () => activeProducts.filter((product) => !product.subcategoryId),
    [activeProducts],
  )

  return (
    <main className="dashboard-page">
      <DashboardSummary
        admin={admin}
        categories={categories}
        onLogout={onLogout}
        products={products}
        restaurant={restaurant}
        subcategories={subcategories}
      />

      <MenuThemeSelector
        error={restaurantFeedback?.error}
        isSaving={isSaving}
        message={restaurantFeedback?.message}
        onSelectTheme={onUpdateMenuTheme}
        selectedTheme={restaurant?.menuTheme || 'classic'}
      />

      <div className="admin-workspace">
        <aside className="admin-sidebar" aria-label="Categorías de la carta">
          <CategoryManager
            activeCategoryId={activeCategoryId}
            categories={categories}
            error={feedback.categories.error}
            isSaving={isSaving}
            message={feedback.categories.message}
            onCreate={onCreateCategory}
            onDelete={onDeleteCategory}
            onEditCancel={onEditCategoryCancel}
            onSelectCategory={setActiveCategoryId}
            onStartEdit={onStartEditCategory}
            onSubmitEdit={onUpdateCategory}
            selectedCategory={selectedCategory}
          />
        </aside>

        <section className="admin-board" aria-label="Gestión de carta">
          <header className="admin-board__header">
            <div>
              <p className="dashboard-card__label">Categoría activa</p>
              <h2>{activeCategory?.name || 'Prepara tu primera categoría'}</h2>
              <p>
                {activeCategory
                  ? 'Gestiona subcategorías y productos de esta parte de la carta.'
                  : 'Crea una categoría para empezar a organizar tu carta.'}
              </p>
            </div>
            {activeCategory && (
              <span>
                {activeSubcategories.length} subcategorías · {activeProducts.length}{' '}
                productos
              </span>
            )}
          </header>

          <div className="admin-crud">
            <SubcategoryManager
              activeCategory={activeCategory}
              categories={activeCategory ? [activeCategory] : []}
              error={feedback.subcategories.error}
              isSaving={isSaving}
              message={feedback.subcategories.message}
              onCreate={onCreateSubcategory}
              onDelete={onDeleteSubcategory}
              onEditCancel={onEditSubcategoryCancel}
              onStartEdit={onStartEditSubcategory}
              onSubmitEdit={onUpdateSubcategory}
              selectedSubcategory={selectedSubcategory}
              subcategories={activeSubcategories}
            />

            <ProductManager
              activeCategory={activeCategory}
              allergens={allergens}
              categories={activeCategory ? [activeCategory] : []}
              error={feedback.products.error}
              isSaving={isSaving}
              message={feedback.products.message}
              onCreate={onCreateProduct}
              onDelete={onDeleteProduct}
              onEditCancel={onEditProductCancel}
              onStartEdit={onStartEditProduct}
              onSubmitEdit={onUpdateProduct}
              products={activeProducts}
              productsWithoutSubcategory={productsWithoutSubcategory}
              selectedProduct={selectedProduct}
              subcategories={activeSubcategories}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardShell
