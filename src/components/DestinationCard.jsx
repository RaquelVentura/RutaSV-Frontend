import { Link } from 'react-router-dom'

function DestinationCard({ title, description, image, to = '/experiencias' }) {
  return (
    <Link to={to} className="group block">
      <img
        src={image}
        alt=""
        loading="lazy"
        className="aspect-[2/1] w-full rounded-2xl object-cover transition group-hover:brightness-95"
      />
      <h3 className="mt-3 text-lg font-bold text-brand">{title} →</h3>
      <p className="text-sm text-muted">{description}</p>
    </Link>
  )
}

export default DestinationCard
