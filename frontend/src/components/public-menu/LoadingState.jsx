import '../../styles/components/feedback-state.css'

function LoadingState() {
  return (
    <main className="feedback-state" aria-live="polite" aria-busy="true">
      <span className="feedback-state__spinner" aria-hidden="true" />
      <p>Cargando la carta…</p>
    </main>
  )
}

export default LoadingState
