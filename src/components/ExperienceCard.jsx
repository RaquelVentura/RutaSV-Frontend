import { Link } from 'react-router-dom'
import { resolveAssetUrl } from '../lib/catalogApi.js'

const placeholderImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=70'

function ExperienceCard({
  slug,
  image,
  location,
  rating = 0,
  title,
  details,
  price,
  spots,
  isFavorite = false,
  onToggleFavorite,
}) {
  const imageSrc = resolveAssetUrl(image) || placeholderImage
  const numericRating = Number(rating ?? 0)
  const numericPrice = Number(price ?? 0)

  function handleFavoriteClick(event) {
    event.preventDefault()
    event.stopPropagation()
    onToggleFavorite?.()
  }

  return (
    <Link
      to={`/experiencias/${slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-mist bg-surface transition hover:shadow-md"
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={title || ''}
          loading="lazy"
          className="aspect-[2/1] w-full object-cover transition group-hover:scale-[1.02]"
        />
        {typeof onToggleFavorite === 'function' && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isFavorite}
            className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full shadow-sm backdrop-blur transition ${
              isFavorite
                ? 'bg-danger text-white'
                : 'bg-white/90 text-ink hover:bg-white hover:text-danger'
            }`}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="truncate">{location}</span>
          <span className="shrink-0 font-semibold text-ink">
            ★ {numericRating > 0 ? numericRating.toFixed(1) : 'Nuevo'}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-1 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{details}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-muted">
            <span className="text-base font-bold text-ink">${numericPrice.toFixed(2)} USD</span> / persona
          </p>
          {spots !== undefined && spots !== null && (
            <span className="rounded-full bg-info-soft px-3 py-1 text-xs font-medium text-muted">
              {typeof spots === 'number' ? `Hasta ${spots} pers.` : spots}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ExperienceCard
