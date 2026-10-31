function SearchInput({ label, className = '', ...props }) {
  return (
    <input
      type="search"
      aria-label={label}
      className={`w-full rounded-xl border border-mist bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 ${className}`.trim()}
      {...props}
    />
  )
}

export default SearchInput
