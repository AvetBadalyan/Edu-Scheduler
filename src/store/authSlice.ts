/**
 * authSlice — session authentication state.
 *
 * Login/logout are async thunks (simulated for demo; swap bodies for real API).
 * Session is persisted in sessionStorage so a refresh doesn't log you out.
 */
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginResult, User } from '@/types'

// ─── Demo credentials ─────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS = {
	email: 'demo@education.app',
	password: 'demo1234',
} as const

const DEMO_USER: User = {
	id: 'demo-user',
	email: DEMO_CREDENTIALS.email,
	name: 'Demo Admin',
	createdAt: new Date('2024-01-01T00:00:00Z'),
}

// ─── Session persistence ──────────────────────────────────────────────────────

const SESSION_KEY = 'em.session'

function persistSession(active: boolean) {
	try {
		active
			? sessionStorage.setItem(SESSION_KEY, '1')
			: sessionStorage.removeItem(SESSION_KEY)
	} catch { /* private/incognito mode */ }
}

function hasPersistedSession(): boolean {
	try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk<
	User,                                          // fulfilled payload
	{ email: string; password: string },           // argument
	{ rejectValue: LoginResult['error'] }          // rejectWithValue type
>(
	'auth/login',
	async ({ email, password }, { rejectWithValue }) => {
		await wait(400) // simulate network
		const ok =
			email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
			password === DEMO_CREDENTIALS.password
		if (!ok) return rejectWithValue('invalid_credentials')
		persistSession(true)
		return DEMO_USER
	}
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
	await wait(150)
	persistSession(false)
})

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
}

const initialState: AuthState = {
	user: hasPersistedSession() ? DEMO_USER : null,
	isAuthenticated: hasPersistedSession(),
	isLoading: false,
	error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearError(state) {
			state.error = null
		},
		checkAuth(state) {
			const active = hasPersistedSession()
			state.user = active ? DEMO_USER : null
			state.isAuthenticated = active
		},
	},
	extraReducers: builder => {
		// login
		builder
			.addCase(loginThunk.pending, state => {
				state.isLoading = true
				state.error = null
			})
			.addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
				state.isLoading = false
				state.user = action.payload
				state.isAuthenticated = true
			})
			.addCase(loginThunk.rejected, (state, action) => {
				state.isLoading = false
				state.error = 'Invalid email or password.'
				state.isAuthenticated = false
				// action.payload is 'invalid_credentials' | 'account_locked' | 'session_expired'
				void action.payload
			})

		// logout
		builder
			.addCase(logoutThunk.pending, state => { state.isLoading = true })
			.addCase(logoutThunk.fulfilled, state => {
				state.isLoading = false
				state.user = null
				state.isAuthenticated = false
				state.error = null
			})
	},
})

export const { clearError, checkAuth } = authSlice.actions
export default authSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

import type { RootState } from './index'
export const selectUser            = (s: RootState) => s.auth.user
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated
export const selectAuthLoading     = (s: RootState) => s.auth.isLoading
export const selectAuthError       = (s: RootState) => s.auth.error
