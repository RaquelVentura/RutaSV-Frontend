const tones = {
  success: 'bg-success-soft text-success',
  warning: 'bg-amber-100 text-pending',
  error: 'bg-danger-soft text-danger',
}

const icons = { success: '✓', warning: '', error: '✕' }

function Notice({ tone = 'success', children }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${tones[tone]}`}
    >
      {icons[tone] && <span aria-hidden="true">{icons[tone]} </span>}
      {children}
    </p>
  )
}

export default Notice
