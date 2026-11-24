import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ExperienceCard from '../../components/ExperienceCard.jsx'
import { getMyFavorites, removeFavorite } from '../../lib/bookingApi.js'
import { extractApiError } from '../../lib/catalogApi.js'
import { formatDuration } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function ActivityFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchFavorites() {
      try {
        const items = await getMyFavorites()
        if (!cancelled) {
          setErrorMessage('')
          setFavorites(items)
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se pudieron cargar tus favoritos.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFavorites()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleRemove(experienceId) {
    try {
      await removeFavorite(experienceId)
      setFavorites((prev) => prev.filter((item) => item.experienceId !== experienceId))
      notify.success('Experiencia quitada de favoritos.')
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  return (
    <div className="w-full space-y-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Mi actividad</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Experiencias favoritas</h1>
          <p className="mt-1 text-sm text-muted">
            Guarda las actividades que quieres reservar más adelante.
          </p>
        </div>
        <Link
          to="/turista/mi-actividad/reservas"
          className="rounded-full border border-mist bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
        >
          Mis reservas
        </Link>
      </header>

      {errorMessage && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-80 animate-pulse rounded-2xl border border-mist bg-surface" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist bg-surface p-12 text-center">
          <p className="text-lg font-bold text-ink">Todavía no has guardado favoritos</p>
          <p className="mt-1 text-sm text-muted">
            Toca el ícono de corazón en cualquier experiencia para tenerla siempre a mano.
          </p>
          <Link
            to="/experiencias"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
          >
            Explorar experiencias
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ experienceId, experience }) => (
            <ExperienceCard
              key={experienceId}
              slug={experience.slug}
              image={experience.coverImageUrl}
              location={`${experience.municipalityName}, ${experience.departmentName}`}
              rating={experience.averageRating}
              title={experience.title}
              details={`${formatDuration(experience.durationMinutes)} · ${experience.shortDescription}`}
              price={experience.price}
              spots={experience.hasLimitedCapacity ? experience.maxPeople : 'Abierto'}
              isFavorite
              onToggleFavorite={() => handleRemove(experienceId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ActivityFavorites
