/**
 * useSeedData — loads ACA demo data into Redux when in demo mode.
 *
 * Runs whenever isDemoMode becomes true (initial demo login or page load
 * with an active demo session).
 *
 * In authenticated mode this hook does nothing — useAuthenticatedMode
 * handles data loading from the API and calls setLecturers/setRooms/setFaculties
 * which replaces any previously loaded seed data.
 */
import { DEMO_UNIVERSITY, seedFaculties, seedLecturers, seedRooms } from '@/lib/seedData'
import { setCurrentUniversity } from '@/store/appSlice'
import { selectIsAuthenticated, selectIsDemoMode } from '@/store/authSlice'
import {
	addFaculty,
	addLecturer,
	addRoom,
	setFaculties,
	setLecturers,
	setRooms,
} from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadSchedule } from '@/store/scheduleSlice'
import type { ScheduleState } from '@/types'
import { useEffect, useRef } from 'react'

// ─── Demo schedule persistence ────────────────────────────────────────────────

const DEMO_SCHEDULE_KEY = 'em.demo_schedule'

export function saveDemoSchedule(state: ScheduleState): void {
	try {
		sessionStorage.setItem(DEMO_SCHEDULE_KEY, JSON.stringify(state))
	} catch {
		/* quota exceeded or private mode */
	}
}

export function clearDemoSchedule(): void {
	try {
		sessionStorage.removeItem(DEMO_SCHEDULE_KEY)
	} catch {
		/* ignore */
	}
}

function loadDemoSchedule(): ScheduleState | null {
	try {
		const raw = sessionStorage.getItem(DEMO_SCHEDULE_KEY)
		return raw ? (JSON.parse(raw) as ScheduleState) : null
	} catch {
		return null
	}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSeedData(): void {
	const dispatch = useAppDispatch()
	const isDemoMode = useAppSelector(selectIsDemoMode)
	const isAuthenticated = useAppSelector(selectIsAuthenticated)
	const seededRef = useRef(false)

	useEffect(() => {
		if (isDemoMode) {
			// Load seed data once per demo session
			if (!seededRef.current) {
				seededRef.current = true
				seedLecturers.forEach(l => dispatch(addLecturer(l)))
				seedRooms.forEach(r => dispatch(addRoom(r)))
				seedFaculties.forEach(f => dispatch(addFaculty(f)))
				dispatch(setCurrentUniversity(DEMO_UNIVERSITY))

				// Restore previously generated schedule if one was saved
				const saved = loadDemoSchedule()
				if (saved) dispatch(loadSchedule(saved))
			}
		} else if (isAuthenticated) {
			// Authenticated mode — clear any seed data so it doesn't bleed through.
			// useAuthenticatedMode will replace these with API data.
			if (seededRef.current) {
				seededRef.current = false
				dispatch(setLecturers([]))
				dispatch(setRooms([]))
				dispatch(setFaculties([]))
				dispatch(setCurrentUniversity(null))
				clearDemoSchedule()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDemoMode, isAuthenticated])
}
