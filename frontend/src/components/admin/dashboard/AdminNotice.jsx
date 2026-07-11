function AdminNotice({ children, tone = 'info' }) {
  if (!children) return null

  return (
    <p className={`admin-notice admin-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export default AdminNotice
