import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Pill from '../../components/admin/Pill.jsx'
import {
  getMyAvailabilities,
  getOperatorRefunds,
  getOperatorReservations,
} from '../../lib/bookingApi.js'
import { extractApiError, getMyExperiences } from '../../lib/catalogApi.js'
import {
  formatCurrency,
  formatDateReadable,
  reservationStatusMeta,
} from '../../lib/formatters.js'

function OperatorDashboard() {
  const [experiences, setExperiences] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [reservations, setReservations] = useState([])
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMessage('')
      try {
        const [expRes, availList, resRes, refundList] = await Promise.all([
          getMyExperiences({ pageNumber: 1, pageSize: 100 }),
          getMyAvailabilities(),
          getOperatorReservations({ pageNumber: 1, pageSize: 100 }),
          getOperatorRefunds(),
        ])
        if (cancelled) return
        setExperiences(expRes?.data ?? [])
        setAvailabilities(availList ?? [])
        setReservations(resRes?.data ?? [])
        setRefunds(refundList ?? [])
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se pudo cargar el resumen del operador.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const published = experiences.filter((e) => e.status === 'PUBLICADA').length
    const activeReservations = reservations.filter(
      (r) => r.status === 'PENDIENTE' || r.status === 'CONFIRMADA',
    ).length
    const pendingConfirm = reservations.filter((r) => r.status === 'PENDIENTE').length
    const pendingRefunds = refunds.filter((rf) => rf.status === 'EN_PROCESO').length
    const revenue = reservations
      .filter((r) => r.status === 'CONFIRMADA' || r.status === 'COMPLETADA')
      .reduce((acc, r) => acc + Number(r.total ?? 0), 0)
    const openSlots = availabilities.filter((a) => a.status === 'ABIERTA').length

    return {
      published,
      totalExperiences: experiences.length,
      activeReservations,
      pendingConfirm,
      pendingRefunds,
      revenue,
      openSlots,
    }
  }, [experiences, availabilities, reservations, refunds])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Panel de operador</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Resumen operativo</h1>
          <p className="mt-1 text-sm text-muted">
            Métricas en vivo de tus experiencias, sesiones con cupos, reservas y reembolsos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/operador/experiencias/nueva"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            + Nueva experiencia
          </Link>
          <Link
            to="/operador/cupos"
            className="rounded-full border border-mist bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand"
          >
            Gestionar cupos
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-mist bg-surface p-5">
          <p className="text-xs font-semibold uppercase text-muted">Experiencias publicadas</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">
            {loading ? '—' : stats.published}
            <span className="ml-1 text-sm font-normal text-muted">/ {stats.totalExperiences}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-mist bg-surface p-5">
          <p className="text-xs font-semibold uppercase text-muted">Reservas activas</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">
            {loading ? '—' : stats.activeReservations}
          </p>
          <p className="mt-1 text-xs text-muted">{stats.pendingConfirm} pendientes de confirmar</p>
        </div>
        <div className="rounded-2xl border border-mist bg-surface p-5">
          <p className="text-xs font-semibold uppercase text-muted">Sesiones abiertas</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">
            {loading ? '—' : stats.openSlots}
          </p>
          <p className="mt-1 text-xs text-muted">{stats.pendingRefunds} reembolsos en proceso</p>
        </div>
        <div className="rounded-2xl border border-mist bg-surface p-5">
          <p className="text-xs font-semibold uppercase text-muted">Ingresos confirmados (demo)</p>
          <p className="mt-2 text-3xl font-extrabold text-brand">
            {loading ? '—' : formatCurrency(stats.revenue)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-mist bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Reservas recientes</h2>
          <Link to="/operador/reservas" className="text-sm font-semibold text-brand hover:underline">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Cargando reservas...</p>
        ) : reservations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Todavía no has recibido reservas.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-mist text-xs uppercase text-muted">
                <tr>
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Experiencia</th>
                  <th className="py-2 pr-4">Visitante</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {reservations.slice(0, 6).map((r) => {
                  const st = reservationStatusMeta[r.status] ?? { label: r.status, tone: 'neutral' }
                  return (
                    <tr key={r.id}>
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-brand">
                        {r.reservationCode}
                      </td>
                      <td className="py-3 pr-4 font-medium text-ink">{r.experienceTitle}</td>
                      <td className="py-3 pr-4 text-muted">{r.contactName}</td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDateReadable(r.activityDate)} · {r.startTime}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-ink">
                        {formatCurrency(r.total, r.currency)}
                      </td>
                      <td className="py-3">
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default OperatorDashboard
