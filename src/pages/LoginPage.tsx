/**
 * LoginPage — sign in or sign up.
 */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	DEMO_CREDENTIALS,
	clearError,
	loginThunk,
	selectAuthError,
	selectAuthLoading,
	selectIsAuthenticated,
	signUpThunk
} from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { CalendarDays, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface LocationState { from?: { pathname: string } }
type Tab = 'signin' | 'signup'

/** Password input with show/hide toggle */
function PasswordInput({
	id, value, onChange, autoComplete, 'aria-invalid': ariaInvalid,
	'aria-describedby': ariaDescribedBy, placeholder, required,
}: {
	id: string; value: string; onChange: (v: string) => void
	autoComplete?: string; 'aria-invalid'?: boolean
	'aria-describedby'?: string; placeholder?: string; required?: boolean
}) {
	const [show, setShow] = useState(false)
	return (
		<div className="relative">
			<Input
				id={id}
				type={show ? 'text' : 'password'}
				autoComplete={autoComplete}
				value={value}
				onChange={e => onChange(e.target.value)}
				aria-invalid={ariaInvalid}
				aria-describedby={ariaDescribedBy}
				placeholder={placeholder}
				required={required}
				className="pr-10"
			/>
			<button
				type="button"
				tabIndex={-1}
				onClick={() => setShow(s => !s)}
				aria-label={show ? 'Hide password' : 'Show password'}
				className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
			>
				{show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
			</button>
		</div>
	)
}

export default function LoginPage() {
	const dispatch        = useAppDispatch()
	const navigate        = useNavigate()
	const location        = useLocation()
	const isAuthenticated = useAppSelector(selectIsAuthenticated)
	const isLoading       = useAppSelector(selectAuthLoading)
	const error           = useAppSelector(selectAuthError)

	const [tab,      setTab]      = useState<Tab>('signin')
	const [email,    setEmail]    = useState<string>(DEMO_CREDENTIALS.email)
	const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password)
	const [name,     setName]     = useState('')
	const [confirm,  setConfirm]  = useState('')

	const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/dashboard'

	useEffect(() => {
		if (isAuthenticated) navigate(redirectTo, { replace: true })
	}, [isAuthenticated, navigate, redirectTo])

	const switchTab = (t: Tab) => {
		dispatch(clearError())
		setTab(t)
		if (t === 'signin') { setEmail(DEMO_CREDENTIALS.email); setPassword(DEMO_CREDENTIALS.password) }
		else { setEmail(''); setPassword('') }
	}

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault(); dispatch(clearError()); dispatch(loginThunk({ email, password }))
	}

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault(); dispatch(clearError())
		if (password !== confirm) return
		dispatch(signUpThunk({ email, password, name }))
	}

	const passwordMismatch = tab === 'signup' && confirm.length > 0 && password !== confirm

	return (
		<main id="main-content" className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 px-4 py-10">
			<div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
				{/* Brand */}
				<div className="mb-6 flex flex-col items-center text-center">
					<span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<CalendarDays className="size-6" aria-hidden />
					</span>
					<h1 className="text-xl font-bold">Education Manager</h1>
					<p className="mt-1 text-sm text-muted-foreground">Build and manage class schedules</p>
				</div>

				{/* Tabs */}
				<div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="tablist">
					{(['signin', 'signup'] as Tab[]).map(t => (
						<button key={t} role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
							className={`rounded-md py-1.5 text-sm font-medium transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
							{t === 'signin' ? 'Sign in' : 'Sign up'}
						</button>
					))}
				</div>

				{/* Sign in */}
				{tab === 'signin' && (
					<form onSubmit={handleSignIn} className="flex flex-col gap-4" noValidate>
						<div className="flex flex-col gap-1">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" autoComplete="username" value={email}
								onChange={e => setEmail(e.target.value)} aria-invalid={!!error} required />
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="password">Password</Label>
							<PasswordInput id="password" value={password} onChange={setPassword}
								autoComplete="current-password" aria-invalid={!!error}
								aria-describedby={error ? 'auth-error' : undefined} required />
						</div>
						{error && <p id="auth-error" className="text-sm text-destructive" role="alert">{error}</p>}
						<Button type="submit" disabled={isLoading} className="mt-1 w-full">
							{isLoading ? 'Signing in…' : 'Sign in'}
						</Button>
					</form>
				)}

				{/* Sign up */}
				{tab === 'signup' && (
					<form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
						<div className="flex flex-col gap-1">
							<Label htmlFor="su-name">Full name</Label>
							<Input id="su-name" type="text" autoComplete="name" value={name}
								onChange={e => setName(e.target.value)} required />
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="su-email">Email</Label>
							<Input id="su-email" type="email" autoComplete="username" value={email}
								onChange={e => setEmail(e.target.value)} aria-invalid={!!error} required />
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="su-password">Password</Label>
							<PasswordInput id="su-password" value={password} onChange={setPassword}
								autoComplete="new-password" aria-invalid={!!error}
								aria-describedby="pw-hint" required />
							<p id="pw-hint" className="text-xs text-muted-foreground">
								8+ characters, uppercase, lowercase, and a number
							</p>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="su-confirm">Confirm password</Label>
							<PasswordInput id="su-confirm" value={confirm} onChange={setConfirm}
								autoComplete="new-password" aria-invalid={passwordMismatch}
								aria-describedby={passwordMismatch ? 'pw-mismatch' : undefined} required />
							{passwordMismatch && (
								<p id="pw-mismatch" className="text-xs text-destructive" role="alert">Passwords don't match</p>
							)}
						</div>
						{error && <p id="auth-error" className="text-sm text-destructive" role="alert">{error}</p>}
						<Button type="submit" disabled={isLoading || passwordMismatch} className="mt-1 w-full">
							{isLoading ? 'Creating account…' : 'Create account'}
						</Button>
					</form>
				)}

				{tab === 'signin' && (
					<p className="mt-6 rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
						Demo credentials are pre-filled — just click <strong>Sign in</strong>.
					</p>
				)}
			</div>
		</main>
	)
}
