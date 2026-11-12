import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  readOperatorCollection,
  saveOperatorCollection,
} from './operatorRepository.js'

function OperatorReviews() {
  const { user } = useAuth()
  const initialReviews = useMemo(
    () => readOperatorCollection(user, 'reviews'),
    [user],
  )
  const [reviews, setReviews] = useState(initialReviews)
  const [experience, setExperience] = useState('Todas las experiencias')
  const [openReviewId, setOpenReviewId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const filteredReviews = reviews.filter(
    (review) => experience === 'Todas las experiencias' || review.experience === experience,
  )
  const experienceOptions = [...new Set(reviews.map((review) => review.experience))]
  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : '—'

  function handleReply(event, reviewId) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const reply = String(formData.get('reply')).trim()
    if (!reply) return

    const updatedReviews = reviews.map((review) =>
      review.id === reviewId ? { ...review, reply } : review,
    )
    try {
      saveOperatorCollection(user, 'reviews', updatedReviews)
      setReviews(updatedReviews)
      setOpenReviewId(null)
      setNotice({
        type: 'success',
        text: 'Respuesta guardada en este navegador; se podrá sincronizar con el backend al integrarlo.',
      })
    } catch (error) {
      setNotice({
        type: 'error',
        text: `No se pudo guardar la respuesta: ${error.message}`,
      })
    }
  }

  return (
    <div className="space-y-7 lg:space-y-9">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Reseñas</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Conoce las opiniones de quienes vivieron tus experiencias.
        </p>
      </div>

      <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] md:items-center lg:p-7">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-ink">{averageRating}</span>
          <div>
            <p className="text-lg tracking-wide text-brand" aria-label="Calificación de cinco estrellas">★★★★★</p>
            <p className="mt-1 text-sm text-muted">Basado en {reviews.length} reseñas</p>
          </div>
        </div>
        <label htmlFor="review-experience" className="sr-only">
          Filtrar reseñas por experiencia
        </label>
        <select
          id="review-experience"
          value={experience}
          onChange={(event) => setExperience(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option>Todas las experiencias</option>
          {experienceOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </section>

      {notice && (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border p-4 text-sm ${
            notice.type === 'error'
              ? 'border-red-900/15 bg-red-50 text-red-900'
              : 'border-emerald-900/15 bg-emerald-50 text-emerald-900'
          }`}
        >
          {notice.text}
        </p>
      )}

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" aria-label="Opiniones de viajeros">
        {filteredReviews.map((review) => {
          const isOpen = openReviewId === review.id
          const formId = `review-reply-${review.id}`

          return (
            <article key={review.id} className="flex min-h-56 flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-ink">{review.name}</h2>
                  <p className="mt-1 text-xs text-muted">{review.experience}</p>
                </div>
                <span className="shrink-0 text-sm tracking-wide text-brand" aria-label={`${review.rating} de 5 estrellas`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              <p className="my-5 flex-1 text-sm leading-6 text-muted">{review.text}</p>
              {review.reply && !isOpen && (
                <div className="mb-4 rounded-xl border border-black/10 bg-canvas p-4">
                  <p className="text-xs font-bold text-ink">Tu respuesta</p>
                  <p className="mt-1 text-sm leading-5 text-muted">{review.reply}</p>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-black/10 pt-4">
                <span className="text-xs text-muted">{review.date}</span>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={formId}
                  onClick={() => {
                    setOpenReviewId((current) => current === review.id ? null : review.id)
                    setNotice(null)
                  }}
                  className="text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  {isOpen ? 'Cancelar' : review.reply ? 'Editar respuesta' : 'Responder'}
                </button>
              </div>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
                aria-hidden={!isOpen}
              >
                <div className="overflow-hidden">
                  <form id={formId} onSubmit={(event) => handleReply(event, review.id)} className="grid gap-3">
                    <label htmlFor={`${formId}-text`} className="text-sm font-semibold text-ink">
                      Respuesta pública
                    </label>
                    <textarea
                      id={`${formId}-text`}
                      name="reply"
                      required
                      rows="3"
                      value={replyDrafts[review.id] ?? review.reply ?? ''}
                      onChange={(event) => {
                        const reply = event.target.value
                        setReplyDrafts((drafts) => ({ ...drafts, [review.id]: reply }))
                      }}
                      tabIndex={isOpen ? 0 : -1}
                      placeholder="Escribe una respuesta amable para tu viajero…"
                      className="w-full resize-y rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                    <button
                      type="submit"
                      tabIndex={isOpen ? 0 : -1}
                      className="justify-self-end rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                    >
                      Guardar respuesta
                    </button>
                  </form>
                </div>
              </div>
            </article>
          )
        })}
        {!filteredReviews.length && (
          <p className="rounded-2xl border border-dashed border-black/20 bg-white px-5 py-12 text-center text-sm text-muted lg:col-span-2 2xl:col-span-3">
            Aún no hay reseñas para mostrar.
          </p>
        )}
      </section>
    </div>
  )
}

export default OperatorReviews
