import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const itemClass =
  'block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas hover:text-brand'

function UserMenu({ label, items = [], onLogout, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function close() {
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex max-w-full items-center gap-1 rounded-full bg-info-soft px-4 py-2 text-xs font-bold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${className}`.trim()}
      >
        <span className="truncate">{label}</span>
        <span
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Opciones de usuario"
          className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-mist bg-surface py-2 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={close}
              className={itemClass}
            >
              {item.label}
            </Link>
          ))}
          {items.length > 0 && <div className="my-1 border-t border-mist" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close()
              onLogout?.()
            }}
            className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger-soft"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
