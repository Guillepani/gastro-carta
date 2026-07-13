function AdminNotice({ children, tone = 'info' }) {
  if (!children) return null

  return (
    <p className={`admin-notice admin-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{tone === 'error' ? '⚠️' : '✓'}</span>
      {children}
    </p>
  )
}

export default AdminNotice
