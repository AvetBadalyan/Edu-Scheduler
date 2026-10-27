/**
 * useSeedData — loads ACA demo data into Redux when in demo mode.
 *
 * Seeds once whenever the demo workspace is empty (initial demo login, or a
 * page load with an active demo session). It keys off store state rather than
 * a ref, so after a logout — which clears the store via resetAppState — the
 * next demo session re-seeds correctly.
 *
 * In authenticated mode this hook does nothing: useAuthenticatedMode loads data
 * from the API, and logout clears any prior session's data via resetAppState.
 */
import { DEMO_UNIVERSITY, seedFaculties, seedLecturers, seedRooms } from '@/lib/seedData'
import { setCurrentUniversity } from '@/store/appSlice'
import { selectIsDemoMode } from '@/store/authSlice'
import {
	addFaculty,
	addLecturer,
	addRoom,
	selectAllLecturers,
} from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadSchedule } from '@/store/scheduleSlice'
import type { ScheduleState } from '@/types'
import { useEffect } from 'react'

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
	const hasSeedData = useAppSelector(s => selectAllLecturers(s).length > 0)

	useEffect(() => {
		if (!isDemoMode) return
		// Seed only when the demo workspace is empty. Keying off actual state
		// (rather than a ref) means a logout — which clears the store via
		// resetAppState — correctly re-seeds on the next demo session, and it
		// never double-seeds under React StrictMode's double-invoke.
		if (hasSeedData) return

		seedLecturers.forEach(l => dispatch(addLecturer(l)))
		seedRooms.forEach(r => dispatch(addRoom(r)))
		seedFaculties.forEach(f => dispatch(addFaculty(f)))
		dispatch(setCurrentUniversity(DEMO_UNIVERSITY))

		// Restore a previously generated demo schedule if one was saved.
		const saved = loadDemoSchedule()
		if (saved) dispatch(loadSchedule(saved))
	}, [isDemoMode, hasSeedData, dispatch])
}
