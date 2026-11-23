import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BookingPanel from '../../components/experience/BookingPanel.jsx'
import MeetingMap from '../../components/experience/MeetingMap.jsx'
import PhotoGallery from '../../components/experience/PhotoGallery.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getExperienceBySlug } from '../../data/experienceDetails.js'
import { formatLongDate } from '../../lib/availability.js'
import NotFound from '../NotFound.jsx'

const outlineButton =
  'rounded-xl border border-mist bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

function buildReference(date) {
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `RSV-${yy}${mm}${dd}-${suffix}`
}

// Detalle de una experiencia (HU-11): galería, información de la experiencia
// y panel de reserva con calendario de disponibilidad.
function ExperienceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
  const experience = getExperienceBySlug(slug)

  if (!experience) return <NotFound />

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareNotice('Enlace copiado')
    } catch {
      setShareNotice('No se pudo copiar el enlace')
    }
  }

  function handleReserve({ date, time, people }) {
    // La reserva exige una cuenta: sin sesión, la persona pasa primero por el login.
    if (!user) {
      navigate('/login')
      return
    }

    const cancelLimit = new Date(date)
    cancelLimit.setDate(cancelLimit.getDate() - 2)
    navigate('/turista/reservar', {
      state: {
        booking: {
          experience: {
            id: experience.slug,
            title: experience.title,
            location: experience.location,
            rating: experience.rating,
            reviews: experience.reviewCount,
            price: experience.price,
            operator: experience.operator.name,
            image: experience.photos[0],
          },
          date: formatLongDate(date),
          time,
          people,
          reference: buildReference(date),
          freeCancelUntil: `${cancelLimit.getDate()} ${cancelLimit.toLocaleDateString('es-SV', { month: 'short' }).replace('.', '')} ${cancelLimit.getFullYear()}`,
          operatorPhone: '+503 7890 1234',
          contactName: user.fullName ?? '',
          contactEmail: user.email ?? '',
        },
      },
    })
  }

  return (
    <div className="w-full px-6 pt-6">
      <nav aria-label="Ruta de navegación" className="text-xs text-muted">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>
        {' / '}
        {experience.category}
        {' / '}
        {experience.region}
        {' / '}
        {experience.city}
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-muted">
            {experience.category} · {experience.badge}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-ink">{experience.title}</h1>
          <p className="mt-2 text-sm text-muted">
            ★ {experience.rating.toFixed(1)} · {experience.reviewCount} reseñas · {experience.location} · {experience.guide}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shareNotice && (
            <span role="status" className="text-xs text-muted">
              {shareNotice}
            </span>
          )}
          <button type="button" onClick={() => setSaved((value) => !value)} aria-pressed={saved} className={outlineButton}>
            {saved ? '♥ Guardada' : '♡ Guardar'}
          </button>
          <button type="button" onClick={handleShare} className={outlineButton}>
            Compartir
          </button>
        </div>
      </header>

      <div className="mt-6">
        <PhotoGallery photos={experience.photos} title={experience.title} totalPhotos={experience.totalPhotos} />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-8">
          <section className="flex flex-wrap items-center justify-between gap-3 border-b border-mist pb-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-xl text-success"
              >
                ≋
              </span>
              <div>
                <p className="text-lg font-bold text-ink">
                  Tu anfitrión:{' '}
                  {experience.operator.slug ? (
                    <Link to={`/empresas/${experience.operator.slug}`} className="hover:text-brand hover:underline">
                      {experience.operator.name}
                    </Link>
                  ) : (
                    experience.operator.name
                  )}
                </p>
                <p className="text-sm text-muted">
                  Guías locales desde {experience.operator.since} · {experience.operator.languages}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">Operador local</span>
          </section>

          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold text-ink">
            <li>{experience.duration}</li>
            <li>Hasta {experience.capacity} personas</li>
            <li>{experience.level}</li>
          </ul>

          <section>
            <h2 className="text-2xl font-bold text-ink">{experience.headline}</h2>
            <div className="mt-3 space-y-4 text-muted">
              {experience.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="border-t border-mist pt-8">
            <h2 className="text-2xl font-bold text-ink">Qué incluye</h2>
            <ul className="mt-4 grid gap-3 text-sm text-ink sm:grid-cols-2">
              {experience.includes.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">{experience.notIncluded}</p>
          </section>

          <section className="border-t border-mist pt-8">
            <h2 className="text-2xl font-bold text-ink">Dónde nos encontramos</h2>
            <p className="mt-2 text-sm text-muted">{experience.meetingPoint}</p>
            <div className="mt-4">
              <MeetingMap label={experience.mapLabel} />
            </div>
          </section>

          <section className="border-t border-mist pt-8">
            <h2 className="text-2xl font-bold text-ink">Antes de reservar</h2>
            <p className="mt-2 text-sm text-muted">{experience.beforeBooking}</p>
            <figure className="mt-5 rounded-2xl border border-mist bg-surface p-6">
              <p className="text-lg font-bold text-ink">
                ★ {experience.rating.toFixed(1)} · {experience.reviewCount} reseñas
              </p>
              <blockquote className="mt-3 text-ink">“{experience.review.text}”</blockquote>
              <figcaption className="mt-3 text-xs text-muted">
                {experience.review.author} · {experience.review.date}
              </figcaption>
            </figure>
          </section>
        </div>

        <BookingPanel experience={experience} onReserve={handleReserve} />
      </div>
    </div>
  )
}

export default ExperienceDetail
