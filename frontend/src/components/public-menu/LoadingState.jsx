import '../../styles/components/feedback-state.css'

function LoadingState({ message = 'Cargando la carta…' }) {
  return (
    <main className="feedback-state" aria-live="polite" aria-busy="true">
      <span className="feedback-state__spinner" aria-hidden="true" />
      <p>{message}</p>
    </main>
  )
}

export default LoadingState
