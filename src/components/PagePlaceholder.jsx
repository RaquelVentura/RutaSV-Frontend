function PagePlaceholder({ title, story }) {
  return (
    <section>
      <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-muted">
        Pantalla pendiente de implementar{story ? ` (${story})` : ''}.
      </p>
    </section>
  )
}

export default PagePlaceholder
