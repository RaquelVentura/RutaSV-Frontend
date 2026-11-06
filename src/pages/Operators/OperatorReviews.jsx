import { useState } from 'react'

const reviews = [
  {
    name: 'María López',
    experience: 'Atardecer y surf en El Tunco',
    date: '20 oct 2026',
    rating: 5,
    text: 'Una experiencia increíble. El instructor nos guio muy bien y aprendimos a surfear en un ambiente relajado. Volveríamos sin duda.',
  },
  {
    name: 'Daniel Rivera',
    experience: 'Ruta de café en Apaneca',
    date: '18 oct 2026',
    rating: 5,
    text: 'Todo estuvo muy bien organizado. Aprendimos muchísimo sobre el café y el recorrido fue precioso.',
  },
  {
    name: 'Sofía Martínez',
    experience: 'Atardecer y surf en El Tunco',
    date: '15 oct 2026',
    rating: 4,
    text: 'El equipo fue amable y la clase estuvo muy divertida. Una gran forma de conocer la costa.',
  },
]

function OperatorReviews() {
  const [experience, setExperience] = useState('Todas las experiencias')
  const filteredReviews = reviews.filter(
    (review) => experience === 'Todas las experiencias' || review.experience === experience,
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-bold leading-tight text-[#203940]">Reseñas</h1>
        <p className="mt-1 text-sm leading-5 text-muted">
          Conoce las opiniones de quienes vivieron tus experiencias.
        </p>
      </div>

      <section className="rounded-xl border border-[#e1e8e9] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-[#203940]">4.9</span>
          <div>
            <p className="text-lg tracking-wide text-[#147c91]" aria-label="Calificación de 5 estrellas">
              ★★★★★
            </p>
            <p className="text-xs text-muted">Basado en 28 reseñas</p>
          </div>
        </div>
        <label htmlFor="review-experience" className="sr-only">
          Filtrar reseñas por experiencia
        </label>
        <select
          id="review-experience"
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
          className="mt-4 w-full rounded-lg border border-[#dce4e5] bg-white px-3 py-2.5 text-sm text-[#203940] outline-none focus:border-[#147c91] focus:ring-2 focus:ring-[#147c91]/15"
        >
          <option>Todas las experiencias</option>
          <option>Atardecer y surf en El Tunco</option>
          <option>Ruta de café en Apaneca</option>
        </select>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Opiniones de viajeros">
        {filteredReviews.map((review) => (
          <article key={`${review.name}-${review.date}`} className="rounded-xl border border-[#e1e8e9] bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#203940]">{review.name}</h2>
                <p className="mt-1 text-xs text-muted">{review.experience}</p>
              </div>
              <span className="shrink-0 text-sm tracking-wide text-[#147c91]" aria-label={`${review.rating} de 5 estrellas`}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#52676d]">{review.text}</p>
            <div className="mt-3 flex items-center justify-between border-t border-[#e7eded] pt-3">
              <span className="text-xs text-muted">{review.date}</span>
              <button type="button" className="text-xs font-semibold text-[#147c91]">
                Responder
              </button>
            </div>
          </article>
        ))}
      </section>
      <p className="text-xs leading-5 text-muted md:col-span-2 xl:col-span-3">
        Reseñas de muestra. La respuesta a opiniones estará disponible al conectar el backend.
      </p>
    </div>
  )
}

export default OperatorReviews
