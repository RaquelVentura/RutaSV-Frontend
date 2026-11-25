import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import PhotoGallery from '../../components/experience/PhotoGallery.jsx'
import LeafletMap from '../../components/map/LeafletMap.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  addFavorite,
  getExperienceAvailabilities,
  getMyFavoriteIds,
  removeFavorite,
} from '../../lib/bookingApi.js'
import {
  extractApiError,
  getExperienceBySlugOrId,
  resolveAssetUrl,
} from '../../lib/catalogApi.js'
import {
  difficultyLabels,
  formatCurrency,
  formatDateReadable,
  formatDuration,
} from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const fallbackPhoto =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=75'

function splitLines(text) {
  if (!text) return []
  return text
    .split(/\r?\n|•/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function ExperienceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()

  const [experience, setExperience] = useState(null)
  const [availabilities, setAvailabilities] = useState([])
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState('')
  const [peopleCount, setPeopleCount] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setNotFound(false)
      setErrorMessage('')
      try {
        const exp = await getExperienceBySlugOrId(slug)
        if (cancelled) return
        setExperience(exp)
        setPeopleCount(Math.max(1, Number(exp.minPeople ?? 1)))

        const slots = await getExperienceAvailabilities(exp.id)
        if (cancelled) return
        setAvailabilities(slots)
        const firstOpen = slots.find((s) => s.status === 'ABIERTA' && s.availableSpots > 0)
        setSelectedAvailabilityId(firstOpen?.id ?? '')
      } catch (error) {
        if (cancelled) return
        const parsed = extractApiError(error, 'No se pudo cargar esta experiencia.')
        if (parsed.status === 404) {
          setNotFound(true)
        } else {
          setErrorMessage(parsed.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!isAuthenticated || !experience?.id) return
    let cancelled = false
    getMyFavoriteIds()
      .then((ids) => {
        if (!cancelled) setIsFavorite(ids.includes(experience.id))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, experience?.id])

  const effectiveFavorite = isAuthenticated && isFavorite

  const selectedSlot = useMemo(
    () => availabilities.find((s) => s.id === selectedAvailabilityId) ?? null,
    [availabilities, selectedAvailabilityId],
  )

  const maxAllowedPeople = useMemo(() => {
    if (!experience) return 10
    const expMax = experience.hasLimitedCapacity && experience.maxPeople ? Number(experience.maxPeople) : 50
    const slotMax = selectedSlot ? Number(selectedSlot.availableSpots) : expMax
    return Math.max(Number(experience.minPeople ?? 1), Math.min(expMax, slotMax))
  }, [experience, selectedSlot])

  async function handleToggleFavorite() {
    if (!experience) return
    if (!isAuthenticated) {
      notify.error('Inicia sesión para guardar esta experiencia en favoritos.')
      navigate('/login', { state: { from: location } })
      return
    }
    try {
      if (effectiveFavorite) {
        await removeFavorite(experience.id)
        setIsFavorite(false)
        notify.success('Experiencia quitada de favoritos.')
      } else {
        await addFavorite(experience.id)
        setIsFavorite(true)
        notify.success('Experiencia agregada a favoritos.')
      }
    } catch (error) {
      notify.error(extractApiError(error).message)
    }
  }

  function handleProceedToBook() {
    if (!experience) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (user && !user.emailVerified) {
      notify.error('Debes verificar tu correo electrónico antes de reservar (RN-20).')
      navigate('/verify-email')
      return
    }
    if (!selectedSlot) {
      notify.error('Selecciona una fecha y horario con cupos disponibles.')
      return
    }

    navigate('/turista/reservar', {
      state: {
        experience,
        availability: selectedSlot,
        peopleCount,
      },
    })
  }

  if (loading) {
    return (
      <div className="w-full space-y-6 px-6 py-10">
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface" />
        <div className="h-96 animate-pulse rounded-2xl bg-surface" />
      </div>
    )
  }

  if (notFound || !experience) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-ink">Experiencia no encontrada</h1>
        <p className="mt-2 text-sm text-muted">
          {errorMessage || 'Esta actividad no existe o ya no se encuentra publicada.'}
        </p>
        <Link
          to="/experiencias"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Volver al explorador
        </Link>
      </div>
    )
  }

  const photos =
    experience.images?.length > 0
      ? experience.images.map((img) => resolveAssetUrl(img.url) || fallbackPhoto)
      : [fallbackPhoto]

  const unitPrice = selectedSlot ? Number(selectedSlot.effectivePrice) : Number(experience.price)
  const totalAmount = unitPrice * peopleCount
  const includesList = splitLines(experience.includes)
  const excludesList = splitLines(experience.excludes)
  const bringList = splitLines(experience.whatToBring)
  const openSlots = availabilities.filter((s) => s.status === 'ABIERTA' && s.availableSpots > 0)

  return (
    <div className="w-full space-y-10 px-6 py-8">
      <nav aria-label="Migas de pan" className="text-xs text-muted">
        <Link to="/" className="hover:text-brand">Inicio</Link>
        {' / '}
        <Link to="/experiencias" className="hover:text-brand">Experiencias</Link>
        {' / '}
        <span className="text-ink">{experience.title}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {experience.categories?.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-brand"
              >
                {cat.name}
              </span>
            ))}
            {experience.difficulty && (
              <span className="rounded-full border border-mist px-3 py-1 text-xs font-medium text-muted">
                Dificultad: {difficultyLabels[experience.difficulty] ?? experience.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{experience.title}</h1>
          <p className="text-sm text-muted">
            {experience.municipalityName}, {experience.departmentName}
            {experience.durationMinutes ? ` · ${formatDuration(experience.durationMinutes)}` : ''}
            {' · '}
            ★ {Number(experience.averageRating ?? 0) > 0 ? Number(experience.averageRating).toFixed(1) : 'Nuevo'}
            {experience.totalReviews > 0 ? ` (${experience.totalReviews} reseñas)` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={effectiveFavorite}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            effectiveFavorite
              ? 'border-danger bg-danger-soft text-danger'
              : 'border-mist bg-surface text-ink hover:border-brand hover:text-brand'
          }`}
        >
          <span>{effectiveFavorite ? '♥' : '♡'}</span>
          <span>{effectiveFavorite ? 'Guardado en favoritos' : 'Agregar a favoritos'}</span>
        </button>
      </header>

      <PhotoGallery photos={photos} title={experience.title} totalPhotos={photos.length} />

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">Acerca de esta experiencia</h2>
            <p className="text-base font-medium text-ink/90">{experience.shortDescription}</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
              {experience.description}
            </p>
          </section>

          <section className="grid gap-4 rounded-2xl border border-mist bg-surface p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Duración</p>
              <p className="mt-1 text-sm font-bold text-ink">
                {formatDuration(experience.durationMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Capacidad</p>
              <p className="mt-1 text-sm font-bold text-ink">
                {experience.hasLimitedCapacity
                  ? `${experience.minPeople} a ${experience.maxPeople} personas`
                  : `Mínimo ${experience.minPeople} persona(s)`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Confirmación</p>
              <p className="mt-1 text-sm font-bold text-ink">
                {experience.autoConfirmation ? 'Inmediata' : 'Confirmada por el operador'}
              </p>
            </div>
          </section>

          {(includesList.length > 0 || excludesList.length > 0 || bringList.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {includesList.length > 0 && (
                <div className="rounded-2xl border border-mist bg-surface p-5">
                  <h3 className="text-base font-bold text-ink">Qué incluye</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {includesList.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-brand">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {excludesList.length > 0 && (
                <div className="rounded-2xl border border-mist bg-surface p-5">
                  <h3 className="text-base font-bold text-ink">No incluye</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {excludesList.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-danger">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {bringList.length > 0 && (
                <div className="rounded-2xl border border-mist bg-surface p-5 sm:col-span-2">
                  <h3 className="text-base font-bold text-ink">Qué llevar</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                    {bringList.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-brand">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">Punto de encuentro y ubicación</h2>
            {experience.referenceAddress && (
              <p className="text-sm text-muted">{experience.referenceAddress}</p>
            )}
            <LeafletMap
              position={{ lat: Number(experience.latitude), lng: Number(experience.longitude) }}
              label={`Ubicación de ${experience.title}`}
              className="h-72"
            />
          </section>

          {experience.company && (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-mist bg-surface p-6">
              <div>
                <p className="text-xs font-semibold uppercase text-brand">Operado por</p>
                <h3 className="mt-1 text-lg font-bold text-ink">{experience.company.tradeName}</h3>
                {experience.company.description && (
                  <p className="mt-1 max-w-xl text-sm text-muted">
                    {experience.company.description}
                  </p>
                )}
              </div>
              <Link
                to={`/empresas/${experience.company.id}`}
                className="rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
              >
                Ver perfil de empresa
              </Link>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-mist bg-surface p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-ink">
              {formatCurrency(unitPrice, experience.currency)}
              <span className="text-sm font-normal text-muted"> / persona</span>
            </p>
            {selectedSlot?.specialPrice != null && (
              <span className="rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-brand">
                Tarifa especial
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-muted">
              1. Elige fecha y horario disponible
            </label>
            {openSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mist bg-canvas p-4 text-sm text-muted">
                El operador aún no ha publicado cupos próximos para esta experiencia.
              </div>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {openSlots.map((slot) => {
                  const selected = slot.id === selectedAvailabilityId
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvailabilityId(slot.id)
                        setPeopleCount((prev) =>
                          Math.min(Math.max(Number(experience.minPeople ?? 1), prev), slot.availableSpots),
                        )
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-brand bg-info-soft text-ink'
                          : 'border-mist bg-canvas text-ink hover:border-brand/50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{formatDateReadable(slot.date)}</p>
                        <p className="text-xs text-muted">
                          {slot.startTime}
                          {slot.endTime ? ` – ${slot.endTime}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">
                          {formatCurrency(slot.effectivePrice, slot.currency)}
                        </p>
                        <p className="text-xs text-muted">{slot.availableSpots} cupos</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="booking-people" className="block text-xs font-bold uppercase tracking-wide text-muted">
              2. Cantidad de personas
            </label>
            <div className="flex items-center justify-between rounded-xl border border-mist bg-canvas px-4 py-2.5">
              <button
                type="button"
                aria-label="Reducir personas"
                disabled={peopleCount <= Number(experience.minPeople ?? 1)}
                onClick={() => setPeopleCount((c) => Math.max(Number(experience.minPeople ?? 1), c - 1))}
                className="grid size-8 place-items-center rounded-full border border-mist bg-surface text-base font-bold text-ink disabled:opacity-40"
              >
                −
              </button>
              <span id="booking-people" className="text-base font-bold text-ink">
                {peopleCount} {peopleCount === 1 ? 'persona' : 'personas'}
              </span>
              <button
                type="button"
                aria-label="Aumentar personas"
                disabled={peopleCount >= maxAllowedPeople}
                onClick={() => setPeopleCount((c) => Math.min(maxAllowedPeople, c + 1))}
                className="grid size-8 place-items-center rounded-full border border-mist bg-surface text-base font-bold text-ink disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-mist pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>
                {formatCurrency(unitPrice, experience.currency)} × {peopleCount}
              </span>
              <span>{formatCurrency(totalAmount, experience.currency)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink">
              <span>Total estimado</span>
              <span>{formatCurrency(totalAmount, experience.currency)}</span>
            </div>
          </div>

          {isAuthenticated && user && !user.emailVerified && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              Para reservar necesitas tener tu correo verificado.{' '}
              <Link to="/verify-email" className="font-bold underline">
                Verificar correo ahora
              </Link>
            </div>
          )}

          <button
            type="button"
            disabled={openSlots.length === 0 || !selectedSlot}
            onClick={handleProceedToBook}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAuthenticated ? 'Continuar a reserva y pago' : 'Inicia sesión para reservar'}
          </button>

          <p className="text-xs leading-relaxed text-muted">
            Política de cancelación (hora de El Salvador): reembolso del 100 % con ≥ 48 h de
            anticipación, 50 % entre 24 h y 48 h, y sin reembolso con menos de 24 h.
          </p>
        </aside>
      </div>
    </div>
  )
}

export default ExperienceDetail
