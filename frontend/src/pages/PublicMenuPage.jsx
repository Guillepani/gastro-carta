import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import AllergenLegend from '../components/public-menu/AllergenLegend.jsx'
import ErrorState from '../components/public-menu/ErrorState.jsx'
import LoadingState from '../components/public-menu/LoadingState.jsx'
import MenuCategory from '../components/public-menu/MenuCategory.jsx'
import { ApiError } from '../services/apiClient.js'
import { getPublicMenu } from '../services/publicMenuService.js'
import '../styles/pages/public-menu.css'

function countCategoryProducts(category) {
  return (
    category.products.length +
    category.subcategories.reduce(
      (total, subcategory) => total + subcategory.products.length,
      0,
    )
  )
}

function PublicMenuPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestKey, setRequestKey] = useState(0)
  const isAdminPreview = searchParams.get('preview') === 'admin'

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    getPublicMenu(slug, { signal: controller.signal })
      .then((data) => {
        setMenu(data)
        document.title = `${data.restaurant.name} | Gastro Carta`
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError)
          setMenu(null)
          document.title = 'Carta no disponible | Gastro Carta'
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => {
      controller.abort()
      document.title = 'Gastro Carta'
    }
  }, [slug, requestKey])

  const visibleCategories = useMemo(
    () => menu?.categories.filter((category) => countCategoryProducts(category) > 0) || [],
    [menu],
  )

  if (isLoading) return <LoadingState />

  if (error) {
    const isNotFound = error instanceof ApiError && error.status === 404
    return (
      <ErrorState
        title={isNotFound ? 'Carta no encontrada' : 'No hemos podido cargar la carta'}
        message={
          isNotFound
            ? 'Comprueba la dirección o vuelve al inicio.'
            : 'Revisa tu conexión y vuelve a intentarlo.'
        }
        onRetry={isNotFound ? null : () => setRequestKey((key) => key + 1)}
      />
    )
  }

  const hasProducts = visibleCategories.length > 0

  return (
    <main className={`public-menu${isAdminPreview ? ' public-menu--preview' : ''}`}>
      {isAdminPreview && (
        <aside className="menu-preview-bar" aria-label="Vista previa de administración">
          <div className="menu-container menu-preview-bar__content">
            <p>Estás viendo la carta pública como previsualización.</p>
            <Link className="button button--secondary" to="/admin/dashboard">
              Volver al panel
            </Link>
          </div>
        </aside>
      )}

      <header className="menu-hero">
        <div className="menu-container menu-hero__content">
          <Link className="menu-hero__brand" to="/">
            Gastro Carta
          </Link>
          <p className="menu-hero__eyebrow">Nuestra carta</p>
          <h1>{menu.restaurant.name}</h1>
          {menu.restaurant.description && (
            <p className="menu-hero__description">{menu.restaurant.description}</p>
          )}
        </div>
      </header>

      {hasProducts && (
        <nav className="menu-nav" aria-label="Categorías de la carta">
          <div className="menu-container menu-nav__scroll">
            {visibleCategories.map((category) => (
              <a key={category.id} href={`#category-${category.slug}`}>
                {category.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="menu-container menu-content">
        {hasProducts ? (
          visibleCategories.map((category) => (
            <MenuCategory key={category.id} category={category} />
          ))
        ) : (
          <section className="menu-empty" aria-labelledby="empty-menu-title">
            <p className="menu-empty__icon" aria-hidden="true">
              🍽️
            </p>
            <h2 id="empty-menu-title">Estamos preparando la carta</h2>
            <p>Muy pronto encontrarás aquí todos nuestros platos.</p>
          </section>
        )}

        <AllergenLegend allergens={menu.allergens} />
      </div>
    </main>
  )
}

export default PublicMenuPage
