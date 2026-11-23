import { useState } from 'react'

// Galería de la ficha: una foto grande y cuatro pequeñas. «Ver las N fotos»
// abre una vista con todas las fotos disponibles.
function PhotoGallery({ photos, title, totalPhotos }) {
  const [open, setOpen] = useState(false)
  const [main, ...rest] = photos
  const thumbnails = rest.slice(0, 4)

  return (
    <>
      <div className="grid gap-3 md:h-[440px] md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
        <img
          src={main}
          alt={`${title}: foto principal`}
          className="h-64 w-full rounded-2xl object-cover md:row-span-2 md:h-full"
        />
        {thumbnails.map((photo, index) => (
          <div key={`${photo}-${index}`} className="relative hidden overflow-hidden rounded-2xl md:block">
            <img src={photo} alt={`${title}: foto ${index + 2}`} className="h-full w-full object-cover" />
            {index === thumbnails.length - 1 && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute bottom-4 right-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Ver las {totalPhotos} fotos
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-mist bg-surface px-4 py-2 text-sm font-semibold text-ink md:hidden"
        >
          Ver las {totalPhotos} fotos
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${title}`}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/80 p-4 sm:p-8"
        >
          <div className="mx-auto max-w-5xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 ml-auto block rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Cerrar
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={photo}
                  alt={`${title}: foto ${index + 1} de ${photos.length}`}
                  className="w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PhotoGallery
