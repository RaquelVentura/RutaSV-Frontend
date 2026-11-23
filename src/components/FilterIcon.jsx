// Embudo de filtro, en trazo, para los selectores de filtro.
function FilterIcon({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 5h16l-6 7.2V19l-4 1.6v-8.4L4 5Z" />
    </svg>
  )
}

export default FilterIcon
