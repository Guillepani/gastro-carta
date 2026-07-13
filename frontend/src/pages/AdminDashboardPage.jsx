import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/admin/DashboardShell.jsx'
import ErrorState from '../components/public-menu/ErrorState.jsx'
import LoadingState from '../components/public-menu/LoadingState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../services/apiClient.js'
import {
  createAdminCategory,
  createAdminProduct,
  createAdminSubcategory,
  deleteAdminCategory,
  deleteAdminProduct,
  deleteAdminSubcategory,
  listAdminAllergens,
  listAdminCategories,
  listAdminProducts,
  listAdminSubcategories,
  updateAdminCategory,
  updateAdminProduct,
  updateAdminSubcategory,
} from '../services/adminService.js'
import '../styles/pages/admin-dashboard.css'
import '../styles/components/admin-crud.css'

const EMPTY_FEEDBACK = {
  categories: { error: '', message: '' },
  products: { error: '', message: '' },
  subcategories: { error: '', message: '' },
}

function sortByOrderAndName(items) {
  return [...items].sort(
    (first, second) =>
      (first.sortOrder ?? 0) - (second.sortOrder ?? 0) ||
      first.name.localeCompare(second.name, 'es'),
  )
}

function getRequestErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return `${error.message}. Revisa primero los elementos relacionados.`
    }
    if (error.status === 400) {
      return `${error.message}. Comprueba los campos del formulario.`
    }
    if (error.status === 401) return 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
    return error.message
  }

  return 'No se pudo completar la operación.'
}

