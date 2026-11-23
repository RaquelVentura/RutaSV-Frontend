import { useCallback, useEffect, useState } from 'react'

// Galería de la ficha, como la de Google: tocar una foto la amplía; el ícono de la
// esquina abre la cuadrícula con todas las fotos, y desde ahí se puede ampliar cualquiera.
function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 18 5.5-5 4 3.5 2.5-2.2L20 17" />
    </svg>
  )
}

function CloseButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  )
}

function Viewer({ photos, title, index, onChange, onClose, closeLabel }) {
  const previous = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, onChange, photos.length])
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, onChange, photos.length])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'ArrowLeft') previous()
      else if (event.key === 'ArrowRight') next()
      else if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [next, onClose, previous])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${photos.length} de ${title}`}
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between text-white">
        <p className="text-sm font-semibold" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <CloseButton label={closeLabel} onClick={onClose} />
      </div>

      <div className="relative my-4 flex min-h-0 flex-1 items-center justify-center px-14 sm:px-20">
        <img
          src={photos[index]}
          alt={`${title}: foto ${index + 1} de ${photos.length}`}
          className="h-full w-full rounded-xl object-contain"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Foto anterior"
              className="absolute left-0 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-2"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-0 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-2"
            >
              ›
            </button>
          </>
        )}
      </div>

      <ul className="flex shrink-0 justify-center gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
        {photos.map((photo, position) => (
          <li key={`${photo}-${position}`}>
            <button
              type="button"
              onClick={() => onChange(position)}
              aria-label={`Ver foto ${position + 1}`}
              aria-current={position === index ? 'true' : undefined}
              className={`block h-14 w-20 overflow-hidden rounded-lg border-2 transition ${
                position === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PhotoGallery({ photos, title, totalPhotos }) {
  // view: null | { mode: 'grid' } | { mode: 'viewer', index, from: 'page' | 'grid' }
  const [view, setView] = useState(null)
  const [main, ...rest] = photos
  const thumbnails = rest.slice(0, 4)

  const openViewer = (index, from) => setView({ mode: 'viewer', index, from })
  const closeViewer = useCallback(
    () => setView((current) => (current?.from === 'grid' ? { mode: 'grid' } : null)),
    [],
  )

  const showAll = `Ver las ${totalPhotos} fotos`

  return (
    <>
      <div className="grid gap-3 md:h-[440px] md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
        <div className="relative h-64 overflow-hidden rounded-2xl md:row-span-2 md:h-full">
          <button
            type="button"
            onClick={() => openViewer(0, 'page')}
            aria-label="Ampliar foto 1"
            className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <img src={main} alt={`${title}: foto principal`} className="h-full w-full object-cover transition hover:scale-[1.02]" />
          </button>
          <button
            type="button"
            onClick={() => setView({ mode: 'grid' })}
            aria-label={showAll}
            title={showAll}
            className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-white shadow-md backdrop-blur transition hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
          >
            <GalleryIcon />
          </button>
        </div>
        {thumbnails.map((photo, index) => (
          <div key={`${photo}-${index}`} className="relative hidden overflow-hidden rounded-2xl md:block">
            <button
              type="button"
              onClick={() => openViewer(index + 1, 'page')}
              aria-label={`Ampliar foto ${index + 2}`}
              className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <img src={photo} alt={`${title}: foto ${index + 2}`} className="h-full w-full object-cover transition hover:scale-[1.02]" />
            </button>
            {index === thumbnails.length - 1 && (
              <button
                type="button"
                onClick={() => setView({ mode: 'grid' })}
                aria-label={showAll}
                title={showAll}
                className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-white shadow-md backdrop-blur transition hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <GalleryIcon />
              </button>
            )}
          </div>
        ))}
      </div>

      {view?.mode === 'grid' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${title}`}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/90 p-4 sm:p-8"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{title}</p>
              <CloseButton label="Cerrar" onClick={() => setView(null)} />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, index) => (
                <li key={`${photo}-${index}`}>
                  <button
                    type="button"
                    onClick={() => openViewer(index, 'grid')}
                    aria-label={`Ampliar foto ${index + 1} de ${photos.length}`}
                    className="block aspect-[4/3] w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <img src={photo} alt="" className="h-full w-full object-cover transition hover:scale-[1.03]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {view?.mode === 'viewer' && (
        <Viewer
          photos={photos}
          title={title}
          index={view.index}
          onChange={(index) => setView((current) => ({ ...current, index }))}
          onClose={closeViewer}
          closeLabel={view.from === 'grid' ? 'Volver' : 'Cerrar'}
        />
      )}
    </>
  )
}

export default PhotoGallery
