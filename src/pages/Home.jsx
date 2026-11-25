import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ExperienceCard from '../components/ExperienceCard.jsx'
import CategoriesSection from '../components/home/CategoriesSection.jsx'
import DestinationsSection from '../components/home/DestinationsSection.jsx'
import EditorialBanner from '../components/home/EditorialBanner.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import NewsletterSection from '../components/home/NewsletterSection.jsx'
import OperatorCta from '../components/home/OperatorCta.jsx'
import StepsSection from '../components/home/StepsSection.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'
import ValuePropsSection from '../components/home/ValuePropsSection.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  addFavorite,
  getMyFavoriteIds,
  removeFavorite,
} from '../lib/bookingApi.js'
import { extractApiError, getPublicExperiences } from '../lib/catalogApi.js'
import { formatDuration } from '../lib/formatters.js'
import { getDisplayName } from '../lib/userMenu.js'
import { notify } from '../lib/notify.js'

function Home() {
  const { user, isAuthenticated } = useAuth()
  const [experiences, setExperiences] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getPublicExperiences({ pageNumber: 1, pageSize: 6, sortBy: 'recent' })
        if (!cancelled) {
          setExperiences(res?.data ?? [])
        }
      } catch {
        if (!cancelled) setExperiences([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getMyFavoriteIds()
      .then((ids) => {
        if (!cancelled) setFavoriteIds(ids)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const activeFavoriteIds = isAuthenticated ? favoriteIds : []

  async function handleToggleFavorite(experienceId) {
    if (!isAuthenticated) {
      notify.error('Inicia sesión para guardar experiencias en favoritos.')
      return
    }
    const isFav = activeFavoriteIds.includes(experienceId)
    try {
      if (isFav) {
        await removeFavorite(experienceId)
        setFavoriteIds((prev) => prev.filter((id) => id !== experienceId))
        notify.success('Experiencia quitada de favoritos.')
      } else {
        await addFavorite(experienceId)
        setFavoriteIds((prev) => [...prev, experienceId])
        notify.success('Experiencia agregada a favoritos.')
      }
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  return (
    <div className="space-y-12">
      {isAuthenticated && user && (
        <section className="-mb-6 w-full px-6 pt-5">
          <h2 className="text-xl font-bold text-ink">
            Qué bueno verte, {getDisplayName(user)}
          </h2>
        </section>
      )}
      <HeroSection />
      <ValuePropsSection />
      <CategoriesSection />

      <section className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">
              Catálogo en vivo
            </p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Experiencias destacadas</h2>
            <p className="mt-2 text-sm text-muted">
              Actividades publicadas por operadores locales verificados en El Salvador.
            </p>
          </div>
          <Link
            to="/experiencias"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-mist bg-surface"
              />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-mist bg-surface p-10 text-center">
            <p className="text-base font-semibold text-ink">
              Aún no hay experiencias publicadas en este momento.
            </p>
            <p className="mt-1 text-sm text-muted">
              Explora el catálogo o solicita ser operador para publicar la primera experiencia.
            </p>
            <Link
              to="/experiencias"
              className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Ir al explorador
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                slug={exp.slug}
                image={exp.coverImageUrl}
                location={`${exp.municipalityName || ''}${exp.departmentName ? `, ${exp.departmentName}` : ''}`}
                rating={exp.averageRating}
                title={exp.title}
                details={`${formatDuration(exp.durationMinutes)} · ${exp.shortDescription}`}
                price={exp.price}
                spots={exp.hasLimitedCapacity ? exp.maxPeople : 'Abierto'}
                isFavorite={activeFavoriteIds.includes(exp.id)}
                onToggleFavorite={() => handleToggleFavorite(exp.id)}
              />
            ))}
          </div>
        )}
      </section>

      <DestinationsSection />
      <EditorialBanner />
      <StepsSection />
      <TestimonialsSection />
      <OperatorCta />
      <NewsletterSection />
    </div>
  )
}

export default Home
