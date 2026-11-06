/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const roleClaimKey =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

const defaultAuthContext = {
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  markEmailAsVerified: () => {},
  refreshSession: async () => null,
}

export const AuthContext = createContext(defaultAuthContext)

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  try {
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    )
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const jsonPayload = new TextDecoder('utf-8').decode(bytes)
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function extractUserFromToken(token) {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null
  }

  const firstName = payload.given_name ?? payload.firstName ?? ''
  const lastName = payload.family_name ?? payload.lastName ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const role = payload[roleClaimKey] ?? payload.role ?? null
  const emailVerified =
    payload.email_verified === true ||
    payload.email_verified === 'true' ||
    payload.emailVerified === true

  return {
    ...payload,
    id: payload.sub ?? payload.id ?? null,
    sub: payload.sub ?? payload.id ?? null,
    email: payload.email ?? null,
    given_name: firstName,
    family_name: lastName,
    firstName,
    lastName,
    name: fullName || payload.name || payload.email || '',
    fullName,
    role,
    emailVerified,
  }
}

function getInitialUser() {
  try {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      return null
    }

    const decodedUser = extractUserFromToken(storedToken)
    if (!decodedUser) {
      localStorage.removeItem('token')
      return null
    }

    return decodedUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

  const login = useCallback((tokenOrData) => {
    const token =
      typeof tokenOrData === 'string' ? tokenOrData : tokenOrData?.token

    const decodedUser = extractUserFromToken(token)
    if (!decodedUser) {
      localStorage.removeItem('token')
      setUser(null)
      return null
    }

    localStorage.setItem('token', token)
    setUser(decodedUser)
    return decodedUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const markEmailAsVerified = useCallback(
    (newToken) => {
      if (newToken && typeof newToken === 'string') {
        const updated = login(newToken)
        if (updated) {
          return updated
        }
      }

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              emailVerified: true,
              email_verified: true,
            }
          : null,
      )
      return null
    },
    [login],
  )

  const refreshSession = useCallback(
    async (fallbackRole = null) => {
      const storedToken =
        typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
      if (!storedToken) {
        return null
      }

      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.token) {
            return login(data.token)
          }
        }
      } catch {
        // Fallback when running in offline or unit test environment
      }

      if (fallbackRole) {
        setUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                role: fallbackRole,
                [roleClaimKey]: fallbackRole,
              }
            : null,
        )
      }

      return null
    },
    [login],
  )

  useEffect(() => {
    const storedToken =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (!storedToken) {
      return undefined
    }

    const initialSyncTimer = setTimeout(() => {
      refreshSession()
    }, 0)

    function handleFocus() {
      refreshSession()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(initialSyncTimer)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshSession])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      markEmailAsVerified,
      refreshSession,
    }),
    [user, login, logout, markEmailAsVerified, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider')
  }
  return context
}
