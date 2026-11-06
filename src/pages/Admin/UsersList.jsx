import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { users } from '../../data/admin.js'

const ALL = 'todos'

const roleOptions = [
  { value: ALL, label: 'Rol: todos' },
  { value: 'VISITANTE', label: 'Visitante' },
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'ADMIN', label: 'Admin' },
]

const statusOptions = [
  { value: ALL, label: 'Estado: todos' },
  { value: 'Activo', label: 'Activo' },
  { value: 'Suspendido', label: 'Suspendido' },
  { value: 'Sin verificar', label: 'Sin verificar' },
]

const roleTones = { VISITANTE: 'neutral', OPERADOR: 'success', ADMIN: 'info' }
const statusTones = { Activo: 'success', Suspendido: 'danger', 'Sin verificar': 'pending' }

const actionClass =
  'rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
const neutralAction = `${actionClass} border-brand text-brand hover:bg-info-soft`
const dangerAction = `${actionClass} border-danger text-danger hover:bg-danger-soft`

function getActions(user) {
  if (user.role === 'ADMIN') return [{ label: 'Editar' }, { label: 'Restablecer contraseña' }]
  if (user.status === 'Sin verificar') {
    return [
      { label: 'Editar' },
      { label: 'Reenviar correo' },
      { label: 'Suspender', danger: true },
    ]
  }
  const last =
    user.status === 'Suspendido' ? { label: 'Reactivar' } : { label: 'Suspender', danger: true }
  return [{ label: 'Editar' }, { label: 'Cambiar rol' }, last]
}

function UsersList() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  const term = query.trim().toLowerCase()
  const visible = users
    .filter((user) => role === ALL || user.role === role)
    .filter((user) => status === ALL || user.status === status)
    .filter(
      (user) =>
        !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuarios"
        subtitle="Busca, crea y administra las cuentas de la plataforma."
        action={
          <LinkButton to="/admin/usuarios/nuevo" className="py-2 text-xs">
            + Crear usuario
          </LinkButton>
        }
      />

      {location.state?.notice && <Notice tone="success">{location.state.notice}</Notice>}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label="Buscar usuarios"
          placeholder="Buscar por nombre o correo"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-64 flex-1"
        />
        <FilterSelect label="Rol" options={roleOptions} value={role} onChange={(event) => setRole(event.target.value)} />
        <FilterSelect label="Estado" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
        <FilterSelect label="Registro" options={['Registro: más recientes']} />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
          <h2 className="text-sm font-bold text-ink">Ningún usuario coincide con tu búsqueda</h2>
          <p className="mt-1 text-xs text-muted">Prueba con otros filtros.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface">
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_2fr] gap-4 border-b border-mist bg-canvas px-5 py-3 text-xs font-semibold text-muted md:grid">
              <span>Usuario</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Registro</span>
              <span>Acciones</span>
            </div>
            <ul className="divide-y divide-mist">
              {visible.map((user) => (
                <li
                  key={user.id}
                  className="grid items-center gap-3 px-5 py-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_2fr] md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div>
                    <Pill tone={roleTones[user.role]}>{user.role}</Pill>
                  </div>
                  <div>
                    <Pill tone={statusTones[user.status]}>{user.status}</Pill>
                  </div>
                  <p className="text-sm text-ink">{user.registeredAt}</p>
                  <div className="flex flex-wrap gap-2">
                    {getActions(user).map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        aria-label={`${action.label} a ${user.name}`}
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
            summary={`Mostrando 1–${visible.length} de 48 usuarios`}
            pages={[1, 2, 3]}
          />
        </>
      )}
    </div>
  )
}

export default UsersList
