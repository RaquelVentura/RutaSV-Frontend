import { useState } from 'react'
import { experiences } from './operatorData.js'

const initialAvailability = [
  { day: 'Sábado, 1 de noviembre', experience: 'Atardecer y surf en El Tunco', available: 6 },
  { day: 'Domingo, 2 de noviembre', experience: 'Ruta de café en Apaneca', available: 8 },
  { day: 'Sábado, 8 de noviembre', experience: 'Atardecer y surf en El Tunco', available: 4 },
]

function OperatorAvailability() {
  const [selectedExperience, setSelectedExperience] = useState('Todas')
  const rows = initialAvailability.filter(
    (item) =>
      selectedExperience === 'Todas' || item.experience === selectedExperience,
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-bold leading-tight text-[#203940]">Cupos</h1>
        <p className="mt-1 text-sm leading-5 text-muted">
          Revisa y organiza los espacios disponibles en tus experiencias.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-[#e1e8e9] bg-white p-4">
        <label htmlFor="availability-experience" className="text-sm font-semibold text-[#203940]">
          Experiencia
        </label>
        <select
          id="availability-experience"
          value={selectedExperience}
          onChange={(event) => setSelectedExperience(event.target.value)}
          className="w-full rounded-lg border border-[#dce4e5] bg-white px-3 py-2.5 text-sm text-[#203940] outline-none focus:border-[#147c91] focus:ring-2 focus:ring-[#147c91]/15"
        >
          <option>Todas</option>
          {experiences.map((experience) => (
            <option key={experience.id}>{experience.title}</option>
          ))}
        </select>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7eded] pt-3">
          <div>
            <p className="text-sm font-semibold text-[#203940]">Cupos por fecha</p>
            <p className="mt-1 text-xs text-muted">Controla cuántos viajeros puedes recibir.</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#147c91] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a82]"
          >
            + Agregar fecha
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <article key={item.day} className="rounded-xl border border-[#e1e8e9] bg-white p-4">
            <p className="text-sm font-bold text-[#203940]">{item.day}</p>
            <p className="mt-1 text-xs text-muted">{item.experience}</p>
            <div className="mt-3 flex items-center justify-between border-t border-[#e7eded] pt-3">
              <span className="text-sm font-semibold text-[#147c91]">
                {item.available} espacios disponibles
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-[#147c91] hover:underline"
              >
                Editar cupos
              </button>
            </div>
          </article>
        ))}
        {!rows.length && (
          <p className="rounded-xl border border-dashed border-[#dce4e5] bg-white px-4 py-8 text-center text-sm text-muted md:col-span-2 xl:col-span-3">
            No hay fechas disponibles para esta experiencia.
          </p>
        )}
      </section>
      <p className="text-xs leading-5 text-muted md:col-span-2 xl:col-span-3">
        Disponibilidad de muestra. Los cambios se guardarán cuando se conecte el backend.
      </p>
    </div>
  )
}

export default OperatorAvailability
