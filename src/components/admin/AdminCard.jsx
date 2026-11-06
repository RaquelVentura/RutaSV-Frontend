function AdminCard({ title, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-mist bg-surface p-5 ${className}`.trim()}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default AdminCard
