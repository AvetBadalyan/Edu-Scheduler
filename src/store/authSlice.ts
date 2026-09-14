/**
 * authSlice — session authentication state.
 *
 * Two modes:
 *   1. Demo mode — login with DEMO_CREDENTIALS uses local fake auth
 *      (works offline, no Supabase required)
 *   2. Authenticated mode — any other credentials go through Supabase Auth
 *      (supabase.auth.signInWithPassword / signUp / signOut)
 *
 * onAuthStateChange listener keeps Redux in sync with the Supabase session
 * so browser refreshes and tab switches don't log the user out.
 */
import { supabase } from '@/lib/supabase'
import type { LoginResult, User } from '@/types'
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

// ─── Demo credentials ─────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS = {
  email:    'demo@education.app',
  password: 'demo1234',
} as const

export const DEMO_USER: User = {
  id:        'demo-user',
  email:     DEMO_CREDENTIALS.email,
  name:      'Demo Admin',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

const isDemoCredentials = (email: string, password: string) =>
  email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
  password === DEMO_CREDENTIALS.password

// ─── Session persistence (demo only) ─────────────────────────────────────────

const SESSION_KEY = 'em.session'

function persistDemoSession(active: boolean) {
  try {
    active
      ? sessionStorage.setItem(SESSION_KEY, '1')
      : sessionStorage.removeItem(SESSION_KEY)
  } catch { /* private/incognito mode */ }
}

function hasDemoSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: LoginResult['error'] }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  // Demo mode — no Supabase call needed
  if (isDemoCredentials(email, password)) {
    await wait(400)
    persistDemoSession(true)
    return DEMO_USER
  }

  // Authenticated mode — Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return rejectWithValue('invalid_credentials')

  return {
    id:        data.user.id,
    email:     data.user.email ?? email,
    name:      (data.user.user_metadata?.name as string) ?? email.split('@')[0],
    createdAt: new Date(data.user.created_at),
  } satisfies User
})

export const signUpThunk = createAsyncThunk<
  User,
  { email: string; password: string; name: string },
  { rejectValue: string }
>('auth/signUp', async ({ email, password, name }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) return rejectWithValue(error.message)
  if (!data.user) return rejectWithValue('Sign-up failed. Please try again.')

  return {
    id:        data.user.id,
    email:     data.user.email ?? email,
    name,
    createdAt: new Date(data.user.created_at),
  } satisfies User
})

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  persistDemoSession(false)
  await supabase.auth.signOut()
})

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user:            User | null
  isAuthenticated: boolean
  isLoading:       boolean
  error:           string | null
}

const initialState: AuthState = {
  user:            hasDemoSession() ? DEMO_USER : null,
  isAuthenticated: hasDemoSession(),
  isLoading:       false,
  error:           null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    /** Called by the Supabase onAuthStateChange listener to hydrate state. */
    setSessionUser(state, action: PayloadAction<User | null>) {
      state.user            = action.payload
      state.isAuthenticated = action.payload !== null
    },
  },
  extraReducers: builder => {
    // login
    builder
      .addCase(loginThunk.pending, state => {
        state.isLoading = true
        state.error     = null
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading       = false
        state.user            = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading       = false
        state.error           = 'Invalid email or password.'
        state.isAuthenticated = false
        void action.payload
      })

    // sign up
    builder
      .addCase(signUpThunk.pending, state => {
        state.isLoading = true
        state.error     = null
      })
      .addCase(signUpThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading       = false
        state.user            = action.payload
        state.isAuthenticated = true
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload ?? 'Sign-up failed.'
      })

    // logout
    builder
      .addCase(logoutThunk.pending, state => {
        state.isLoading = true
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.isLoading       = false
        state.user            = null
        state.isAuthenticated = false
        state.error           = null
      })
  },
})

export const { clearError, setSessionUser } = authSlice.actions
export default authSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

import type { RootState } from './index'
export const selectUser            = (s: RootState) => s.auth.user
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated
export const selectAuthLoading     = (s: RootState) => s.auth.isLoading
export const selectAuthError       = (s: RootState) => s.auth.error
/** True when the current session belongs to the built-in demo account. */
export const selectIsDemoMode      = (s: RootState) => s.auth.user?.id === DEMO_USER.id
