import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ProtectedRoute from '../ProtectedRoute'

const API_BASE = 'http://localhost:8000/api/v1'

const mockUser = {
  id: 1,
  email: 'user@example.com',
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z',
}

const server = setupServer(
  http.get(`${API_BASE}/auth/me`, () => new HttpResponse(null, { status: 401 })),
)

beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.resetModules()
})
afterEach(() => server.close())

function renderWithAuth(authenticated: boolean) {
  if (authenticated) {
    server.use(
      http.get(`${API_BASE}/auth/me`, () => HttpResponse.json(mockUser)),
    )
  }

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows loading state while auth is being determined', () => {
    // Auth check not resolved yet
    server.use(
      http.get(`${API_BASE}/auth/me`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return new HttpResponse(null, { status: 401 })
      }),
    )
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    // Should show loading, not redirect yet
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('redirects to /login if not authenticated', async () => {
    renderWithAuth(false)
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders children if authenticated', async () => {
    renderWithAuth(true)
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})
