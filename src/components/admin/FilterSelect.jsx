function FilterSelect({ label, options, className = '', ...props }) {
  return (
    <select
      aria-label={label}
      className={`rounded-xl border border-mist bg-surface px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 ${className}`.trim()}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  )
}

export default FilterSelect
