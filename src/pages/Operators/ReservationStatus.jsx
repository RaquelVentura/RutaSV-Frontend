//funcion para mostrar el estado de la reserva, recibe un estado y devuelve un span con el estilo correspondiente.

function ReservationStatus({ status }) {
  const styles = {
    Confirmada: 'bg-success-soft text-success',
    Pendiente: 'bg-amber-50 text-amber-800',
    Completada: 'bg-stone-100 text-stone-700',
    Cancelada: 'bg-danger-soft text-danger',
    'Pendiente de decisión': 'bg-amber-100 text-pending',
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
