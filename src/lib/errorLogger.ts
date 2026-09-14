/**
 * Client-side error logger.
 * In production, errors would be forwarded to a service like Sentry.
 */

interface ErrorLog {
	timestamp: string
	message: string
	stack?: string
	context?: Record<string, unknown>
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
	const message = error instanceof Error ? error.message : String(error)
	const stack = error instanceof Error ? error.stack : undefined

	const log: ErrorLog = {
		timestamp: new Date().toISOString(),
		message,
		stack,
		context,
	}

	console.error('[ErrorLogger]', log)

	// In production, forward to an error reporting service:
	// if (import.meta.env.PROD) {
	//   fetch('/api/errors', { method: 'POST', body: JSON.stringify(log) })
	// }
}
