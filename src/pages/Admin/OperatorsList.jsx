import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import { extractBackendErrorMessage, getOperatorRequests, OperatorRequestStatus } from '../../lib/operatorRequests.js'
import useAdminSearch from '../../lib/useAdminSearch.js'

const actionClass =
  'rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
const neutralAction = `${actionClass} border-brand text-brand hover:bg-info-soft`

// Los operadores son los negocios con solicitud aprobada.
function OperatorsList() {
  const location = useLocation()
  const [query, setQuery] = useAdminSearch()
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getOperatorRequests({ pageNumber: 1, pageSize: 100, status: OperatorRequestStatus.APROBADA })
      .then((response) => {
        if (!cancelled) setOperators(response.data)
      })
      .catch((error) => {
        if (!cancelled) setErrorMessage(extractBackendErrorMessage(error, 'No se pudo cargar la lista de operadores.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const term = query.trim().toLowerCase()
  const visible = useMemo(
    () =>
      operators.filter(
        (operator) =>
          !term ||
          operator.tradeName.toLowerCase().includes(term) ||
          operator.contactEmail.toLowerCase().includes(term),
      ),
    [operators, term],
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operadores"
        subtitle="Consulta a los negocios que publican experiencias."
      />

      {location.state?.notice && <Notice tone="success">{location.state.notice}</Notice>}
      {errorMessage && <Notice tone="error">{errorMessage}</Notice>}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label="Buscar operadores"
          placeholder="Buscar por negocio o correo"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-64 flex-1"
        />
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
          <h2 className="text-sm font-bold text-ink">
            {operators.length === 0 ? 'Aún no hay operadores aprobados' : 'Ningún operador coincide con tu búsqueda'}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {operators.length === 0
              ? 'Cuando apruebes una solicitud de operador, su negocio aparecerá aquí.'
              : 'Prueba con otros filtros.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface">
            <div className="hidden grid-cols-[2fr_1fr_1fr_2fr] gap-4 border-b border-mist bg-canvas px-5 py-3 text-xs font-semibold text-muted md:grid">
              <span>Operador</span>
              <span>Estado</span>
              <span>Aprobado</span>
              <span>Acciones</span>
            </div>
            <ul className="divide-y divide-mist">
              {visible.map((operator) => (
                <li
                  key={operator.id}
                  className="grid items-center gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr_2fr] md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={operator.tradeName} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{operator.tradeName}</p>
                      <p className="truncate text-xs text-muted">{operator.contactEmail}</p>
                    </div>
                  </div>
                  <div>
                    <Pill tone="success">Activo</Pill>
                  </div>
                  <p className="text-sm text-ink">{operator.reviewedAt ? new Date(operator.reviewedAt).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : operator.sentShort}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/empresas/${operator.companyId}`}
                      aria-label={`Ver perfil de ${operator.tradeName}`}
                      className={neutralAction}
                    >
                      Ver perfil
                    </Link>
                    <Link
                      to={`/admin/experiencias?q=${encodeURIComponent(operator.tradeName)}`}
                      aria-label={`Ver experiencias de ${operator.tradeName}`}
                      className={neutralAction}
                    >
                      Ver experiencias
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Pagination
            summary={`Mostrando ${visible.length} de ${operators.length} operadores`}
            pages={[1]}
          />
        </>
      )}
    </div>
  )
}

export default OperatorsList
