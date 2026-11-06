const tones = {
  pending: 'bg-amber-100 text-pending',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-brand',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-mist/70 text-muted',
}

function Pill({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  )
}

export default Pill
