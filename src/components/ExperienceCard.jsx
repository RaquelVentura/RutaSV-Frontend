import { Link } from 'react-router-dom'

function ExperienceCard({ slug, image, location, rating, title, details, price, spots }) {
  return (
    <Link
      to={`/experiencias/${slug}`}
      className="block overflow-hidden rounded-2xl border border-mist bg-surface transition hover:shadow-md"
    >
      <img src={image} alt="" loading="lazy" className="aspect-[2/1] w-full object-cover" />
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{location}</span>
          <span className="font-semibold text-ink">★ {rating.toFixed(1)}</span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-muted">{details}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            <span className="text-base font-bold text-ink">${price} USD</span> / persona
          </p>
          <span className="rounded-full bg-info-soft px-3 py-1 text-xs font-medium text-muted">
            {spots} cupos
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ExperienceCard
