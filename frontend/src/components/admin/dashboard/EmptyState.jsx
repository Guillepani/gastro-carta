function EmptyState({ message }) {
  return (
    <p className="admin-empty">
      <span aria-hidden="true">🍽️</span>
      {message}
    </p>
  )
}

export default EmptyState
