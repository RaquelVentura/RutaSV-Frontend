import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ExperienceCard from '../../components/ExperienceCard.jsx'
import MeetingMap from '../../components/experience/MeetingMap.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCompanyBySlug } from '../../data/companies.js'
import { experienceDetails } from '../../data/experienceDetails.js'
import NotFound from '../NotFound.jsx'

const outlineButton =
  'rounded-xl border border-mist bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'
const primaryButton =
  'rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'
const cardClass = 'rounded-2xl border border-mist bg-surface p-6'

// Perfil público de una empresa: lo que ve el visitante antes de reservar.
function CompanyProfile() {
  const { slug } = useParams()
  const { hash } = useLocation()
  const { user } = useAuth()
  const [shareNotice, setShareNotice] = useState('')
  const company = getCompanyBySlug(slug)

  // Al llegar con #experiencias (por ejemplo desde el panel del admin) baja a esa sección.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.()
  }, [hash, slug])

  if (!company) return <NotFound />

  const experiences = experienceDetails.filter((experience) => experience.operator.slug === company.slug)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareNotice('Enlace copiado')
    } catch {
      setShareNotice('No se pudo copiar el enlace')
    }
  }

  return (
    <div className="w-full px-6 pt-6">
      <nav aria-label="Ruta de navegación" className="text-xs text-muted">
        <Link to="/" className="hover:underline">
          Inicio
        </Link>
        {' / Operadores / '}
        {company.name}
      </nav>

      <header className="mt-4 overflow-hidden rounded-2xl border border-mist bg-surface">
        <img src={company.cover} alt={`Portada de ${company.name}`} className="h-56 w-full object-cover sm:h-64" />
        <div className="flex flex-wrap items-center gap-6 p-6 sm:px-8">
          <span
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-mist bg-info-soft text-4xl text-brand"
          >
            ≋
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-ink">{company.name}</h1>
              <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                Operador verificado
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {company.location} · Guías locales desde {company.since} · {company.languages}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              ★ {company.rating.toFixed(1)} · {company.reviewCount} reseñas · {experiences.length}{' '}
              {experiences.length === 1 ? 'experiencia publicada' : 'experiencias publicadas'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {shareNotice && (
              <span role="status" className="text-xs text-muted">
                {shareNotice}
              </span>
            )}
            <button type="button" onClick={handleShare} className={outlineButton}>
              Compartir
            </button>
            <a href="#experiencias" className={primaryButton}>
              Ver experiencias
            </a>
          </div>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className={cardClass} aria-labelledby="empresa-sobre">
            <h2 id="empresa-sobre" className="text-2xl font-bold text-ink">
              Sobre {company.name}
            </h2>
            <p className="mt-3 text-muted">{company.about}</p>
            <h3 className="mt-5 text-sm font-semibold text-ink">Qué ofrecemos</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {company.offers.map((offer) => (
                <li key={offer} className="rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-brand">
                  {offer}
                </li>
              ))}
            </ul>
            <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              {company.facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-sm font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={cardClass} aria-labelledby="empresa-galeria">
            <h2 id="empresa-galeria" className="text-2xl font-bold text-ink">
              Galería
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {company.gallery.map((photo, index) => (
                <li key={`${photo}-${index}`}>
                  <img
                    src={photo}
                    alt={`${company.name}: foto ${index + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className={cardClass} aria-labelledby="empresa-ubicacion">
            <h2 id="empresa-ubicacion" className="text-xl font-bold text-ink">
              Dónde encontrarnos
            </h2>
            <div className="mt-4">
              <MeetingMap label={company.mapLabel} />
            </div>
            <p className="mt-3 text-sm text-muted">{company.address}</p>
          </section>

          <section className={cardClass} aria-labelledby="empresa-contacto">
            <h2 id="empresa-contacto" className="text-xl font-bold text-ink">
              Horario de atención
            </h2>
            <p className="mt-2 text-sm text-muted">{company.hours}</p>
            {user ? (
              <a href={`mailto:${company.contactEmail}`} className={`${outlineButton} mt-4 block text-center`}>
                Escribir a la empresa
              </a>
            ) : (
              <>
                <Link to="/login" className={`${outlineButton} mt-4 block text-center`}>
                  Escribir a la empresa
                </Link>
                <p className="mt-2 text-xs text-muted">Inicia sesión para enviar un mensaje.</p>
              </>
            )}
          </section>
        </div>
      </div>

      <section id="experiencias" className="mt-10 scroll-mt-6" aria-labelledby="empresa-experiencias">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="empresa-experiencias" className="text-2xl font-extrabold text-ink">
            Experiencias de {company.name}
          </h2>
          <p className="text-sm text-muted">
            {experiences.length} {experiences.length === 1 ? 'experiencia disponible' : 'experiencias disponibles'}
          </p>
        </div>
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <li key={experience.slug}>
              <ExperienceCard
                slug={experience.slug}
                image={experience.photos[0]}
                location={experience.location}
                rating={experience.rating}
                title={experience.title}
                details={`${experience.guide} · Grupo pequeño · ${experience.duration}`}
                price={experience.price}
                spots={experience.capacity}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 pb-4" aria-labelledby="empresa-resenas">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="empresa-resenas" className="text-2xl font-extrabold text-ink">
            Lo que dicen los viajeros
          </h2>
          <p className="text-sm font-semibold text-ink">
            ★ {company.rating.toFixed(1)} · {company.reviewCount} reseñas
          </p>
        </div>
        <ul className="mt-4 grid gap-6 md:grid-cols-2">
          {company.reviews.map((review) => (
            <li key={review.author}>
              <figure className={cardClass}>
                <p className="text-lg font-bold text-ink">★ {review.rating.toFixed(1)}</p>
                <blockquote className="mt-2 text-ink">“{review.text}”</blockquote>
                <figcaption className="mt-3 text-xs text-muted">
                  {review.author} · {review.date}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default CompanyProfile
