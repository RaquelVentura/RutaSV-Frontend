import { catalog } from '../../data/catalog.js'
import { getExperienceBySlug } from '../../data/experienceDetails.js'
import {
  availability,
  experiences,
  reservations,
  reviews,
} from './operatorData.js'

const initialCollections = { experiences, reservations, reviews, availability, refunds: [] }

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

const profileSeed = {
  businessName: 'Olas de El Tunco',
  description: 'Guías locales desde 2018. Compartimos nuestra pasión por el surf y la costa de El Salvador.',
  department: 'La Libertad',
  municipality: 'Puerto de La Libertad',
  address: 'Playa El Tunco, a 200 m del muelle',
  email: 'contacto@olasdeeltunco.com',
  whatsapp: '+503 7777 2048',
}

// Perfil del negocio (Configuración): un objeto por operador.
export function readOperatorProfile(user) {
  const stored = localStorage.getItem(storageKey(user, 'profile'))
  if (stored === null) return { ...profileSeed }
  const parsed = JSON.parse(stored)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Los datos locales del perfil no tienen un formato válido.')
  }
  return { ...profileSeed, ...parsed }
}

export function saveOperatorProfile(user, profile) {
  localStorage.setItem(storageKey(user, 'profile'), JSON.stringify(profile))
}

// Panel del admin: las experiencias del catálogo público y las que guardaron los
// operadores en este navegador. Lo que el admin cambia sobre el catálogo (retirar,
// restaurar, quitar fotos) se guarda aparte, como ajustes por experiencia.
const operatorPrefix = 'rutasv:operator:'
const catalogOwner = 'catalogo'

function catalogOverrides() {
  try {
    const stored = JSON.parse(localStorage.getItem(`${operatorPrefix}${catalogOwner}:experiences`))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function fromCatalog() {
  const overrides = catalogOverrides()
  return catalog.map((entry) => {
    const detail = getExperienceBySlug(entry.slug)
    const override = overrides.find((item) => item.id === entry.slug) ?? {}
    const removed = override.removedPhotos ?? []
    const photos = detail.photos.filter((_, index) => !removed.includes(index))
    return {
      id: entry.slug,
      title: entry.title,
      category: entry.category,
      location: entry.location,
      price: entry.price,
      capacity: entry.capacity,
      bookings: 0,
      description: detail.description.join(' '),
      status: 'Publicada',
      ...override,
      photos,
      photoCount: photos.length,
      owner: catalogOwner,
      ownerName: detail.operator.name,
    }
  })
}

export function readAllExperiences() {
  const suffix = ':experiences'
  const fromOperators = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(operatorPrefix) && key.endsWith(suffix)) {
      const owner = key.slice(operatorPrefix.length, key.length - suffix.length)
      if (owner === catalogOwner) continue
      try {
        const list = JSON.parse(localStorage.getItem(key))
        if (Array.isArray(list)) {
          list.forEach((experience) => fromOperators.push({ ...experience, owner, ownerName: 'Operador local' }))
        }
      } catch {
        // Un valor dañado no debe romper el listado del admin.
      }
    }
  }
  return [...fromCatalog(), ...fromOperators]
}

export function updateExperienceOf(owner, experienceId, changes) {
  const key = `${operatorPrefix}${owner}:experiences`
  const stored = localStorage.getItem(key)
  const list = stored === null ? [] : JSON.parse(stored)
  const exists = list.some((item) => String(item.id) === String(experienceId))
  const updated = exists
    ? list.map((item) => (String(item.id) === String(experienceId) ? { ...item, ...changes } : item))
    : [...list, { id: experienceId, ...changes }]
  localStorage.setItem(key, JSON.stringify(updated))
  return readAllExperiences().find((item) => item.owner === owner && String(item.id) === String(experienceId))
}

export function removePhotoOf(owner, experienceId, photoIndex) {
  const current = readAllExperiences().find((item) => item.owner === owner && String(item.id) === String(experienceId))
  if (owner === catalogOwner) {
    // Índice dentro de la lista original de fotos, no de las que quedan visibles.
    const original = getExperienceBySlug(experienceId).photos
    const visible = current.photos.map((photo, position) => ({ photo, position }))
    const target = visible[photoIndex]
    let originalIndex = -1
    let seen = -1
    original.forEach((photo, index) => {
      if (!(current.removedPhotos ?? []).includes(index)) {
        seen += 1
        if (seen === target.position) originalIndex = index
      }
    })
    const overrides = catalogOverrides().find((item) => item.id === experienceId)
    return updateExperienceOf(owner, experienceId, {
      removedPhotos: [...(overrides?.removedPhotos ?? []), originalIndex],
    })
  }
  return updateExperienceOf(owner, experienceId, { photoCount: Math.max(0, (current.photoCount ?? 0) - 1) })
}
