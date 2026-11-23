// Panel del admin: todas las experiencias, con búsqueda y filtros (mismo patrón que RequestsQueue).
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import FilterSelect from '../../components/admin/FilterSelect.jsx'
import Pill from '../../components/admin/Pill.jsx'
import SearchInput from '../../components/admin/SearchInput.jsx'
import useAdminSearch from '../../lib/useAdminSearch.js'
import { formatCurrency } from '../Operators/operatorData.js'
import { readAllExperiences } from '../Operators/operatorRepository.js'

const statusTone = {
  Publicada: 'success',
  Borrador: 'neutral',
  Desactivada: 'pending',
  Retirada: 'danger',
}

const statusOptions = [
  { value: 'todos', label: 'Estado: todas' },
  { value: 'Publicada', label: 'Estado: Publicadas' },
  { value: 'Borrador', label: 'Estado: Borradores' },
  { value: 'Desactivada', label: 'Estado: Desactivadas' },
  { value: 'Retirada', label: 'Estado: Retiradas' },
]

function AdminExperiences() {
  const [query, setQuery] = useAdminSearch()
  const [status, setStatus] = useState('todos')
  const [operator, setOperator] = useState('todos')
  const [experiences] = useState(() => readAllExperiences())

  const operatorOptions = useMemo(
    () => [
      { value: 'todos', label: 'Operador: todos' },
      ...[...new Set(experiences.map((item) => item.ownerName))].map((name) => ({
        value: name,
        label: `Operador: ${name}`,
      })),
    ],
    [experiences],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return experiences.filter((item) => {
      if (status !== 'todos' && item.status !== status) return false
      if (operator !== 'todos' && item.ownerName !== operator) return false
      return (
        !term ||
        `${item.title} ${item.location} ${item.category} ${item.ownerName}`.toLocaleLowerCase().includes(term)
      )
    })
  }, [experiences, operator, query, status])

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Experiencias"
        subtitle="Revisa lo que publican los operadores y retira lo que incumpla las reglas."
      />

      <section className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto_auto] md:items-center">
        <SearchInput
          label="Buscar experiencias"
          placeholder="Buscar por nombre, lugar u operador"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterSelect
          label="Filtrar por estado"
          options={statusOptions}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-12 md:w-52"
        />
        <FilterSelect
          label="Filtrar por operador"
          options={operatorOptions}
          value={operator}
          onChange={(event) => setOperator(event.target.value)}
          className="min-h-12 md:w-56"
        />
      </section>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-surface px-6 py-16 text-center">
          <h2 className="text-sm font-bold text-ink">Ninguna experiencia coincide con tu búsqueda</h2>
          <p className="mt-1 text-xs text-muted">Prueba con otros filtros.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Experiencias">
          {visible.map((item) => (
            <li key={`${item.owner}-${item.id}`}>
              <Link
                to={`/admin/experiencias/${encodeURIComponent(item.owner)}/${encodeURIComponent(item.id)}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist bg-surface transition hover:border-brand hover:shadow-md"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-info-soft">
                  {item.photos?.[0] ? (
                    <img
                      src={item.photos[0]}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-cover transition group-hover:scale-[1.03] ${item.status === 'Retirada' ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center px-3 text-center text-xs font-semibold text-muted">
                      Sin foto
                    </span>
                  )}
                  <Pill tone={statusTone[item.status] ?? 'neutral'} className="absolute left-3 top-3 shadow-sm">
                    {item.status}
                  </Pill>
                </span>
                <span className="flex flex-1 flex-col gap-1 p-4">
                  <span className="text-sm font-bold leading-5 text-ink">{item.title}</span>
                  <span className="text-xs text-muted">{item.location}</span>
                  <span className="text-xs text-muted">{item.ownerName} · {item.category}</span>
                  <span className="mt-auto flex items-center justify-between pt-3 text-xs">
                    <span className="font-semibold text-ink">{formatCurrency(item.price)} / persona</span>
                    <span className="text-muted">{item.photoCount ?? 0} fotos</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminExperiences
