import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../api/client'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
})

type RegisterFormValues = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading } = useAuth()

  const [formValues, setFormValues] = useState<RegisterFormValues>({
    email: '',
    name: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [registrationClosed, setRegistrationClosed] = useState(false)

  // Check if registration is open
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await apiClient.get('/auth/registration-open')
        if (!response.data.open) {
          setRegistrationClosed(true)
        }
      } catch {
        setRegistrationClosed(true)
      }
    }
    checkRegistration()
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const parsed = RegisterSchema.safeParse(formValues)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setSubmitting(true)
    try {
      await register(formValues.email, formValues.name, formValues.password)
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

  if (registrationClosed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('header.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.registrationClosed')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('auth.signIn')}
          </button>
        </div>
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
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('auth.registerSubtitle')}
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

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('auth.name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formValues.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
              placeholder="John Doe"
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
              autoComplete="new-password"
              required
              value={formValues.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
              placeholder="••••••••"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('auth.passwordRequirements')}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {submitting ? t('auth.registering') : t('auth.register')}
          </button>

          {/* Link to login */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.haveAccount')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('auth.signIn')}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
