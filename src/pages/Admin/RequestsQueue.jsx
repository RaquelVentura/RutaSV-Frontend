import { useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { operatorRequests } from '../../data/admin.js'

const ALL = 'todos'

const serviceOptions = [
  { value: ALL, label: 'Tipo de servicio: todos' },
  ...[...new Set(operatorRequests.map((request) => request.service))].map((service) => ({
    value: service,
    label: service,
  })),
]

const zoneOptions = [
  { value: ALL, label: 'Zona: todas' },
  ...[...new Set(operatorRequests.map((request) => request.zone))].map((zone) => ({
    value: zone,
    label: zone,
  })),
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
  const [service, setService] = useState(ALL)
  const [zone, setZone] = useState(ALL)
  const [sort, setSort] = useState('recientes')

  const term = query.trim().toLowerCase()
  const requests = operatorRequests
    .filter((request) => service === ALL || request.service === service)
    .filter((request) => zone === ALL || request.zone === zone)
    .filter(
      (request) =>
        !term ||
        [request.name, request.email, request.business].some((value) =>
          value.toLowerCase().includes(term),
        ),
    )
    .sort((a, b) => (sort === 'recientes' ? b.order - a.order : a.order - b.order))

  const filtered = term !== '' || service !== ALL || zone !== ALL

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
        <span className="rounded-xl border border-brand bg-info-soft px-4 py-2.5 text-sm font-semibold text-brand">
          Estado: Pendientes ({requests.length})
        </span>
        <FilterSelect label="Antigüedad" options={sortOptions} value={sort} onChange={(event) => setSort(event.target.value)} />
        <FilterSelect label="Tipo de servicio" options={serviceOptions} value={service} onChange={(event) => setService(event.target.value)} />
        <FilterSelect label="Zona" options={zoneOptions} value={zone} onChange={(event) => setZone(event.target.value)} />
      </div>

      {requests.length === 0 ? (
        <EmptyQueue filtered={filtered} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-mist bg-canvas px-5 py-3 text-xs font-semibold text-muted md:grid">
              <span>Solicitante</span>
              <span>Negocio</span>
              <span>Tipo y zona</span>
              <span>Enviada</span>
              <span>Estado</span>
              <span className="w-20" />
            </div>
            <ul className="divide-y divide-mist">
              {requests.map((request) => (
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
                  <p className="text-sm text-ink">{request.business}</p>
                  <div>
                    <p className="text-sm font-semibold text-ink">{request.service}</p>
                    <p className="text-xs text-muted">{request.zone}</p>
                  </div>
                  <p className="text-sm text-ink">{request.sentAt}</p>
                  <div>
                    <Pill tone="pending">Pendiente</Pill>
                  </div>
                  <LinkButton
                    to={`/admin/solicitudes/${request.id}`}
                    variant="outline"
                    className="w-20 px-3 py-1.5 text-xs"
                  >
                    Revisar
                  </LinkButton>
                </li>
              ))}
            </ul>
          </div>
          <Pagination
            summary={`Mostrando 1–${requests.length} de ${requests.length} solicitudes pendientes`}
          />
        </>
      )}
    </div>
  )
}

export default RequestsQueue
