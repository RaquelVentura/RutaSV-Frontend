import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { elSalvadorBounds } from '../../lib/geoBounds.js'

const defaultCenter = [13.7, -89.2]

const pinIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#087e9a;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
})

// Mapa con un solo marcador. Con onChange el marcador se arrastra y el mapa responde
// a los clics (selector de punto); sin onChange solo muestra el punto.
function LeafletMap({ position, onChange, label, className = 'h-72' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    const interactive = typeof onChangeRef.current === 'function'
    const map = L.map(containerRef.current, {
      center: position ? [position.lat, position.lng] : defaultCenter,
      zoom: position ? 14 : 8,
      minZoom: 7,
      maxBounds: [
        [elSalvadorBounds.south - 0.4, elSalvadorBounds.west - 0.4],
        [elSalvadorBounds.north + 0.4, elSalvadorBounds.east + 0.4],
      ],
      scrollWheelZoom: interactive,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map

    if (interactive) {
      map.on('click', (event) => {
        onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng })
      })
    }
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // El mapa se crea una vez; la posición se sincroniza en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!position) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }
    const latLng = [position.lat, position.lng]
    if (!markerRef.current) {
      const marker = L.marker(latLng, { icon: pinIcon, draggable: typeof onChangeRef.current === 'function' })
      marker.on('dragend', () => {
        const point = marker.getLatLng()
        onChangeRef.current?.({ lat: point.lat, lng: point.lng })
      })
      marker.addTo(map)
      markerRef.current = marker
    } else {
      markerRef.current.setLatLng(latLng)
    }
    map.panTo(latLng)
  }, [position])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={label}
      className={`z-0 w-full overflow-hidden rounded-2xl border border-black/10 ${className}`}
    />
  )
}

export default LeafletMap
