function AuthCard({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-extrabold text-ink">{title}</h1>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
      <div className="mt-8 rounded-2xl border border-mist bg-surface p-8 text-left">
        {children}
      </div>
    </div>
  )
}

export default AuthCard
