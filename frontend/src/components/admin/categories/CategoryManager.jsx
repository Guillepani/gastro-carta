import { useEffect, useState } from 'react'
import AdminNotice from '../dashboard/AdminNotice.jsx'
import EmptyState from '../dashboard/EmptyState.jsx'

const INITIAL_FORM = {
  name: '',
  sortOrder: '0',
}

function createPayload(formData) {
  return {
    name: formData.name.trim(),
    sortOrder: Number(formData.sortOrder || 0),
  }
}

function CategoryManager({
  categories,
  error,
  isSaving,
  message,
  onCreate,
  onDelete,
  onEditCancel,
  onStartEdit,
  onSubmitEdit,
  selectedCategory,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [editData, setEditData] = useState(INITIAL_FORM)

  useEffect(() => {
    if (selectedCategory) {
      setEditData({
        name: selectedCategory.name,
        sortOrder: String(selectedCategory.sortOrder ?? 0),
      })
    }
  }, [selectedCategory])

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
    if (wasCreated) setFormData(INITIAL_FORM)
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    await onSubmitEdit(selectedCategory.id, createPayload(editData))
  }

  return (
    <section className="admin-section" id="admin-categories">
      <div className="admin-section__heading">
        <div>
          <p className="dashboard-card__label">Carta</p>
          <h2>Categorías</h2>
          <p>Define los grandes bloques de la carta y el orden en el que aparecen.</p>
        </div>
        <span>{categories.length} total</span>
      </div>

      <AdminNotice tone="error">{error}</AdminNotice>
      <AdminNotice>{message}</AdminNotice>

      <form className="admin-form admin-form--inline" onSubmit={handleCreate}>
        <h3 className="admin-form__title">Añadir categoría</h3>
        <div className="form-field">
          <label htmlFor="category-name">Nueva categoría</label>
          <input
            id="category-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Entrantes, postres, bebidas..."
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="category-sort-order">Posición</label>
          <input
            id="category-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            value={formData.sortOrder}
            onChange={handleChange}
          />
        </div>
        <button className="button button--primary admin-form__submit" type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Crear categoría'}
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState message="Todavía no hay categorías." />
      ) : (
        <div className="admin-list">
          {categories.map((category) => {
            const isEditing = selectedCategory?.id === category.id

            return (
              <article className="admin-list-item" key={category.id}>
                {isEditing ? (
                  <form className="admin-form admin-form--row" onSubmit={handleEditSubmit}>
                    <div className="form-field">
                      <label htmlFor={`category-edit-name-${category.id}`}>Nombre</label>
                      <input
                        id={`category-edit-name-${category.id}`}
                        name="name"
                        type="text"
                        value={editData.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor={`category-edit-sort-${category.id}`}>Posición</label>
                      <input
                        id={`category-edit-sort-${category.id}`}
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
                      <h3>{category.name}</h3>
                      <p>
                        <span className="admin-meta-label">Posición</span>{' '}
                        {category.sortOrder ?? 0}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button className="button button--ghost" type="button" onClick={() => onStartEdit(category)}>
                        Editar
                      </button>
                      <button className="button button--danger" type="button" onClick={() => onDelete(category)}>
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

export default CategoryManager
