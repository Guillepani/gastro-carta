import { useEffect, useMemo, useState } from 'react'
import AdminNotice from '../dashboard/AdminNotice.jsx'
import EmptyState from '../dashboard/EmptyState.jsx'

const INITIAL_FORM = {
  allergenIds: [],
  categoryId: '',
  description: '',
  isAvailable: true,
  name: '',
  price: '',
  sortOrder: '0',
  subcategoryId: '',
}

const priceFormatter = new Intl.NumberFormat('es-ES', {
  currency: 'EUR',
  style: 'currency',
})

function productToForm(product) {
  return {
    allergenIds: product.allergens.map((allergen) => allergen.id),
    categoryId: product.categoryId,
    description: product.description || '',
    isAvailable: product.isAvailable,
    name: product.name,
    price: String(product.price),
    sortOrder: String(product.sortOrder ?? 0),
    subcategoryId: product.subcategoryId || '',
  }
}

function createPayload(formData) {
  return {
    allergenIds: formData.allergenIds,
    categoryId: formData.categoryId,
    description: formData.description.trim() || null,
    isAvailable: formData.isAvailable,
    name: formData.name.trim(),
    price: Number(formData.price),
    sortOrder: Number(formData.sortOrder || 0),
    subcategoryId: formData.subcategoryId || null,
  }
}

