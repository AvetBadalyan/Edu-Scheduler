/**
 * ProtectedRoute — gates protected pages behind authentication.
 *
 * Checks Redux auth state (which covers both demo sessions and Supabase
 * sessions synced via onAuthStateChange in App.tsx).
 * Shows a brief loading spinner while a Supabase session is being restored
 * on initial load to avoid a flash-redirect to /login.
 */
import { supabase } from '@/lib/supabase'
import { setSessionUser } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/authSlice'
import type { User } from '@/types'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
	const isAuthenticated = useAppSelector(selectIsAuthenticated)
	const location = useLocation()
	const dispatch = useAppDispatch()
	const [checking, setChecking] = useState(!isAuthenticated)

	useEffect(() => {
		// If Redux already has an authenticated user (demo or previously-verified
		// Supabase session) we don't need to hit the network.
		if (isAuthenticated) {
			setChecking(false)
			return
		}

		// Try to restore a Supabase session from storage on first load
		supabase.auth
			.getSession()
			.then(({ data }) => {
				if (data.session?.user) {
					const sbUser = data.session.user
					const user: User = {
						id: sbUser.id,
						email: sbUser.email ?? '',
						name: (sbUser.user_metadata?.name as string) ?? sbUser.email?.split('@')[0] ?? 'User',
						createdAt: new Date(sbUser.created_at),
					}
					dispatch(setSessionUser(user))
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

export default ProtectedRoute
