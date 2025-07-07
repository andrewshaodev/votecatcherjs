'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getErrorFromUrl, logError, type ErrorInfo } from '@/utils/error-handler'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)

  useEffect(() => {
    // Capture error information from URL parameters
    const error = getErrorFromUrl(searchParams)
    setErrorInfo(error)

    // Log error for debugging and monitoring
    logError(error)
  }, [searchParams])

  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>

          {errorInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Details:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Message:</strong> {errorInfo.message}</p>
                {errorInfo.code && <p><strong>Code:</strong> {errorInfo.code}</p>}
                {errorInfo.details && <p><strong>Details:</strong> {errorInfo.details}</p>}
                <p><strong>Time:</strong> {new Date(errorInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Go Home
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>If this problem persists, please contact support.</p>
            {errorInfo && (
              <p className="mt-2">
                Error ID: {errorInfo.timestamp}-{Math.random().toString(36).substr(2, 9)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}