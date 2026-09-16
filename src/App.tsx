/**
 * App — routing and top-level composition.
 */
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'
import { useAuthenticatedMode } from '@/hooks/useAuthenticatedMode'
import { useSeedData } from '@/hooks/useSeedData'
import { ROUTES } from '@/lib/routes'
import { supabase } from '@/lib/supabase'
import {
	FacultiesPage,
	HomePage,
	LandingPage,
	LecturersPage,
	LoginPage,
	RoomsPage,
	SchedulePage,
} from '@/pages'
import { DEMO_USER, mapSupabaseUser, setSessionUser } from '@/store/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { Suspense, useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

export default function App() {
	useSeedData()
	useSupabaseAuthSync()
	useAuthenticatedMode()

	return (
		<ErrorBoundary>
			<Routes>
				<Route
					path={ROUTES.landing}
					element={
						<Suspense fallback={null}>
							<LandingPage />
						</Suspense>
					}
				/>
				<Route
					path={ROUTES.login}
					element={
						<Suspense fallback={null}>
							<LoginPage />
						</Suspense>
					}
				/>
				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route path={ROUTES.dashboard} element={<HomePage />} />
						<Route path={ROUTES.lecturers} element={<LecturersPage />} />
						<Route path={ROUTES.rooms} element={<RoomsPage />} />
						<Route path={ROUTES.faculties} element={<FacultiesPage />} />
						<Route path={ROUTES.schedule} element={<SchedulePage />} />
					</Route>
				</Route>
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Toaster />
		</ErrorBoundary>
	)
}

function useSupabaseAuthSync() {
	const dispatch = useAppDispatch()
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) return
			const user = mapSupabaseUser(session.user)
			if (user.id === DEMO_USER.id) return
			dispatch(setSessionUser(user))
		})
		return () => subscription.unsubscribe()
	}, [dispatch])
}

function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
			<h1 className="text-3xl font-bold">404</h1>
			<p className="text-muted-foreground">This page could not be found.</p>
			<Link to={ROUTES.landing} className="text-primary underline underline-offset-4">
				Back to home
			</Link>
		</div>
	)
}