function ProductForm({
  allergens,
  categories,
  formData,
  idPrefix,
  isSaving,
  onCancel,
  onChange,
  onSubmit,
  subcategories,
  submitLabel,
}) {
  const availableSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === formData.categoryId,
  )

  function handleTextChange(event) {
    const { name, value } = event.target
    onChange({ ...formData, [name]: value })
  }

  function handleCheckboxChange(event) {
    const { checked, name } = event.target
    onChange({ ...formData, [name]: checked })
  }

  function handleAllergenChange(event) {
    const { checked, value } = event.target
    const allergenIds = checked
      ? [...formData.allergenIds, value]
      : formData.allergenIds.filter((id) => id !== value)
    onChange({ ...formData, allergenIds })
  }

  function handleCategoryChange(event) {
    const categoryId = event.target.value
    const subcategoryBelongsToCategory = subcategories.some(
      (subcategory) =>
        subcategory.id === formData.subcategoryId &&
        subcategory.categoryId === categoryId,
    )

    onChange({
      ...formData,
      categoryId,
      subcategoryId: subcategoryBelongsToCategory ? formData.subcategoryId : '',
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(createPayload(formData))
  }

  return (
    <form className="admin-form product-form" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <div className="form-field">
          <label htmlFor={`${idPrefix}-name`}>Nombre</label>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            value={formData.name}
            onChange={handleTextChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-price`}>Precio</label>
          <input
            id={`${idPrefix}-price`}
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleTextChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-category`}>Categoría</label>
          <select
            id={`${idPrefix}-category`}
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Selecciona categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-subcategory`}>Subcategoría opcional</label>
          <select
            id={`${idPrefix}-subcategory`}
            name="subcategoryId"
            value={formData.subcategoryId}
            onChange={handleTextChange}
          >
            <option value="">Sin subcategoría</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={`${idPrefix}-sort`}>Posición</label>
          <input
            id={`${idPrefix}-sort`}
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            value={formData.sortOrder}
            onChange={handleTextChange}
          />
        </div>
        <label className="check-field" htmlFor={`${idPrefix}-available`}>
          <input
            id={`${idPrefix}-available`}
            name="isAvailable"
            type="checkbox"
            checked={formData.isAvailable}
            onChange={handleCheckboxChange}
          />
          Disponible en la carta
        </label>
      </div>

      <div className="form-field">
        <label htmlFor={`${idPrefix}-description`}>Descripción</label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleTextChange}
        />
      </div>

      <fieldset className="allergen-fieldset">
        <legend>Alérgenos</legend>
        <div className="allergen-options">
          {allergens.map((allergen) => (
            <label className="check-field" key={allergen.id}>
              <input
                type="checkbox"
                value={allergen.id}
                checked={formData.allergenIds.includes(allergen.id)}
                onChange={handleAllergenChange}
              />
              <span aria-hidden="true">{allergen.emoji}</span>
              {allergen.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="admin-actions">
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {submitLabel}
        </button>
        {onCancel && (
          <button className="button button--ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function ProductManager({
  allergens,
  categories,
  error,
  isSaving,
  message,
  onCreate,
  onDelete,
  onEditCancel,
  onStartEdit,
  onSubmitEdit,
  products,
  selectedProduct,
  subcategories,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editData, setEditData] = useState(INITIAL_FORM)
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )
  const subcategoryNames = useMemo(
    () =>
      new Map(
        subcategories.map((subcategory) => [subcategory.id, subcategory.name]),
      ),
    [subcategories],
  )

  useEffect(() => {
    if (!formData.categoryId && categories.length > 0) {
      setFormData((current) => ({ ...current, categoryId: categories[0].id }))
    }
  }, [categories, formData.categoryId])

  useEffect(() => {
    if (selectedProduct) setEditData(productToForm(selectedProduct))
  }, [selectedProduct])

  async function handleCreate(payload) {
    const wasCreated = await onCreate(payload)
    if (wasCreated) {
      setFormData({
        ...INITIAL_FORM,
        categoryId: categories[0]?.id || '',
      })
    }
  }

  async function handleEdit(payload) {
    await onSubmitEdit(selectedProduct.id, payload)
  }

  return (
    <section className="admin-section" id="admin-products">
      <div className="admin-section__heading">
        <div>
          <p className="dashboard-card__label">Platos y bebidas</p>
          <h2>Productos</h2>
        </div>
        <span>{products.length} total</span>
      </div>

      <AdminNotice tone="error">{error}</AdminNotice>
      <AdminNotice>{message}</AdminNotice>

      {categories.length === 0 ? (
        <EmptyState message="Crea una categoría antes de añadir productos." />
      ) : (
        <ProductForm
          allergens={allergens}
          categories={categories}
          formData={formData}
          idPrefix="product-new"
          isSaving={isSaving}
          onChange={setFormData}
          onSubmit={handleCreate}
          subcategories={subcategories}
          submitLabel="Crear producto"
        />
      )}

      {products.length === 0 ? (
        <EmptyState message="Todavía no hay productos." />
      ) : (
        <div className="admin-list product-list">
          {products.map((product) => {
            const isEditing = selectedProduct?.id === product.id

            return (
              <article className="admin-list-item product-item" key={product.id}>
                {isEditing ? (
                  <ProductForm
                    allergens={allergens}
                    categories={categories}
                    formData={editData}
                    idPrefix={`product-edit-${product.id}`}
                    isSaving={isSaving}
                    onCancel={onEditCancel}
                    onChange={setEditData}
                    onSubmit={handleEdit}
                    subcategories={subcategories}
                    submitLabel="Guardar producto"
                  />
                ) : (
                  <>
                    <div className="admin-list-item__body">
                      <div className="product-item__heading">
                        <h3>{product.name}</h3>
                        <strong>{priceFormatter.format(product.price)}</strong>
                      </div>
                      {product.description && <p>{product.description}</p>}
                      <p>
                        {categoryNames.get(product.categoryId) || 'Categoría no disponible'}
                        {product.subcategoryId &&
                          ` · ${subcategoryNames.get(product.subcategoryId) || 'Subcategoría no disponible'}`}
                      </p>
                      <div className="product-item__meta">
                        <span className={product.isAvailable ? 'pill pill--success' : 'pill'}>
                          {product.isAvailable ? 'Disponible' : 'No disponible'}
                        </span>
                        {product.allergens.map((allergen) => (
                          <span className="pill" key={allergen.id}>
                            <span aria-hidden="true">{allergen.emoji}</span> {allergen.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="admin-actions">
                      <button className="button button--ghost" type="button" onClick={() => onStartEdit(product)}>
                        Editar
                      </button>
                      <button className="button button--danger" type="button" onClick={() => onDelete(product)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ProductManager
