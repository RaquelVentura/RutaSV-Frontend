import FilterIcon from '../FilterIcon.jsx'

// Selector de filtro: aplica al elegir una opción, sin botón de aceptar.
function FilterSelect({ label, options, className = '', wrapperClassName = 'inline-block', ...props }) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <FilterIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <select
        aria-label={label}
        className={`w-full rounded-xl border border-mist bg-surface py-2.5 pl-10 pr-4 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FilterSelect
