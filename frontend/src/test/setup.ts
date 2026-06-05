import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

// Initialize i18n with inline resources for tests (no HTTP backend)
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common: {
          header: {
            title: 'AI Studio',
            subtitle: 'Your AI-powered workspace',
          },
          common: {
            loading: 'Loading...',
            error: 'An error occurred',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            back: 'Back',
            next: 'Next',
            previous: 'Previous',
            confirm: 'Confirm',
            close: 'Close',
          },
          language: {
            en: 'English',
            es: 'Español',
          },
          auth: {
            email: 'Email',
            password: 'Password',
            signIn: 'Sign In',
            signingIn: 'Signing in...',
            loginTitle: 'Sign in to AI Studio',
            loginSubtitle: 'Enter your credentials to continue',
            invalidResponse: 'Invalid server response',
            rateLimited: 'Too many attempts. Please wait before trying again.',
            genericError: 'Login failed. Please try again.',
            loading: 'Loading...',
          },
        },
      },
    },
  })
}

afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
