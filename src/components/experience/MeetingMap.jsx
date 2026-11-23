// Mapa ilustrativo del punto de encuentro. Es una representación estática hasta
// que se integre un mapa real (HU-09, Leaflet).
function MeetingMap({ label }) {
  return (
    <figure>
      <svg
        viewBox="0 0 800 300"
        role="img"
        aria-label={`Mapa ilustrativo del punto de encuentro: ${label}`}
        className="h-auto w-full rounded-2xl"
      >
        <rect width="800" height="300" fill="#e8ebe0" />
        <path d="M0 0H800V120C640 150 520 70 380 110C240 150 120 120 0 150Z" fill="#a9d6e0" />
        <path d="M70 0 140 300M470 0 520 300M620 0 700 300" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <path d="M0 200C200 180 360 230 800 190" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" fill="none" />
        <g transform="translate(400 150)">
          <rect x="-96" y="-58" width="192" height="30" rx="8" fill="#ffffff" />
          <text x="0" y="-38" textAnchor="middle" fontSize="13" fontWeight="700" fill="#102f3b">
            {label}
          </text>
          <path
            d="M0 22C-14 4-18-6-18-14a18 18 0 0 1 36 0C18-6 14 4 0 22Z"
            fill="#ffffff"
            stroke="#087e9a"
            strokeWidth="3"
          />
          <circle cx="0" cy="-14" r="6" fill="#087e9a" />
        </g>
      </svg>
      <figcaption className="mt-2 text-xs text-muted">
        Mapa ilustrativo. La ubicación exacta se comparte con tu reserva.
      </figcaption>
    </figure>
  )
}

export default MeetingMap
