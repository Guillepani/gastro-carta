import { Link } from 'react-router-dom'
import '../../styles/components/feedback-state.css'

function ErrorState({
  title,
  message,
  onRetry,
  actionLabel = 'Volver al inicio',
  actionTo = '/',
}) {
  return (
    <main className="feedback-state">
      <p className="feedback-state__icon" aria-hidden="true">
        🍴
      </p>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className="feedback-state__actions">
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        )}
        <Link to={actionTo}>{actionLabel}</Link>
      </div>
    </main>
  )
}

export default ErrorState
