function SectionHeading({ eyebrow, title, description, action, eyebrowClassName = 'text-brand' }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className={`text-xs font-bold uppercase tracking-wide ${eyebrowClassName}`}>
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default SectionHeading
