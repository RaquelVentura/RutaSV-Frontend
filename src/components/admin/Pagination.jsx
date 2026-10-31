const pageClass = 'rounded-lg border border-mist px-3 py-1.5 text-xs text-muted'

function Pagination({
  summary,
  pages,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const safeTotalPages = Math.max(1, totalPages)
  const pageList =
    pages ?? Array.from({ length: safeTotalPages }, (_, index) => index + 1)

  function handleSelectPage(page) {
    if (!onPageChange || page < 1 || page > safeTotalPages || page === currentPage) {
      return
    }
    onPageChange(page)
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <p>{summary}</p>
      <nav aria-label="Paginación" className="flex items-center gap-2">
        <button
          type="button"
          disabled={!onPageChange || currentPage <= 1}
          onClick={() => handleSelectPage(currentPage - 1)}
          className={`${pageClass} disabled:opacity-60`}
        >
          ‹ Anterior
        </button>
        {pageList.map((page) => {
          const isCurrent = page === currentPage
          return (
            <button
              key={page}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => handleSelectPage(page)}
              className={
                isCurrent
                  ? 'rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white'
                  : pageClass
              }
            >
              {page}
            </button>
          )
        })}
        <button
          type="button"
          disabled={!onPageChange || currentPage >= safeTotalPages}
          onClick={() => handleSelectPage(currentPage + 1)}
          className={`${pageClass} disabled:opacity-60`}
        >
          Siguiente ›
        </button>
      </nav>
    </div>
  )
}

export default Pagination
