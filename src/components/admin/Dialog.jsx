import { useEffect, useId } from 'react'

function Dialog({ title, onClose, children }) {
  const titleId = useId()

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-xl font-bold text-ink">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

export default Dialog
