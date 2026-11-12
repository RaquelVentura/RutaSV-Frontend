import {
  availability,
  experiences,
  reservations,
  reviews,
} from './operatorData.js'

const initialCollections = { experiences, reservations, reviews, availability }

export function getOperatorProfileKey(user) {
  const identity =
    user?.business?.id ??
    user?.businessId ??
    user?.business_id ??
    user?.id ??
    user?.sub ??
    user?.email ??
    user?.businessName ??
    user?.business_name ??
    user?.business?.name ??
    'demo'

  return String(identity).trim().toLocaleLowerCase().replace(/[^a-z0-9._-]/g, '-')
}

function storageKey(user, collection) {
  return `rutasv:operator:${getOperatorProfileKey(user)}:${collection}`
}

export function readOperatorCollection(user, collection) {
  const seed = initialCollections[collection]
  if (!seed) {
    throw new Error(`Colección de operador desconocida: ${collection}`)
  }

  const storedValue = localStorage.getItem(storageKey(user, collection))
  if (storedValue === null) {
    return structuredClone(seed)
  }

  const parsedValue = JSON.parse(storedValue)
  if (!Array.isArray(parsedValue)) {
    throw new Error(`Los datos locales de ${collection} no tienen un formato válido.`)
  }

  return parsedValue
}

export function saveOperatorCollection(user, collection, value) {
  if (!initialCollections[collection]) {
    throw new Error(`Colección de operador desconocida: ${collection}`)
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`Los datos de ${collection} deben ser una lista.`)
  }

  localStorage.setItem(storageKey(user, collection), JSON.stringify(value))
}

export function getOperatorDisplayName(user) {
  return (
    user?.businessName ||
    user?.business_name ||
    user?.business?.name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    'Olas de El Tunco'
  )
}
