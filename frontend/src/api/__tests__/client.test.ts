import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const API_BASE = 'http://localhost:8000/api/v1'

const server = setupServer()

beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.resetModules()
})

afterEach(() => server.close())

describe('apiClient — cookie-based auth', () => {
  it('has withCredentials: true by default', async () => {
    const { default: apiClient } = await import('../client')
    expect(apiClient.defaults.withCredentials).toBe(true)
  })

  it('does NOT set Authorization header (no localStorage logic)', async () => {
    let authHeader: string | null = null
    server.use(
      http.get(`${API_BASE}/auth/me`, ({ request }) => {
        authHeader = request.headers.get('Authorization')
        return HttpResponse.json({ id: 1, email: 'test@example.com', is_admin: false })
      }),
    )
    const { default: apiClient } = await import('../client')
    await apiClient.get('/auth/me')
    // No Bearer token should be added — cookies are managed by the browser/http layer
    expect(authHeader).toBeNull()
  })

  it('attempts token refresh on 401 and retries the original request', async () => {
    let protectedCallCount = 0
    let refreshCalled = false
    server.use(
      http.get(`${API_BASE}/protected`, () => {
        protectedCallCount++
        if (protectedCallCount === 1) {
          return new HttpResponse(null, { status: 401 })
        }
        return HttpResponse.json({ data: 'protected-content' })
      }),
      http.post(`${API_BASE}/auth/refresh`, () => {
        refreshCalled = true
        return HttpResponse.json({ message: 'refreshed' })
      }),
    )
    const { default: apiClient } = await import('../client')
    const response = await apiClient.get('/protected')
    expect(refreshCalled).toBe(true)
    expect(response.data).toEqual({ data: 'protected-content' })
    expect(protectedCallCount).toBe(2)
  })

  it('does not retry if the refresh endpoint itself returns 401 (infinite loop guard)', async () => {
    server.use(
      http.get(`${API_BASE}/protected`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API_BASE}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    )
    const { default: apiClient } = await import('../client')
    await expect(apiClient.get('/protected')).rejects.toMatchObject({
      response: { status: 401 },
    })
  })

  it('does not retry an already-retried request to avoid duplicate refreshes', async () => {
    let protectedCallCount = 0
    server.use(
      http.get(`${API_BASE}/protected`, () => {
        protectedCallCount++
        return new HttpResponse(null, { status: 401 })
      }),
      http.post(`${API_BASE}/auth/refresh`, () => HttpResponse.json({ message: 'ok' })),
    )
    const { default: apiClient } = await import('../client')
    await expect(apiClient.get('/protected')).rejects.toBeTruthy()
    // protected should have been called at most twice (original + one retry)
    expect(protectedCallCount).toBeLessThanOrEqual(2)
  })
})
