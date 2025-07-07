export interface ErrorInfo {
  message: string
  code?: string
  details?: string
  timestamp: string
  url?: string
  userAgent?: string
  referrer?: string
}

export function logError(error: ErrorInfo) {
  // Log to console for development
  console.error('Application Error:', {
    ...error,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined
  })

  // In production, you could send this to an error tracking service
  // Example: sendToErrorTrackingService(error)
  
  // You could also log to your own API endpoint
  // Example: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(error) })
}

export function createErrorUrl(baseUrl: string, error: {
  message: string
  code?: string | number
  details?: string
}) {
  const errorUrl = new URL('/error', baseUrl)
  errorUrl.searchParams.set('error', error.message)
  if (error.code) {
    errorUrl.searchParams.set('code', error.code.toString())
  }
  if (error.details) {
    errorUrl.searchParams.set('details', error.details)
  }
  return errorUrl.toString()
}

export function getErrorFromUrl(searchParams: URLSearchParams): ErrorInfo {
  return {
    message: searchParams.get('error') || 'An unexpected error occurred',
    code: searchParams.get('code') || undefined,
    details: searchParams.get('details') || undefined,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }
} 