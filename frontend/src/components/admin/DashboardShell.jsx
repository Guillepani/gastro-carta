import CategoryManager from './categories/CategoryManager.jsx'
import DashboardSummary from './dashboard/DashboardSummary.jsx'
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
  onUpdateCategory,
  onUpdateProduct,
  onUpdateSubcategory,
  products,
  restaurant,
  selectedCategory,
  selectedProduct,
  selectedSubcategory,
  subcategories,
}) {
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

      <div className="admin-crud">
        <CategoryManager
          categories={categories}
          error={feedback.categories.error}
          isSaving={isSaving}
          message={feedback.categories.message}
          onCreate={onCreateCategory}
          onDelete={onDeleteCategory}
          onEditCancel={onEditCategoryCancel}
          onStartEdit={onStartEditCategory}
          onSubmitEdit={onUpdateCategory}
          selectedCategory={selectedCategory}
        />

        <SubcategoryManager
          categories={categories}
          error={feedback.subcategories.error}
          isSaving={isSaving}
          message={feedback.subcategories.message}
          onCreate={onCreateSubcategory}
          onDelete={onDeleteSubcategory}
          onEditCancel={onEditSubcategoryCancel}
          onStartEdit={onStartEditSubcategory}
          onSubmitEdit={onUpdateSubcategory}
          selectedSubcategory={selectedSubcategory}
          subcategories={subcategories}
        />

        <ProductManager
          allergens={allergens}
          categories={categories}
          error={feedback.products.error}
          isSaving={isSaving}
          message={feedback.products.message}
          onCreate={onCreateProduct}
          onDelete={onDeleteProduct}
          onEditCancel={onEditProductCancel}
          onStartEdit={onStartEditProduct}
          onSubmitEdit={onUpdateProduct}
          products={products}
          selectedProduct={selectedProduct}
          subcategories={subcategories}
        />
      </div>
    </main>
  )
}

export default DashboardShell
