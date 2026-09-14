/**
 * ErrorBoundary — catches and handles unexpected React errors.
 *
 * Shows a friendly error page with a retry option.
 * Logs errors via the error logger.
 *
 * Requirements: 14.5, 14.6
 */
import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { logError } from "@/lib/errorLogger"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error, { componentStack: info.componentStack ?? undefined })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex min-h-screen items-center justify-center bg-gray-50 px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center">
            <div className="text-4xl mb-4" aria-hidden>⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              An unexpected error occurred. Our team has been notified.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mb-4 rounded border bg-gray-100 p-3 text-left text-xs text-red-700 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleRetry} className="w-full">
              Reload page
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
