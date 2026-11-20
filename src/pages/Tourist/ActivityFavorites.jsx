import { useState } from 'react';
import { Link } from 'react-router-dom';
import MiActividadShell from '../../components/turista/MiActividadShell';
import ExperienceCard from '../../components/turista/ExperienceCard';
import { experiences } from '../../data/turista';

const sorters = {
  recientes: { label: 'Guardadas recientemente', compare: () => 0 },
  precio: { label: 'Precio: menor a mayor', compare: (a, b) => a.price - b.price },
  valoracion: { label: 'Mejor valoradas', compare: (a, b) => b.rating - a.rating },
};

export default function MiActividadFavoritos() {
  const [favorites, setFavorites] = useState(experiences);
  const [order, setOrder] = useState('recientes');

  const sorted = [...favorites].sort(sorters[order].compare);
  const removeFavorite = (id) => setFavorites((list) => list.filter((item) => item.id !== id));

  return (
    <MiActividadShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] font-bold text-[#102F3B]">
          {favorites.length} {favorites.length === 1 ? 'experiencia guardada' : 'experiencias guardadas'}
        </p>
        <label className="flex items-center">
          <span className="sr-only">Ordenar favoritos</span>
          <select
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            className="w-full rounded-[10px] border border-[#DFE8EB] bg-white px-4 py-2.5 text-[13px] font-medium text-[#102F3B] sm:w-auto"
          >
            {Object.entries(sorters).map(([id, sorter]) => (
              <option key={id} value={id}>
                {sorter.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-[#DFE8EB] bg-white p-6">
          <p className="text-[14px] text-[#637780]">Aún no tienes experiencias guardadas.</p>
          <Link to="/turista/explorar" className="text-[14px] font-semibold text-[#087E9A] hover:underline">
            Explorar experiencias →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {sorted.map((experience) => (
            <li key={experience.id}>
              <ExperienceCard experience={experience} onRemoveFavorite={removeFavorite} />
            </li>
          ))}
        </ul>
      )}
    </MiActividadShell>
  );
}
