import { Roles } from './roles.js'

// Etiqueta y opciones del menú de usuario. Son las mismas en el sitio público
// y en los paneles de admin y operador, para que el menú no cambie según la pantalla.

export function getDisplayName(user) {
  return (
    user?.name ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Usuario'
  )
}

export function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function getUserMenuLabel(user) {
  const name = getDisplayName(user)
  return `${getInitials(name)} · ${name}`
}

export function getUserMenuItems(user) {
  const items = [{ to: '/perfil', label: 'Mi perfil' }]

  if (user?.role === Roles.OPERADOR) {
    items.push(
      { to: '/operador', label: 'Panel de operador' },
      { to: '/operador/configuracion', label: 'Configuración del negocio' },
    )
  }
  if (user?.role === Roles.ADMIN) {
    items.push({ to: '/admin', label: 'Panel de administración' })
  }
  if (user?.role === Roles.OPERADOR || user?.role === Roles.ADMIN) {
    items.push({ to: '/', label: 'Ver sitio' })
  }
  if (user && !user.emailVerified) {
    items.push({ to: '/verify-email', label: 'Verificar correo' })
  }

  return items
}
