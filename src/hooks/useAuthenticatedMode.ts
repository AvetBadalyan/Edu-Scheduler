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

		async function bootstrap() {
			try {
				// 1. Get or create university
				let universities = await universitiesApi.list()
				if (universities.length === 0) {
					const domain = user!.email.split('@')[1] ?? 'My University'
					const newName =
						domain.split('.')[0]!.charAt(0).toUpperCase() +
						domain.split('.')[0]!.slice(1) +
						' University'
					const created = await universitiesApi.create(newName)
					universities = [created]
				}
				const university = universities[0]!
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
