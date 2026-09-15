/**
 * useAuthenticatedMode — runs after a real (non-demo) login.
 *
 * 1. Fetches the user's universities from the API
 * 2. If none exist, creates one named after the user's email domain
 * 3. Sets the current university in Redux
 * 4. Loads that university's lecturers, rooms, and faculties into the store
 *
 * Does nothing in demo mode.
 */
import { useToast } from '@/hooks/useToast'
import { facultiesApi } from '@/lib/api/faculties'
import { lecturersApi } from '@/lib/api/lecturers'
import { roomsApi } from '@/lib/api/rooms'
import { universitiesApi } from '@/lib/api/universities'
import { setCurrentUniversity } from '@/store/appSlice'
import { selectIsAuthenticated, selectIsDemoMode, selectUser } from '@/store/authSlice'
import { setFaculties, setLecturers, setRooms } from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadLatestScheduleThunk } from '@/store/scheduleSlice'
import { useEffect, useRef } from 'react'

/** Builds a default university name from the email domain, e.g. "aca@x.com" → "X University". */
function universityNameFor(email: string): string {
	const domain = email.split('@')[1] ?? 'my' // "aca.am" (or fallback "my")
	const firstPart = domain.split('.')[0] ?? 'my' // "aca"
	return firstPart.charAt(0).toUpperCase() + firstPart.slice(1) + ' University'
}

export function useAuthenticatedMode(): void {
	const dispatch = useAppDispatch()
	const isAuthenticated = useAppSelector(selectIsAuthenticated)
	const isDemoMode = useAppSelector(selectIsDemoMode)
	const user = useAppSelector(selectUser)
	const toast = useToast()
	const loadedRef = useRef<string | null>(null) // track which userId we've loaded for

	useEffect(() => {
		if (!isAuthenticated || isDemoMode || !user) return
		if (loadedRef.current === user.id) return // already loaded for this user
		loadedRef.current = user.id

		// Capture the user in a local const so it's non-null inside bootstrap().
		const currentUser = user

		async function bootstrap() {
			try {
				// 1. Get or create the user's university
				let universities = await universitiesApi.list()
				if (universities.length === 0) {
					const created = await universitiesApi.create(universityNameFor(currentUser.email))
					universities = [created]
				}
				const university = universities[0]
				if (!university) return
				dispatch(setCurrentUniversity(university))

				// 2. Load entities for that university
				const [lecturers, rooms, faculties] = await Promise.all([
					lecturersApi.list(university.id),
					roomsApi.list(university.id),
					facultiesApi.list(university.id),
				])
				dispatch(setLecturers(lecturers))
				dispatch(setRooms(rooms))
				dispatch(setFaculties(faculties))

				// 3. Restore the most recently saved timetable, if any
				await dispatch(loadLatestScheduleThunk()).unwrap()
			} catch (err) {
				// Network/API error — surface it so the user isn't left staring
				// at a blank workspace wondering why nothing loaded.
				console.error('[useAuthenticatedMode] bootstrap failed:', err)
				loadedRef.current = null // allow a retry on next render/login
				toast.error("Couldn't load your data. Check your connection and try again.")
			}
		}

		void bootstrap()
	}, [isAuthenticated, isDemoMode, user, dispatch, toast])
}
