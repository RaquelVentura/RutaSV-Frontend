// Ticket de reembolso de una reserva cancelada por el operador.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatDateTime } from './operatorData.js'
import { readOperatorCollection, saveOperatorCollection } from './operatorRepository.js'

function OperatorRefundTicket() {
  const { refundId } = useParams()
  const { user } = useAuth()
  const [refunds, setRefunds] = useState(() => readOperatorCollection(user, 'refunds'))
  const [error, setError] = useState('')
  const refund = refunds.find((item) => item.id === refundId)

  function markDone() {
    const updated = refunds.map((item) =>
      item.id === refundId ? { ...item, status: 'Realizado', completedAt: new Date().toISOString() } : item,
    )
    try {
      saveOperatorCollection(user, 'refunds', updated)
      setRefunds(updated)
      setError('')
    } catch (failure) {
      setError(`No se pudo guardar el cambio: ${failure.message}`)
    }
  }

  if (!refund) {
    return (
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-2xl font-bold text-ink">No encontramos ese ticket</h1>
        <Link to="/operador/reservas" className="font-semibold text-brand hover:underline">
          Volver al historial de reservas
        </Link>
      </div>
    )
  }

  const done = refund.status === 'Realizado'

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link to="/operador/reservas" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Volver al historial de reservas
      </Link>
      <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ticket de reembolso</p>
            <h1 className="mt-1 text-2xl font-extrabold text-ink">{refund.id}</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              done ? 'bg-success-soft text-success' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {refund.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Reserva</dt>
            <dd className="font-semibold text-ink">{refund.reservationId}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Viajero</dt>
            <dd className="font-semibold text-ink">{refund.guest}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Experiencia</dt>
            <dd className="font-semibold text-ink">{refund.experience}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Total de la reserva</dt>
            <dd className="font-semibold text-ink">{formatCurrency(refund.total)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Reembolso ({refund.percent} %)</dt>
            <dd className="text-lg font-extrabold text-brand">{formatCurrency(refund.amount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Generado</dt>
            <dd className="text-ink">{formatDateTime(refund.createdAt)}</dd>
          </div>
          {done && (
            <div>
              <dt className="text-xs text-muted">Realizado</dt>
              <dd className="text-ink">{formatDateTime(refund.completedAt)}</dd>
            </div>
          )}
        </dl>

        {error && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{error}</p>}
        {done ? (
          <p role="status" className="mt-6 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
            El reembolso ya fue marcado como realizado.
          </p>
        ) : (
          <button
            type="button"
            onClick={markDone}
            className="mt-6 min-h-12 w-full rounded-xl bg-brand px-6 text-sm font-bold text-white hover:bg-brand-dark sm:w-auto"
          >
            Marcar como realizado
          </button>
        )}
        <p className="mt-4 text-xs text-muted">El pago es simulado: este ticket solo registra el estado del reembolso.</p>
      </article>
    </div>
  )
}

export default OperatorRefundTicket
