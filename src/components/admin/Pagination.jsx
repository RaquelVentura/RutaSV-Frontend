const pageClass = 'rounded-lg border border-mist px-3 py-1.5 text-xs text-muted'

function Pagination({ summary, pages = [1] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <p>{summary}</p>
      <nav aria-label="Paginación" className="flex items-center gap-2">
        <button type="button" disabled className={`${pageClass} opacity-60`}>
          ‹ Anterior
        </button>
        {pages.map((page, index) => (
          <button
            key={page}
            type="button"
            aria-current={index === 0 ? 'page' : undefined}
            className={
              index === 0
                ? 'rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white'
                : pageClass
            }
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          disabled={pages.length < 2}
          className={`${pageClass} disabled:opacity-60`}
        >
          Siguiente ›
        </button>
      </nav>
    </div>
  )
}

export default Pagination
