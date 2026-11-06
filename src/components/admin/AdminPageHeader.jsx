function AdminPageHeader({ title, subtitle, action }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          Panel del administrador · RutaSV
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export default AdminPageHeader
