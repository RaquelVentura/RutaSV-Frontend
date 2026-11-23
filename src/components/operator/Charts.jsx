// Gráficos sencillos en SVG y CSS para el panel del operador (sin dependencias).

const brand = '#087e9a'
const track = '#dfe8eb'

export function ChartCard({ title, subtitle, badge, children }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-info-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
            {badge}
          </span>
        )}
      </header>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  )
}

export function BarChart({ data, label, format = String }) {
  const max = Math.max(...data.map((item) => item.value), 1)
  return (
    <div
      role="img"
      aria-label={`${label}: ${data.map((item) => `${item.label} ${format(item.value)}`).join(', ')}`}
    >
      <div className="flex h-40 items-end gap-2" aria-hidden="true">
        {data.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-semibold text-ink">{item.value > 0 ? format(item.value) : ''}</span>
            <div
              className="w-full max-w-9 rounded-t-md"
              style={{
                height: item.value > 0 ? `${Math.max((item.value / max) * 100, 6)}%` : '2px',
                backgroundColor: item.value > 0 ? brand : track,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {data.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex-1 text-center text-[11px] text-muted">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DonutChart({ percent, caption, items, accent = brand }) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * circumference
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative h-36 w-36 shrink-0" role="img" aria-label={`${percent}% ${caption}`}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke={track} strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="14"
            strokeLinecap={filled > 0 ? 'round' : 'butt'}
            strokeDasharray={`${filled} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-ink">{percent}%</span>
          <span className="text-[11px] text-muted">{caption}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-ink">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
            <span className="ml-auto pl-4 font-semibold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LineChart({ data, label }) {
  const width = 320
  const height = 130
  const pad = { left: 8, right: 8, top: 14, bottom: 8 }
  const max = Math.max(...data.map((item) => item.value), 1)
  const step = data.length > 1 ? (width - pad.left - pad.right) / (data.length - 1) : 0
  const points = data.map((item, index) => ({
    x: pad.left + index * step,
    y: pad.top + (1 - item.value / max) * (height - pad.top - pad.bottom),
    ...item,
  }))
  const path = points.map((point) => `${point.x},${point.y}`).join(' ')
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}: ${data.map((item) => `${item.label} ${item.value}`).join(', ')}`}
        className="h-auto w-full"
      >
        {[0, 0.5, 1].map((fraction) => {
          const y = pad.top + fraction * (height - pad.top - pad.bottom)
          return <line key={fraction} x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke={track} strokeWidth="1" />
        })}
        <polyline points={path} fill="none" stroke={brand} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="3.5" fill="#ffffff" stroke={brand} strokeWidth="2" />
            <text x={point.x} y={point.y - 8} textAnchor="middle" fontSize="9" fontWeight="600" fill="#102f3b">
              {point.value}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted" aria-hidden="true">
        {data.map((item, index) => (
          <span key={`${item.label}-${index}`}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
