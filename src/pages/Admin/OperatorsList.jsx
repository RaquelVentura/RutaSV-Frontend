import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import { operators } from '../../data/operators.js'
import useAdminSearch from '../../lib/useAdminSearch.js'

const ALL = 'todos'

const statusOptions = [
  { value: ALL, label: 'Estado: todos' },
  { value: 'Activo', label: 'Activo' },
  { value: 'En revisión', label: 'En revisión' },
  { value: 'Suspendido', label: 'Suspendido' },
]

const statusTones = { Activo: 'success', 'En revisión': 'pending', Suspendido: 'danger' }

const actionClass =
  'rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
const neutralAction = `${actionClass} border-brand text-brand hover:bg-info-soft`
const dangerAction = `${actionClass} border-danger text-danger hover:bg-danger-soft`

function getActions(operator) {
  if (operator.status === 'En revisión') return [{ label: 'Ver solicitud' }]
  const last =
    operator.status === 'Suspendido' ? { label: 'Reactivar' } : { label: 'Suspender', danger: true }
  return [{ label: 'Ver perfil' }, { label: 'Ver experiencias' }, last]
}

function OperatorsList() {
  const location = useLocation()
  const [query, setQuery] = useAdminSearch()
  const [status, setStatus] = useState(ALL)

  const term = query.trim().toLowerCase()
  const visible = operators
    .filter((operator) => status === ALL || operator.status === status)
    .filter(
      (operator) =>
        !term ||
        operator.name.toLowerCase().includes(term) ||
        operator.email.toLowerCase().includes(term),
    )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operadores"
        subtitle="Consulta y administra a los negocios que publican experiencias."
      />

      {location.state?.notice && <Notice tone="success">{location.state.notice}</Notice>}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label="Buscar operadores"
          placeholder="Buscar por negocio o correo"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-64 flex-1"
        />
        <FilterSelect
          label="Estado"
          options={statusOptions}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        />
        <FilterSelect label="Registro" options={['Registro: más recientes']} />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
          <h2 className="text-sm font-bold text-ink">Ningún operador coincide con tu búsqueda</h2>
          <p className="mt-1 text-xs text-muted">Prueba con otros filtros.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface">
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_2fr] gap-4 border-b border-mist bg-canvas px-5 py-3 text-xs font-semibold text-muted md:grid">
              <span>Operador</span>
              <span>Estado</span>
              <span>Experiencias</span>
              <span>Registro</span>
              <span>Acciones</span>
            </div>
            <ul className="divide-y divide-mist">
              {visible.map((operator) => (
                <li
                  key={operator.id}
                  className="grid items-center gap-3 px-5 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_2fr] md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={operator.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{operator.name}</p>
                      <p className="truncate text-xs text-muted">{operator.email}</p>
                    </div>
                  </div>
                  <div>
                    <Pill tone={statusTones[operator.status]}>{operator.status}</Pill>
                  </div>
                  <p className="text-sm text-ink">
                    {operator.experiences}{' '}
                    {operator.experiences === 1 ? 'experiencia' : 'experiencias'}
                  </p>
                  <p className="text-sm text-ink">{operator.registeredAt}</p>
                  <div className="flex flex-wrap gap-2">
                    {getActions(operator).map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        aria-label={`${action.label} de ${operator.name}`}
                        className={action.danger ? dangerAction : neutralAction}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Pagination
            summary={`Mostrando 1–${visible.length} de ${operators.length} operadores`}
            pages={[1]}
          />
        </>
      )}
    </div>
  )
}

export default OperatorsList
