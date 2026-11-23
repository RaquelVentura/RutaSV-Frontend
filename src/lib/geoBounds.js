// El Salvador: la ubicación de una experiencia debe caer dentro de estos límites.
export const elSalvadorBounds = { south: 13.1, north: 14.5, west: -90.2, east: -87.6 }

export function isInsideElSalvador(position) {
  return (
    !!position &&
    Number.isFinite(position.lat) &&
    Number.isFinite(position.lng) &&
    position.lat >= elSalvadorBounds.south &&
    position.lat <= elSalvadorBounds.north &&
    position.lng >= elSalvadorBounds.west &&
    position.lng <= elSalvadorBounds.east
  )
}
