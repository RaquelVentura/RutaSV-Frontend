import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import { completeRefund, getRefundByIdOrCode } from '../../lib/bookingApi.js'
import { extractApiError } from '../../lib/catalogApi.js'
import {
  formatCurrency,
  formatDateTimeReadable,
  refundStatusMeta,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function OperatorRefundTicket() {
  const { refundId } = useParams()
  const [refund, setRefund] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getRefundByIdOrCode(refundId)
      .then((data) => {
        if (!cancelled) {
          setRefund(data)
          setNotes(data.notes ?? '')
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se encontró el ticket de reembolso.').message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refundId])

  async function handleComplete() {
    if (!refund) return
    setSubmitting(true)
    try {
      const updated = await completeRefund(refund.id, notes)
      setRefund(updated)
      notify.success(`Ticket ${updated.refundCode} marcado como REALIZADO y visitante notificado.`)
    } catch (error) {
      notify.error(extractApiError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface" />
  }

  if (!refund) {
    return (
      <div className="space-y-4 rounded-2xl border border-mist bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Ticket de reembolso no encontrado</h1>
        <p className="text-sm text-muted">{errorMessage}</p>
        <Link
          to="/operador/reservas"
          className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white"
        >
          Volver a reservas
        </Link>
      </div>
    )
  }

  const st = refundStatusMeta[refund.status] ?? { label: refund.status, tone: 'neutral' }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/operador/reservas" className="text-sm font-semibold text-brand hover:underline">
        ← Volver a reservas
      </Link>

      <section className="space-y-5 rounded-2xl border border-mist bg-surface p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold text-brand">{refund.refundCode}</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">Ticket de reembolso</h1>
          </div>
          <Pill tone={st.tone}>{st.label}</Pill>
        </div>

        <dl className="grid gap-4 rounded-xl border border-mist bg-canvas p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Reserva asociada</dt>
            <dd className="mt-1 font-mono font-bold text-ink">{refund.reservationCode}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Experiencia</dt>
            <dd className="mt-1 font-semibold text-ink">{refund.experienceTitle}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Visitante</dt>
            <dd className="mt-1 text-ink">
              {refund.visitorName}
              {refund.visitorEmail ? ` (${refund.visitorEmail})` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Monto a reembolsar</dt>
            <dd className="mt-1 text-lg font-extrabold text-brand">
              {formatCurrency(refund.amount, refund.currency)} ({refund.percentage} %)
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Motivo</dt>
            <dd className="mt-1 text-ink">{refund.reason}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-muted">Solicitado el</dt>
            <dd className="mt-1 text-ink">{formatDateTimeReadable(refund.requestedAt)}</dd>
          </div>
          {refund.processedAt && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-muted">Procesado el</dt>
              <dd className="mt-1 font-semibold text-emerald-700">
                {formatDateTimeReadable(refund.processedAt)}
              </dd>
            </div>
          )}
        </dl>

        {refund.status !== 'REALIZADO' && (
          <div className="space-y-3 border-t border-mist pt-4">
            <label htmlFor="refund-notes" className="block text-xs font-semibold text-muted">
              Observaciones del procesamiento
            </label>
            <textarea
              id="refund-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Reembolso demo verificado y acreditado al visitante."
              className="w-full rounded-xl border border-mist bg-canvas p-3 text-sm text-ink"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={handleComplete}
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Marcar reembolso como REALIZADO'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default OperatorRefundTicket
