import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

// --- Zod schema for login form ---
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type LoginFormValues = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading, error } = useAuth()

  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Sync auth context error to local form error
  useEffect(() => {
    if (error) {
      const translationKey = `auth.${error}`
      // Try to translate known error keys; fall back to the raw error string
      const knownKeys = ['invalidResponse', 'rateLimited', 'genericError']
      const isKnown = knownKeys.some((k) => error === `auth.${k}` || error === k)
      if (isKnown) {
        setFormError(t(translationKey) ?? error)
      } else {
        setFormError(error)
      }
    } else {
      setFormError(null)
    }
  }, [error, t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const parsed = LoginSchema.safeParse(formValues)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setSubmitting(true)
    try {
      await login(formValues.email, formValues.password)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">{t('auth.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('header.title')}
          </h1>
          <h2 className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-md dark:bg-gray-800"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Error alert */}
          {formError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
            >
              {formError}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formValues.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formValues.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
