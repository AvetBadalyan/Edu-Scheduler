/**
 * ProtectedRoute — gates protected pages behind authentication.
 *
 * Checks Redux auth state (which covers both demo sessions and Supabase
 * sessions synced via onAuthStateChange in App.tsx).
 * Shows a brief loading spinner while a Supabase session is being restored
 * on initial load to avoid a flash-redirect to /login.
 */
import { supabase } from '@/lib/supabase'
import { mapSupabaseUser, selectIsAuthenticated, setSessionUser } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
	const isAuthenticated = useAppSelector(selectIsAuthenticated)
	const location = useLocation()
	const dispatch = useAppDispatch()
	const [checking, setChecking] = useState(!isAuthenticated)

	useEffect(() => {
		// If Redux already has an authenticated user (demo or previously-verified
		// Supabase session) there's nothing to restore — `checking` already
		// starts false in that case, so we skip the network call entirely.
		if (isAuthenticated) return

		// Try to restore a Supabase session from storage on first load.
		// setChecking runs inside the promise callback, not in the effect body.
		supabase.auth
			.getSession()
			.then(({ data }) => {
				if (data.session?.user) {
					dispatch(setSessionUser(mapSupabaseUser(data.session.user)))
				}
			})
			.finally(() => setChecking(false))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (checking) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div
					className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"
					aria-label="Checking session…"
				/>
			</div>
		)
	}

	if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

	return <Outlet />
}
