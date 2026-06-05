import React, { createContext, useContext, useEffect, useState } from 'react'
import { z } from 'zod'
import apiClient from '../api/client'

// --- Zod schema for User validation ---
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  is_admin: z.boolean(),
  created_at: z.string(),
})

export type User = z.infer<typeof UserSchema>

// --- Auth state shape ---
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// --- Context value shape ---
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// --- Context ---
const AuthContext = createContext<AuthContextValue | null>(null)

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  // On mount: try to restore session from cookie via GET /auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await apiClient.get('/auth/me')
        const parsed = UserSchema.safeParse(response.data)
        if (parsed.success) {
          setState({
            user: parsed.data,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false, error: null })
        }
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false, error: null })
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setState((prev) => ({ ...prev, error: null }))
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const parsed = UserSchema.safeParse(response.data)
      if (parsed.success) {
        setState({ user: parsed.data, isLoading: false, isAuthenticated: true, error: null })
      } else {
        setState((prev) => ({
          ...prev,
          error: 'auth.invalidResponse',
          isAuthenticated: false,
          user: null,
        }))
      }
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      }))
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Even on network error, clear local state
    } finally {
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null })
    }
  }

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook ---
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

// --- Helpers ---
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { detail?: string }; status?: number } }
    if (axiosErr.response?.status === 429) {
      return 'auth.rateLimited'
    }
    if (axiosErr.response?.data?.detail) {
      return axiosErr.response.data.detail
    }
  }
  return 'auth.genericError'
}
