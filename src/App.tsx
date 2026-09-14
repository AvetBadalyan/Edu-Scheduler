/**
 * App — routing and top-level composition.
 *
 * - LoginPage has its own <Suspense fallback={null}> (it's lazy, public route)
 * - Protected pages are wrapped by AppLayout which puts <Suspense> around
 *   <Outlet> only — the sidebar never unmounts during navigation
 */
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'
import { useSeedData } from '@/hooks/useSeedData'
import {
	FacultiesPage,
	HomePage,
	LecturersPage,
	LoginPage,
	RoomsPage,
	SchedulePage
} from '@/pages'
import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

export default function App() {
	useSeedData()
	return (
		<ErrorBoundary>
			<Routes>
				{/* Public — lazy LoginPage needs its own Suspense boundary */}
				<Route
					path="/login"
					element={
						<Suspense fallback={null}>
							<LoginPage />
						</Suspense>
					}
				/>

				{/* Protected — AppLayout puts Suspense around <Outlet> only */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route
							index
							element={<HomePage />}
						/>
						<Route
							path="lecturers"
							element={<LecturersPage />}
						/>
						<Route
							path="rooms"
							element={<RoomsPage />}
						/>
						<Route
							path="faculties"
							element={<FacultiesPage />}
						/>
						<Route
							path="schedule"
							element={<SchedulePage />}
						/>
					</Route>
				</Route>

				<Route
					path="*"
					element={<NotFound />}
				/>
			</Routes>
			<Toaster />
		</ErrorBoundary>
	)
}

function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
			<h1 className="text-3xl font-bold">404</h1>
			<p className="text-muted-foreground">This page could not be found.</p>
			<a
				href="/"
				className="text-primary underline underline-offset-4"
			>
				Back to dashboard
			</a>
		</div>
	)
}
