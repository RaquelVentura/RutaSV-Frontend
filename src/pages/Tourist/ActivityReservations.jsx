import { useState } from 'react';
import { Link } from 'react-router-dom';
import MiActividadShell from '../../components/turista/MiActividadShell';
import { formatUsd, initialReservations } from '../../data/turista';

const filters = [
  { id: 'todas', label: 'Todas' },
  { id: 'activa', label: 'Activas' },
  { id: 'completada', label: 'Completadas' },
  { id: 'cancelada', label: 'Canceladas' },
];

const statusStyle = {
  activa: { label: 'Activa', className: 'text-[#28634D]' },
  completada: { label: 'Completada', className: 'text-[#087E9A]' },
  cancelada: { label: 'Cancelada', className: 'text-[#637780]' },
};

const secondaryButton =
  'inline-flex h-10 items-center justify-center rounded-xl border border-[#DFE8EB] bg-white px-5 text-[13px] font-semibold text-[#102F3B] hover:bg-[#F8FAFC]';
const primaryButton =
  'inline-flex h-10 items-center justify-center rounded-xl border border-[#087E9A] bg-[#087E9A] px-5 text-[13px] font-semibold text-white hover:bg-cyan-800';

export default function MiActividadReservas() {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState('todas');

  const countFor = (id) => (id === 'todas' ? reservations.length : reservations.filter((item) => item.status === id).length);
  const visible = filter === 'todas' ? reservations : reservations.filter((item) => item.status === filter);

  const cancelReservation = (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    // Sin backend todavía: el cambio solo vive en el estado local.
    setReservations((list) => list.map((item) => (item.id === id ? { ...item, status: 'cancelada' } : item)));
  };

  return (
    <MiActividadShell>
      <div role="tablist" aria-label="Filtrar reservas" className="flex gap-6 overflow-x-auto border-b border-[#DFE8EB] sm:gap-9">
        {filters.map((item) => {
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(item.id)}
              className={`-mb-px whitespace-nowrap border-b-2 py-3.5 text-[14px] ${
                selected ? 'border-[#087E9A] font-bold text-[#087E9A]' : 'border-transparent text-[#637780] hover:text-[#087E9A]'
              }`}
            >
              {item.label} ({countFor(item.id)})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-[#DFE8EB] bg-white p-6 text-[14px] text-[#637780]">
          No tienes reservas en esta categoría.
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {visible.map((reservation) => (
            <li key={reservation.id} className="flex flex-col gap-4 rounded-xl border border-[#DFE8EB] bg-white p-5">
              <img src={reservation.image} alt="" loading="lazy" className="h-[190px] w-full rounded-xl object-cover" />
              <div className="flex flex-col gap-3">
                <p className={`text-[12px] font-semibold ${statusStyle[reservation.status].className}`}>
                  {statusStyle[reservation.status].label} <span aria-hidden="true">·</span> {reservation.id}
                </p>
                <div>
                  <h2 className="text-[20px] font-bold leading-[1.6] text-[#102F3B] sm:text-[23px]">{reservation.title}</h2>
                  <p className="text-[14px] leading-[1.6] text-[#637780]">{reservation.place}</p>
                </div>
                <p className="text-[14px] text-[#102F3B]">{reservation.when}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[15px] font-bold text-[#102F3B]">{formatUsd(reservation.total)} USD · Total</p>
                  <div className="flex flex-wrap gap-2.5">
                    {reservation.status === 'activa' && (
                      <>
                        <Link to="/turista/reservar/confirmacion" className={secondaryButton}>
                          Ver detalle
                        </Link>
                        <button type="button" onClick={() => cancelReservation(reservation.id)} className={secondaryButton}>
                          Cancelar reserva
                        </button>
                      </>
                    )}
                    {reservation.status === 'completada' && (
                      <button type="button" className={primaryButton}>
                        Dejar calificación
                      </button>
                    )}
                    {reservation.status === 'cancelada' && (
                      <Link to="/turista/explorar" className={secondaryButton}>
                        Volver a explorar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </MiActividadShell>
  );
}
