/**
 * LoginPage — demo authentication entry point.
 *
 * Authenticates against the demo account (see authStore) and redirects to the
 * originally requested route, or the dashboard. Demo credentials are shown
 * on screen so the app is instantly explorable.
 */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_CREDENTIALS, useAuthStore } from '@/stores/authStore'
import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface LocationState {
	from?: { pathname: string }
}

export default function LoginPage() {
	const navigate = useNavigate()
	const location = useLocation()
	const { login, isAuthenticated, isLoading, error, clearError } =
		useAuthStore()

	const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email)
	const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password)

	const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/'

	// If already signed in, skip the login screen.
	useEffect(() => {
		if (isAuthenticated) navigate(redirectTo, { replace: true })
	}, [isAuthenticated, navigate, redirectTo])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		clearError()
		const result = await login({ email, password })
		if (result.success) navigate(redirectTo, { replace: true })
	}

	return (
		<main
			id="main-content"
			className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 px-4 py-10"
		>
			<div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
				<div className="mb-6 flex flex-col items-center text-center">
					<span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<CalendarDays
							className="size-6"
							aria-hidden
						/>
					</span>
					<h1 className="text-xl font-bold">Education Manager</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Sign in to build and manage class schedules
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-4"
					noValidate
				>
					<div className="flex flex-col gap-1">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							autoComplete="username"
							value={email}
							onChange={e => setEmail(e.target.value)}
							aria-invalid={!!error}
							required
						/>
					</div>

					<div className="flex flex-col gap-1">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							aria-invalid={!!error}
							aria-describedby={error ? 'login-error' : undefined}
							required
						/>
					</div>

					{error && (
						<p
							id="login-error"
							className="text-sm text-destructive"
							role="alert"
						>
							{error}
						</p>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						className="mt-1 w-full"
					>
						{isLoading ? 'Signing in…' : 'Sign in'}
					</Button>
				</form>

				<p className="mt-6 rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
					Demo account is pre-filled — just click <strong>Sign in</strong>.
				</p>
			</div>
		</main>
	)
}
