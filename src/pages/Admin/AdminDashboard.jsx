import { Link } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Avatar from '../../components/admin/Avatar.jsx'
import Pill from '../../components/admin/Pill.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { adminActivity, adminStats, operatorRequests } from '../../data/admin.js'

const tabs = [
  { label: 'Resumen', to: '/admin' },
  { label: 'Solicitudes', to: '/admin/solicitudes' },
  { label: 'Usuarios', to: '/admin/usuarios' },
  { label: 'Empresas' },
  { label: 'Experiencias' },
]

const tabClass = 'rounded-full border border-mist bg-surface px-4 py-1.5 text-xs font-semibold text-ink'

function AdminDashboard() {
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

      <nav aria-label="Secciones del panel" className="flex flex-wrap gap-2">
        {tabs.map((tab) =>
          tab.to ? (
            <Link
              key={tab.label}
              to={tab.to}
              aria-current={tab.to === '/admin' ? 'page' : undefined}
              className={
                tab.to === '/admin'
                  ? 'rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white'
                  : tabClass
              }
            >
              {tab.label}
            </Link>
          ) : (
            <button key={tab.label} type="button" className={tabClass}>
              {tab.label}
            </button>
          ),
        )}
      </nav>

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
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
          <ul className="divide-y divide-mist">
            {operatorRequests.slice(0, 3).map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-3 py-4">
                <Avatar name={request.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{request.name}</p>
                  <p className="text-xs text-muted">
                    {request.business} · {request.service}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted">{request.sentAt}</span>
                  <Pill tone="pending">Pendiente</Pill>
                </div>
                <LinkButton
                  to={`/admin/solicitudes/${request.id}`}
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                >
                  Revisar
                </LinkButton>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Actividad reciente">
          <ul className="divide-y divide-mist">
            {adminActivity.map((item) => (
              <li key={item.title} className="py-3">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  )
}

export default AdminDashboard
