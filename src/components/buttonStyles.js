const base =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'border border-mist bg-surface text-ink hover:bg-canvas',
}

export function buttonClass(variant = 'primary', extra = '') {
  return `${base} ${variants[variant]} ${extra}`.trim()
}
