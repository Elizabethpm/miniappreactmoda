import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar token al montar
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await authService.getMe()
        setUser(me)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: loggedUser, token } = await authService.login(credentials)
    localStorage.setItem('token', token)
    setUser(loggedUser)
    return loggedUser
  }, [])

  const register = useCallback(async (data) => {
    const { user: newUser, token } = await authService.register(data)
    localStorage.setItem('token', token)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    const { user: updated } = await authService.updateProfile(data)
    setUser(updated)
    return updated
  }, [])

  const refreshUser = useCallback(() => {
    return authService.getMe().then(me => { setUser(me); return me })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
