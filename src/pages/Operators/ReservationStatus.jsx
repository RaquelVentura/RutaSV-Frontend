function ReservationStatus({ status }) {
  const styles = {
    Confirmada: 'bg-success-soft text-success',
    Pendiente: 'bg-amber-50 text-amber-800',
    Completada: 'bg-stone-100 text-stone-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? 'bg-stone-100 text-stone-700'
      }`}
    >
      {status}
    </span>
  )
}

export default ReservationStatus
