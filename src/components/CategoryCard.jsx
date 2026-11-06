import { Link } from 'react-router-dom'

function CategoryCard({ title, count, image, to = '/experiencias' }) {
  return (
    <Link to={to} className="group block">
      <img
        src={image}
        alt=""
        loading="lazy"
        className="aspect-[3/2] w-full rounded-2xl object-cover transition group-hover:brightness-95"
      />
      <h3 className="mt-3 text-lg font-bold text-ink">{title}</h3>
      <p className="text-sm text-muted">{count} experiencias</p>
    </Link>
  )
}

export default CategoryCard
