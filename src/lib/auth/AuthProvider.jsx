import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { clearSession, readSession, writeSession } from './session.js'

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const login = useCallback((authResponse) => {
    const { token, ...user } = authResponse
    const nextSession = { token, user }
    writeSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
