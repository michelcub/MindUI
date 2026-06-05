import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />
  }

  return <>{children}</>
}
