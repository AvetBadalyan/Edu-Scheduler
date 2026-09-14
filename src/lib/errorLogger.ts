/**
 * Client-side error logger.
 * In production, errors would be sent to a service like Sentry.
 * Requirements: 14.5
 */

interface ErrorLog {
  timestamp: string
  message: string
  stack?: string
  context?: Record<string, unknown>
}

const errorLogs: ErrorLog[] = []

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    message,
    stack,
    context,
  }

  errorLogs.push(log)
  console.error("[ErrorLogger]", log)

  // In production, send to error reporting service:
  // if (import.meta.env.PROD) {
  //   fetch('/api/errors', { method: 'POST', body: JSON.stringify(log) })
  // }
}

export function getErrorLogs(): ErrorLog[] {
  return [...errorLogs]
}
