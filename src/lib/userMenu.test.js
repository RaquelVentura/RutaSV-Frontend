import { describe, expect, it } from 'vitest'
import { getUserMenuItems, getUserMenuLabel } from './userMenu.js'

const labels = (user) => getUserMenuItems(user).map((item) => item.label)

describe('menú de usuario', () => {
  it('arma la etiqueta con iniciales y nombre', () => {
    expect(getUserMenuLabel({ name: 'Cristina Ventura' })).toBe('CV · Cristina Ventura')
  })

  it('ofrece las mismas opciones para el visitante', () => {
    expect(labels({ role: 'VISITANTE', emailVerified: true })).toEqual(['Mi perfil'])
  })

  it('agrega el panel y Ver sitio para el operador', () => {
    expect(labels({ role: 'OPERADOR', emailVerified: true })).toEqual([
      'Mi perfil',
      'Panel de operador',
      'Configuración del negocio',
      'Ver sitio',
    ])
  })

  it('agrega el panel y Ver sitio para el administrador', () => {
    expect(labels({ role: 'ADMIN', emailVerified: true })).toEqual([
      'Mi perfil',
      'Panel de administración',
      'Ver sitio',
    ])
  })

  it('invita a verificar el correo cuando no está verificado', () => {
    expect(labels({ role: 'VISITANTE', emailVerified: false })).toContain('Verificar correo')
  })
})
