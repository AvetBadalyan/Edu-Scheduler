/**
 * AuthStore — authentication state for the frontend.
 *
 * This portfolio build runs entirely in the browser, so authentication is
 * mocked against a demo account (see DEMO_CREDENTIALS). The store keeps the
 * same shape and async API a real backend integration would use, so swapping
 * in the Express + JWT server under `/server` only means replacing the bodies
 * of `login` / `logout` / `checkAuth` with calls to `@/lib/api/apiClient`.
 *
 * The session flag is kept in sessionStorage so a page refresh during the demo
 * does not log the user out. A real token would live in memory only (see
 * `@/lib/api/tokenStorage`) to reduce XSS exposure.
 */
import type { LoginResult, User } from '@/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ─── Demo account ─────────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS = {
	email: 'demo@education.app',
	password: 'demo1234'
} as const

const DEMO_USER: User = {
	id: 'demo-user',
	email: DEMO_CREDENTIALS.email,
	name: 'Demo Admin',
	createdAt: new Date('2024-01-01T00:00:00Z')
}

const SESSION_KEY = 'em.session'

function persistSession(active: boolean): void {
	try {
		if (active) sessionStorage.setItem(SESSION_KEY, '1')
		else sessionStorage.removeItem(SESSION_KEY)
	} catch {
		/* sessionStorage may be unavailable (private mode) — ignore */
	}
}

function hasPersistedSession(): boolean {
	try {
		return sessionStorage.getItem(SESSION_KEY) === '1'
	} catch {
		return false
	}
}

// Simulate network latency so loading states are visible in the demo.
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ─── AuthStore interface ──────────────────────────────────────────────────────

interface AuthStore {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	login: (credentials: {
		email: string
		password: string
	}) => Promise<LoginResult>
	logout: () => Promise<void>
	checkAuth: () => void
	clearError: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
	devtools(
		set => ({
			user: hasPersistedSession() ? DEMO_USER : null,
			isAuthenticated: hasPersistedSession(),
			isLoading: false,
			error: null,

			login: async ({ email, password }) => {
				set({ isLoading: true, error: null })
				await wait(400)

				const ok =
					email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
					password === DEMO_CREDENTIALS.password

				if (!ok) {
					set({ isLoading: false, error: 'Invalid email or password.' })
					return { success: false, error: 'invalid_credentials' }
				}

				persistSession(true)
				set({
					user: DEMO_USER,
					isAuthenticated: true,
					isLoading: false,
					error: null
				})
				return { success: true }
			},

			logout: async () => {
				set({ isLoading: true })
				await wait(150)
				persistSession(false)
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null
				})
			},

			checkAuth: () => {
				const active = hasPersistedSession()
				set({ user: active ? DEMO_USER : null, isAuthenticated: active })
			},

			clearError: () => set({ error: null })
		}),
		{ name: 'AuthStore' }
	)
)
