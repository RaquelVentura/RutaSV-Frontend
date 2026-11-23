const fieldClass =
  'w-full rounded-xl border border-mist bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30'

// Rango de precio: una barra con dos círculos y los campos «Desde» y «Hasta».
// Mover la barra o escribir el valor actualiza ambos.
function PriceRange({ min = 0, max = 100, minValue, maxValue, onChange }) {
  const low = minValue === '' ? min : Math.min(Math.max(Number(minValue), min), max)
  const high = maxValue === '' ? max : Math.min(Math.max(Number(maxValue), min), max)
  const span = max - min
  const left = ((low - min) / span) * 100
  const right = ((high - min) / span) * 100

  function setLow(value) {
    const next = Math.min(Number(value), high)
    onChange(String(next), maxValue)
  }

  function setHigh(value) {
    const next = Math.max(Number(value), low)
    onChange(minValue, String(next))
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-brand" aria-live="polite">
        ${low} – ${high}
        {high >= max ? '+' : ''}
      </p>

      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-mist" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
        />
        <input
          type="range"
          aria-label="Precio mínimo, barra"
          min={min}
          max={max}
          step="1"
          value={low}
          onChange={(event) => setLow(event.target.value)}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
        <input
          type="range"
          aria-label="Precio máximo, barra"
          min={min}
          max={max}
          step="1"
          value={high}
          onChange={(event) => setHigh(event.target.value)}
          className="range-thumb absolute inset-0 h-6 w-full"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price-min" className="mb-1 block text-xs text-muted">
            Desde
          </label>
          <input
            id="price-min"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={`$${min}`}
            value={minValue}
            onChange={(event) => onChange(event.target.value, maxValue)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="price-max" className="mb-1 block text-xs text-muted">
            Hasta
          </label>
          <input
            id="price-max"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={`$${max}`}
            value={maxValue}
            onChange={(event) => onChange(minValue, event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  )
}

export default PriceRange
