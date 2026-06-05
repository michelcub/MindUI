import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const API_BASE = 'http://localhost:8000/api/v1'

const mockUser = {
  id: 1,
  email: 'admin@example.com',
  is_admin: true,
  created_at: '2024-01-01T00:00:00Z',
}

const server = setupServer(
  // Default: /auth/me returns 401 (not authenticated)
  http.get(`${API_BASE}/auth/me`, () => new HttpResponse(null, { status: 401 })),
)

beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.resetModules()
})

afterEach(() => server.close())

// Helper to render the hook with the AuthProvider wrapper
async function renderAuthHook() {
  const { AuthProvider, useAuth } = await import('../AuthContext')
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
  return renderHook(() => useAuth(), { wrapper })
}

describe('AuthContext', () => {
  describe('initial state', () => {
    it('starts with isLoading: true while checking session', async () => {
      // Delay the /auth/me response to observe loading state
      server.use(
        http.get(`${API_BASE}/auth/me`, async () => {
          await new Promise((r) => setTimeout(r, 50))
          return new HttpResponse(null, { status: 401 })
        }),
      )
      const { AuthProvider, useAuth } = await import('../AuthContext')
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.isLoading).toBe(true)
      await waitFor(() => expect(result.current.isLoading).toBe(false))
    })

    it('has no user and is not authenticated when /auth/me returns 401', async () => {
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('restores session when /auth/me returns a valid user', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => HttpResponse.json(mockUser)),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.email).toBe('admin@example.com')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login()', () => {
    it('sets user and isAuthenticated on successful login', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => HttpResponse.json(mockUser)),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('admin@example.com', 'password123!')
      })

      expect(result.current.user?.email).toBe('admin@example.com')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('sets error on login failure (401)', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () =>
          HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 }),
        ),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('wrong@example.com', 'wrongpassword')
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeTruthy()
    })

    it('sets error on rate limit (429)', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () =>
          HttpResponse.json({ detail: 'Too many requests' }, { status: 429 }),
        ),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login('user@example.com', 'password')
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout()', () => {
    it('clears user and isAuthenticated on logout', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => HttpResponse.json(mockUser)),
        http.post(`${API_BASE}/auth/logout`, () => HttpResponse.json({ message: 'logged out' })),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('clears user even if logout request fails', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => HttpResponse.json(mockUser)),
        http.post(`${API_BASE}/auth/logout`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

      await act(async () => {
        await result.current.logout()
      })

      // Even on network error, local state should be cleared
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('useAuth() outside AuthProvider', () => {
    it('throws an error when used outside AuthProvider', async () => {
      const { useAuth } = await import('../AuthContext')
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => renderHook(() => useAuth())).toThrow()
      consoleSpy.mockRestore()
    })
  })

  describe('User Zod validation', () => {
    it('rejects malformed user data from /auth/me', async () => {
      server.use(
        // Missing required fields
        http.get(`${API_BASE}/auth/me`, () =>
          HttpResponse.json({ invalid: 'data' }),
        ),
      )
      const { result } = await renderAuthHook()
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      // Invalid data should result in null user, not a crash
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