function AdminDashboardPage() {
  const { admin, restaurant, logout, refreshSession } = useAuth()
  const [allergens, setAllergens] = useState([])
  const [categories, setCategories] = useState([])
  const [feedback, setFeedback] = useState(EMPTY_FEEDBACK)
  const [error, setError] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()

    refreshSession({ signal: controller.signal })
      .then(() => setError(null))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          if (requestError instanceof ApiError && requestError.status === 401) {
            logout()
            navigate('/admin', { replace: true })
            return
          }

          setError(requestError)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [logout, navigate, refreshSession])

  useEffect(() => {
    if (!restaurant?.id) {
      setIsDataLoading(false)
      return undefined
    }

    const controller = new AbortController()

    async function loadDashboardData() {
      setIsDataLoading(true)
      setError(null)

      try {
        const [categoriesData, subcategoriesData, productsData, allergensData] =
          await Promise.all([
            listAdminCategories(restaurant.id, { signal: controller.signal }),
            listAdminSubcategories(restaurant.id, { signal: controller.signal }),
            listAdminProducts(restaurant.id, { signal: controller.signal }),
            listAdminAllergens({ signal: controller.signal }),
          ])

        setCategories(sortByOrderAndName(categoriesData))
        setSubcategories(sortByOrderAndName(subcategoriesData))
        setProducts(sortByOrderAndName(productsData))
        setAllergens(allergensData)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          if (requestError instanceof ApiError && requestError.status === 401) {
            logout()
            navigate('/admin', { replace: true })
            return
          }

          setError(requestError)
        }
      } finally {
        if (!controller.signal.aborted) setIsDataLoading(false)
      }
    }

    loadDashboardData()

    return () => controller.abort()
  }, [logout, navigate, restaurant?.id])

  function handleLogout() {
    logout()
    navigate('/admin', { replace: true })
  }

  function setSectionFeedback(section, nextFeedback) {
    setFeedback((current) => ({
      ...current,
      [section]: { error: '', message: '', ...nextFeedback },
    }))
  }

  async function runMutation(section, action) {
    setIsSaving(true)
    setSectionFeedback(section, { error: '', message: '' })

    try {
      await action()
      return true
    } catch (requestError) {
      setSectionFeedback(section, { error: getRequestErrorMessage(requestError) })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateCategory(payload) {
    return runMutation('categories', async () => {
      const category = await createAdminCategory(restaurant.id, payload)
      setCategories((current) => sortByOrderAndName([...current, category]))
      setSectionFeedback('categories', { message: 'Categoría creada correctamente.' })
    })
  }

  async function handleUpdateCategory(categoryId, payload) {
    return runMutation('categories', async () => {
      const category = await updateAdminCategory(categoryId, payload)
      setCategories((current) =>
        sortByOrderAndName(
          current.map((item) => (item.id === category.id ? category : item)),
        ),
      )
      setSelectedCategory(null)
      setSectionFeedback('categories', { message: 'Categoría actualizada.' })
    })
  }

  async function handleDeleteCategory(category) {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${category.name}"?\n\nSolo se borrará si no tiene subcategorías ni productos asociados.`,
      )
    ) {
      return
    }

    await runMutation('categories', async () => {
      await deleteAdminCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      setSectionFeedback('categories', { message: 'Categoría eliminada.' })
    })
  }

  async function handleCreateSubcategory(payload) {
    return runMutation('subcategories', async () => {
      const subcategory = await createAdminSubcategory(restaurant.id, payload)
      setSubcategories((current) => sortByOrderAndName([...current, subcategory]))
      setSectionFeedback('subcategories', {
        message: 'Subcategoría creada correctamente.',
      })
    })
  }

  async function handleUpdateSubcategory(subcategoryId, payload) {
    return runMutation('subcategories', async () => {
      const subcategory = await updateAdminSubcategory(subcategoryId, payload)
      setSubcategories((current) =>
        sortByOrderAndName(
          current.map((item) =>
            item.id === subcategory.id ? subcategory : item,
          ),
        ),
      )
      setSelectedSubcategory(null)
      setSectionFeedback('subcategories', { message: 'Subcategoría actualizada.' })
    })
  }

  async function handleDeleteSubcategory(subcategory) {
    if (
      !window.confirm(
        `¿Eliminar la subcategoría "${subcategory.name}"?\n\nSolo se borrará si no tiene productos asociados.`,
      )
    ) {
      return
    }

    await runMutation('subcategories', async () => {
      await deleteAdminSubcategory(subcategory.id)
      setSubcategories((current) =>
        current.filter((item) => item.id !== subcategory.id),
      )
      setSectionFeedback('subcategories', { message: 'Subcategoría eliminada.' })
    })
  }

  async function handleCreateProduct(payload) {
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setSectionFeedback('products', {
        error: 'El precio debe ser un número no negativo.',
      })
      return false
    }

    return runMutation('products', async () => {
      const product = await createAdminProduct(restaurant.id, payload)
      setProducts((current) => sortByOrderAndName([...current, product]))
      setSectionFeedback('products', { message: 'Producto creado correctamente.' })
    })
  }

  async function handleUpdateProduct(productId, payload) {
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setSectionFeedback('products', {
        error: 'El precio debe ser un número no negativo.',
      })
      return false
    }

    return runMutation('products', async () => {
      const product = await updateAdminProduct(productId, payload)
      setProducts((current) =>
        sortByOrderAndName(
          current.map((item) => (item.id === product.id ? product : item)),
        ),
      )
      setSelectedProduct(null)
      setSectionFeedback('products', { message: 'Producto actualizado.' })
    })
  }

  async function handleDeleteProduct(product) {
    if (
      !window.confirm(
        `¿Eliminar el producto "${product.name}"?\n\nEsta acción lo quitará de la carta.`,
      )
    ) {
      return
    }

    await runMutation('products', async () => {
      await deleteAdminProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setSectionFeedback('products', { message: 'Producto eliminado.' })
    })
  }

  if (isLoading || isDataLoading) return <LoadingState message="Cargando panel..." />

  if (error) {
    return (
      <ErrorState
        title="No hemos podido cargar el panel"
        message={getRequestErrorMessage(error)}
        actionLabel="Volver al login"
        actionTo="/admin"
      />
    )
  }

  return (
    <DashboardShell
      admin={admin}
      allergens={allergens}
      categories={categories}
      feedback={feedback}
      isSaving={isSaving}
      onCreateCategory={handleCreateCategory}
      onCreateProduct={handleCreateProduct}
      onCreateSubcategory={handleCreateSubcategory}
      onDeleteCategory={handleDeleteCategory}
      onDeleteProduct={handleDeleteProduct}
      onDeleteSubcategory={handleDeleteSubcategory}
      onEditCategoryCancel={() => setSelectedCategory(null)}
      onEditProductCancel={() => setSelectedProduct(null)}
      onEditSubcategoryCancel={() => setSelectedSubcategory(null)}
      restaurant={restaurant}
      onLogout={handleLogout}
      onStartEditCategory={setSelectedCategory}
      onStartEditProduct={setSelectedProduct}
      onStartEditSubcategory={setSelectedSubcategory}
      onUpdateCategory={handleUpdateCategory}
      onUpdateProduct={handleUpdateProduct}
      onUpdateSubcategory={handleUpdateSubcategory}
      products={products}
      selectedCategory={selectedCategory}
      selectedProduct={selectedProduct}
      selectedSubcategory={selectedSubcategory}
      subcategories={subcategories}
    />
  )
}

export default AdminDashboardPage
