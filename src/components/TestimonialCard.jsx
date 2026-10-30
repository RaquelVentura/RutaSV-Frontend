function TestimonialCard({ quote, author, trip }) {
  return (
    <figure className="rounded-2xl bg-canvas p-6">
      <p aria-label="5 estrellas" className="tracking-widest text-brand">
        ★★★★★
      </p>
      <blockquote className="mt-4 text-ink">“{quote}”</blockquote>
      <figcaption className="mt-5">
        <p className="text-sm font-bold text-ink">{author}</p>
        <p className="text-xs text-muted">{trip} · Viaje verificado</p>
      </figcaption>
    </figure>
  )
}

export default TestimonialCard
