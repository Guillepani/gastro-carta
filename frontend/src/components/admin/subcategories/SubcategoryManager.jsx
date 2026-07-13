import { useEffect, useMemo, useState } from 'react'
import AdminNotice from '../dashboard/AdminNotice.jsx'
import EmptyState from '../dashboard/EmptyState.jsx'

const INITIAL_FORM = {
  categoryId: '',
  name: '',
  sortOrder: '0',
}

function createPayload(formData) {
  return {
    categoryId: formData.categoryId,
    name: formData.name.trim(),
    sortOrder: Number(formData.sortOrder || 0),
  }
}

function SubcategoryManager({
  categories,
  error,
  isSaving,
  message,
  onCreate,
  onDelete,
  onEditCancel,
  onStartEdit,
  onSubmitEdit,
  selectedSubcategory,
  subcategories,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editData, setEditData] = useState(INITIAL_FORM)
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )

  useEffect(() => {
    if (!formData.categoryId && categories.length > 0) {
      setFormData((current) => ({ ...current, categoryId: categories[0].id }))
    }
  }, [categories, formData.categoryId])

  useEffect(() => {
    if (selectedSubcategory) {
      setEditData({
        categoryId: selectedSubcategory.categoryId,
        name: selectedSubcategory.name,
        sortOrder: String(selectedSubcategory.sortOrder ?? 0),
      })
    }
  }, [selectedSubcategory])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditData((current) => ({ ...current, [name]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    const wasCreated = await onCreate(createPayload(formData))
    if (wasCreated) {
      setFormData({
        ...INITIAL_FORM,
        categoryId: categories[0]?.id || '',
      })
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    await onSubmitEdit(selectedSubcategory.id, createPayload(editData))
  }

  return (
    <section className="admin-section" id="admin-subcategories">
      <div className="admin-section__heading">
        <div>
          <p className="dashboard-card__label">Organización</p>
          <h2>Subcategorías</h2>
          <p>Agrupa productos dentro de una categoría para que la carta sea fácil de explorar.</p>
        </div>
        <span>{subcategories.length} total</span>
      </div>

      <AdminNotice tone="error">{error}</AdminNotice>
      <AdminNotice>{message}</AdminNotice>

      {categories.length === 0 ? (
        <EmptyState message="Crea una categoría antes de añadir subcategorías." />
      ) : (
        <form className="admin-form admin-form--inline" onSubmit={handleCreate}>
          <h3 className="admin-form__title">Añadir subcategoría</h3>
          <div className="form-field">
            <label htmlFor="subcategory-category">Categoría</label>
            <select
              id="subcategory-category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="subcategory-name">Nueva subcategoría</label>
            <input
              id="subcategory-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Bocadillos, tartas, refrescos..."
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="subcategory-sort-order">Posición</label>
            <input
              id="subcategory-sort-order"
              name="sortOrder"
              type="number"
              min="0"
              step="1"
              value={formData.sortOrder}
              onChange={handleChange}
            />
          </div>
          <button className="button button--primary admin-form__submit" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Crear subcategoría'}
          </button>
        </form>
      )}

      {subcategories.length === 0 ? (
        <EmptyState message="Todavía no hay subcategorías." />
      ) : (
        <div className="admin-list">
          {subcategories.map((subcategory) => {
            const isEditing = selectedSubcategory?.id === subcategory.id

            return (
              <article className="admin-list-item" key={subcategory.id}>
                {isEditing ? (
                  <form className="admin-form admin-form--row" onSubmit={handleEditSubmit}>
                    <div className="form-field">
                      <label htmlFor={`subcategory-edit-category-${subcategory.id}`}>
                        Categoría
                      </label>
                      <select
                        id={`subcategory-edit-category-${subcategory.id}`}
                        name="categoryId"
                        value={editData.categoryId}
                        onChange={handleEditChange}
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor={`subcategory-edit-name-${subcategory.id}`}>Nombre</label>
                      <input
                        id={`subcategory-edit-name-${subcategory.id}`}
                        name="name"
                        type="text"
                        value={editData.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor={`subcategory-edit-sort-${subcategory.id}`}>Posición</label>
                      <input
                        id={`subcategory-edit-sort-${subcategory.id}`}
                        name="sortOrder"
                        type="number"
                        min="0"
                        step="1"
                        value={editData.sortOrder}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="admin-actions">
                      <button className="button button--primary" type="submit" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button className="button button--ghost" type="button" onClick={onEditCancel}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-list-item__body">
                      <h3>{subcategory.name}</h3>
                      <p>
                        <span className="admin-meta-label">Categoría</span>{' '}
                        {categoryNames.get(subcategory.categoryId) || 'Categoría no disponible'}
                      </p>
                      <p>
                        <span className="admin-meta-label">Posición</span>{' '}
                        {subcategory.sortOrder ?? 0}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button className="button button--ghost" type="button" onClick={() => onStartEdit(subcategory)}>
                        Editar
                      </button>
                      <button className="button button--danger" type="button" onClick={() => onDelete(subcategory)}>
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

export default SubcategoryManager
