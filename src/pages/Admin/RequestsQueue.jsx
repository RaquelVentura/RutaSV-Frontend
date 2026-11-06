import { useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import {
  extractBackendErrorMessage,
  getOperatorRequests,
  OperatorRequestStatus,
  StatusMeta,
} from '../../lib/operatorRequests.js'

const allStatuses = 'todos'
const defaultPageSize = 10

const statusOptions = [
  { value: OperatorRequestStatus.PENDIENTE, label: 'Estado: Pendientes' },
  { value: OperatorRequestStatus.APROBADA, label: 'Estado: Aprobadas' },
  { value: OperatorRequestStatus.RECHAZADA, label: 'Estado: Rechazadas' },
  { value: OperatorRequestStatus.CANCELADA, label: 'Estado: Canceladas' },
  { value: allStatuses, label: 'Estado: Todas' },
]

const sortOptions = [
  { value: 'recientes', label: 'Antigüedad: más recientes' },
  { value: 'antiguas', label: 'Antigüedad: más antiguas' },
]

function EmptyQueue({ filtered }) {
  return (
    <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
      <p aria-hidden="true" className="text-2xl text-success">
        ✓
      </p>
      <h2 className="mt-3 text-sm font-bold text-ink">
        {filtered ? 'Ninguna solicitud coincide con tu búsqueda' : 'No hay solicitudes pendientes'}
      </h2>
      <p className="mt-1 text-xs text-muted">
        {filtered
          ? 'Prueba con otros filtros.'
          : 'Cuando un usuario envíe una solicitud de operador, aparecerá aquí.'}
      </p>
    </div>
  )
}

function RequestsQueue() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(OperatorRequestStatus.PENDIENTE)
  const [sort, setSort] = useState('recientes')
  const [pageNumber, setPageNumber] = useState(1)
  const [pagedData, setPagedData] = useState({
    data: [],
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: defaultPageSize,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadRequests() {
      setLoading(true)
      setError('')
      try {
        const response = await getOperatorRequests({
          pageNumber,
          pageSize: defaultPageSize,
          status: status === allStatuses ? undefined : status,
        })
        if (active) {
          setPagedData(response)
        }
      } catch (err) {
        if (active) {
          setError(
            extractBackendErrorMessage(
              err,
              'No se pudieron cargar las solicitudes de operador.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [pageNumber, status])

  const term = query.trim().toLowerCase()
  const requests = pagedData.data
    .filter(
      (request) =>
        !term ||
        [
          request.name,
          request.email,
          request.business,
          request.legalName,
          request.address,
          request.message,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
    )
    .sort((a, b) => (sort === 'recientes' ? b.order - a.order : a.order - b.order))

  const filtered = term !== '' || status !== OperatorRequestStatus.PENDIENTE

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Solicitudes de operador"
        subtitle="Revisa las solicitudes de los usuarios que quieren ofrecer experiencias."
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label="Buscar solicitudes"
          placeholder="Buscar por solicitante, correo o negocio"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-64 flex-1"
        />
        <FilterSelect
          label="Estado"
          options={statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPageNumber(1)
          }}
        />
        <FilterSelect
          label="Antigüedad"
          options={sortOptions}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        />
      </div>

      {error && <Notice tone="warning">{error}</Notice>}

      {loading ? (
        <div
          role="status"
          className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center text-sm text-muted"
        >
          Cargando solicitudes de operador...
        </div>
      ) : requests.length === 0 ? (
        <EmptyQueue filtered={filtered} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-mist bg-canvas px-5 py-3 text-xs font-semibold text-muted md:grid">
              <span>Solicitante</span>
              <span>Negocio</span>
              <span>Contacto y dirección</span>
              <span>Enviada</span>
              <span>Estado</span>
              <span className="w-20" />
            </div>
            <ul className="divide-y divide-mist">
              {requests.map((request) => {
                const pill = StatusMeta[request.status] ?? StatusMeta.PENDIENTE
                return (
                  <li
                    key={request.id}
                    className="grid items-center gap-3 px-5 py-4 md:grid-cols-[1.4fr_1.4fr_1.2fr_1fr_1fr_auto] md:gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={request.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{request.name}</p>
                        <p className="truncate text-xs text-muted">{request.email}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{request.business}</p>
                      {request.legalName && (
                        <p className="truncate text-xs text-muted">{request.legalName}</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{request.phone}</p>
                      <p className="truncate text-xs text-muted">{request.address}</p>
                    </div>
                    <p className="text-sm text-ink">{request.sentAt}</p>
                    <div>
                      <Pill tone={pill.tone}>{pill.label}</Pill>
                    </div>
                    <LinkButton
                      to={`/admin/solicitudes/${request.id}`}
                      state={{ request }}
                      variant="outline"
                      className="w-20 px-3 py-1.5 text-xs"
                    >
                      Revisar
                    </LinkButton>
                  </li>
                )
              })}
            </ul>
          </div>
          <Pagination
            currentPage={pagedData.currentPage}
            totalPages={pagedData.totalPages}
            onPageChange={setPageNumber}
            summary={`Mostrando ${requests.length} de ${pagedData.totalRecords} solicitudes`}
          />
        </>
      )}
    </div>
  )
}

export default RequestsQueue
