import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  clearAuthSession,
  getAuthenticatedAdmin,
  getCurrentAuthToken,
  loginAdmin,
  registerAdmin,
  saveAuthSession,
} from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const clearSessionState = useCallback(() => {
    clearAuthSession()
    setAdmin(null)
    setRestaurant(null)
  }, [])

  const refreshSession = useCallback(async (options = {}) => {
    const data = await getAuthenticatedAdmin(options)
    setAdmin(data.admin)
    setRestaurant(data.restaurant)
    return data
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadSession() {
      const token = getCurrentAuthToken()
      if (!token) {
        setIsInitializing(false)
        return
      }

      try {
        await refreshSession({ signal: controller.signal })
      } catch (error) {
        if (error.name !== 'AbortError') {
          clearSessionState()
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false)
        }
      }
    }

    loadSession()

    return () => controller.abort()
  }, [clearSessionState, refreshSession])

  const login = useCallback(async (payload) => {
    const data = await loginAdmin(payload)
    saveAuthSession(data.token)
    setAdmin(data.admin)
    setRestaurant(data.restaurant)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerAdmin(payload)
    saveAuthSession(data.token)
    setAdmin(data.admin)
    setRestaurant(data.restaurant)
    return data
  }, [])

  const logout = useCallback(() => {
    clearSessionState()
  }, [clearSessionState])

  const value = useMemo(
    () => ({
      admin,
      restaurant,
      isAuthenticated: Boolean(admin),
      isInitializing,
      login,
      logout,
      refreshSession,
      register,
    }),
    [admin, isInitializing, login, logout, refreshSession, register, restaurant],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
