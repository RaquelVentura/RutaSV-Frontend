import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import Pill from '../../components/admin/Pill.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { getMyExperiences } from '../../lib/catalogApi.js'
import {
  getOperatorRequests,
  OperatorRequestStatus,
} from '../../lib/operatorRequests.js'

const activityTitles = {
  PENDIENTE: 'Solicitud de operador recibida',
  APROBADA: 'Solicitud de operador aprobada',
  RECHAZADA: 'Solicitud de operador rechazada',
  CANCELADA: 'Solicitud de operador cancelada',
}

// Todas las cifras salen de la API; mientras llegan (o si fallan) se muestran en cero.
function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState([])
  const [counts, setCounts] = useState({ pending: 0, operators: 0, experiences: 0 })
  const [activity, setActivity] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      const [pending, approved, experiences, recent] = await Promise.allSettled([
        getOperatorRequests({ pageNumber: 1, pageSize: 5, status: OperatorRequestStatus.PENDIENTE }),
        getOperatorRequests({ pageNumber: 1, pageSize: 1, status: OperatorRequestStatus.APROBADA }),
        getMyExperiences({ pageNumber: 1, pageSize: 1 }),
        getOperatorRequests({ pageNumber: 1, pageSize: 5 }),
      ])
      if (!active) return
      const value = (result) => (result.status === 'fulfilled' ? result.value : null)
      setPendingRequests(value(pending)?.data ?? [])
      setCounts({
        pending: value(pending)?.totalRecords ?? 0,
        operators: value(approved)?.totalRecords ?? 0,
        experiences: value(experiences)?.totalRecords ?? 0,
      })
      setActivity(value(recent)?.data ?? [])
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const stats = [
    { label: 'Solicitudes pendientes', value: counts.pending, note: 'Requieren tu revisión', tone: 'pending' },
    { label: 'Empresas activas', value: counts.operators, note: 'Operadores aprobados', tone: 'success' },
    { label: 'Experiencias en el catálogo', value: counts.experiences, note: 'De todos los operadores', tone: 'info' },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hola, administrador"
        subtitle="Esto es lo que necesita tu atención hoy."
        action={
          <LinkButton to="/admin/solicitudes" className="py-2 text-xs">
            Ver solicitudes
          </LinkButton>
        }
      />

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <AdminCard key={stat.label}>
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-ink">{stat.value}</p>
            <Pill tone={stat.tone} className="mt-3">
              {stat.note}
            </Pill>
          </AdminCard>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AdminCard
          title="Solicitudes de operador pendientes"
          action={
            <Link to="/admin/solicitudes" className="text-xs font-semibold text-brand">
              Ver todas →
            </Link>
          }
        >
          {pendingRequests.length === 0 ? (
            <p className="py-6 text-sm text-muted">
              No hay solicitudes de operador pendientes por el momento.
            </p>
          ) : (
            <ul className="divide-y divide-mist">
              {pendingRequests.slice(0, 3).map((request) => (
                <li key={request.id} className="flex flex-wrap items-center gap-3 py-4">
                  <Avatar name={request.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{request.name}</p>
                    <p className="text-xs text-muted">
                      {request.business}
                      {request.address ? ` · ${request.address}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted">{request.sentAt}</span>
                    <Pill tone="pending">Pendiente</Pill>
                  </div>
                  <LinkButton
                    to={`/admin/solicitudes/${request.id}`}
                    state={{ request }}
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                  >
                    Revisar
                  </LinkButton>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Actividad reciente">
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-muted">Todavía no hay actividad reciente.</p>
          ) : (
            <ul className="divide-y divide-mist">
              {activity.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="text-sm font-semibold text-ink">
                    {activityTitles[item.status] ?? 'Solicitud de operador'}
                  </p>
                  <p className="text-xs text-muted">
                    {item.name} · {item.sentAt}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  )
}

export default AdminDashboard
