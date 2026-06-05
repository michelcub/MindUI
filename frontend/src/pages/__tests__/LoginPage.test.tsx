import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginPage from '../LoginPage'

const API_BASE = 'http://localhost:8000/api/v1'

const mockUser = {
  id: 1,
  email: 'user@example.com',
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z',
}

const server = setupServer(
  // Default: not authenticated
  http.get(`${API_BASE}/auth/me`, () => new HttpResponse(null, { status: 401 })),
)

beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.resetModules()
})
afterEach(() => server.close())

function renderLoginPage(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div data-testid="home-page">Home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', async () => {
    renderLoginPage()
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })
  })

  it('renders a submit button', async () => {
    renderLoginPage()
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /sign in|login|submit/i })
      expect(btn).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json(mockUser)
      }),
    )
    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/email/i))

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitBtn = screen.getByRole('button', { name: /sign in|login|submit/i })

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.type(passwordInput, 'password123!')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })
  })

  it('shows error message on failed login', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 }),
      ),
    )
    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/email/i))

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    fireEvent.click(screen.getByRole('button', { name: /sign in|login|submit/i }))

    await waitFor(() => {
      const errorEl = screen.getByRole('alert')
      expect(errorEl).toBeInTheDocument()
    })
  })

  it('redirects to "/" on successful login', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () => HttpResponse.json(mockUser)),
    )
    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/email/i))

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123!')
    fireEvent.click(screen.getByRole('button', { name: /sign in|login|submit/i }))

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  it('form remains intact after failed login (does not reset)', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 }),
      ),
    )
    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/email/i))

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'bad')
    fireEvent.click(screen.getByRole('button', { name: /sign in|login|submit/i }))

    await waitFor(() => screen.getByRole('alert'))
    // Form fields should still be there and input should remain
    expect(screen.getByLabelText(/email/i)).toHaveValue('wrong@example.com')
  })
})
