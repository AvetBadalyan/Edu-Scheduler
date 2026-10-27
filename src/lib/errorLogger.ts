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

	if (import.meta.env.DEV) {
		// Full detail (including stack) only in development.
		console.error('[ErrorLogger]', log)
	} else {
		// In production, keep the console clean — log just the message, and
		// forward to an error reporting service here (e.g. Sentry).
		console.error('[ErrorLogger]', message)
		// fetch('/api/errors', { method: 'POST', body: JSON.stringify(log) })
	}
}
