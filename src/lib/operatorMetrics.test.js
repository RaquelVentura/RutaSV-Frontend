import { describe, expect, it } from 'vitest'
import {
  cancellationShare,
  dayRangeLabel,
  lastDays,
  monthlyCumulative,
  occupancy,
  reservationsByDay,
  revenueByDay,
} from './operatorMetrics.js'

const today = new Date(2026, 10, 22) // domingo 22 de noviembre de 2026

const experiences = [
  { id: 1, price: 45 },
  { id: 2, price: 30 },
]

const reservations = [
  { id: 'a', isoDate: '2026-11-22', experienceId: 1, guests: 2, status: 'Confirmada' },
  { id: 'b', isoDate: '2026-11-22', experienceId: 2, guests: 3, status: 'Completada' },
  { id: 'c', isoDate: '2026-11-21', experienceId: 1, guests: 4, status: 'Cancelada' },
  { id: 'd', isoDate: '2026-11-20', experienceId: 1, guests: 1, status: 'Pendiente' },
  { id: 'e', isoDate: '2026-09-10', experienceId: 2, guests: 2, status: 'Completada' },
]

describe('Métricas del operador', () => {
  it('arma los últimos 7 días terminando hoy', () => {
    const days = lastDays(7, today)
    expect(days.map((day) => day.iso)[0]).toBe('2026-11-16')
    expect(days[6]).toMatchObject({ iso: '2026-11-22', label: 'Dom' })
    expect(dayRangeLabel(days)).toBe('16–22 nov')
  })

  it('cuenta las reservas por día sin las canceladas', () => {
    const counts = reservationsByDay(reservations, lastDays(7, today))
    expect(counts.map((item) => item.value)).toEqual([0, 0, 0, 0, 1, 0, 2])
  })

  it('suma los ingresos por día solo de reservas confirmadas o realizadas', () => {
    const revenue = revenueByDay(reservations, experiences, lastDays(7, today))
    // 22 nov: 45 × 2 + 30 × 3; la pendiente del 20 no cuenta y la cancelada tampoco.
    expect(revenue.map((item) => item.value)).toEqual([0, 0, 0, 0, 0, 0, 180])
  })

  it('acumula las reservas por mes', () => {
    const series = monthlyCumulative(reservations, 3, today)
    expect(series.map((item) => item.label)).toEqual(['sep', 'oct', 'nov'])
    expect(series.map((item) => item.value)).toEqual([1, 1, 4])
  })

  it('calcula el porcentaje de cancelaciones', () => {
    expect(cancellationShare(reservations)).toEqual({ total: 5, canceled: 1, kept: 4, percent: 20 })
    expect(cancellationShare([]).percent).toBe(0)
  })

  it('calcula la ocupación a partir de los cupos', () => {
    const result = occupancy([
      { capacity: 8, available: 6 },
      { capacity: 8, available: 8 },
    ])
    expect(result).toEqual({ total: 16, assigned: 2, free: 14, percent: 13 })
    expect(occupancy([]).percent).toBe(0)
  })
})
