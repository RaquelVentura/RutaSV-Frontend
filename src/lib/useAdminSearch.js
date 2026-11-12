import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Término de búsqueda del panel de administración, guardado en la URL (?q=).
// Así el buscador del encabezado y el de cada lista comparten el mismo valor.
export default function useAdminSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const setQuery = useCallback(
    (value) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (value) {
            next.set('q', value)
          } else {
            next.delete('q')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [query, setQuery]
}
