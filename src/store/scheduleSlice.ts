/**
 * scheduleSlice — timetable state for all rooms, lecturers and faculties.
 *
 * Each entity has a 5×4 timetable (days × hours). A cell is either null
 * (free) or a ClassAssignment object. assignClass, unassignClass and
 * moveClass keep all three timetables consistent atomically.
 */
import { schedulesApi } from '@/lib/api/schedules'
import { allTimeSlots, emptyTimetable } from '@/lib/timetable'
import type {
	ClassAssignment,
	Conflict,
	DayOfWeek,
	FacultyId,
	FacultyWithTimetable,
	HourSlot,
	LecturerId,
	LecturerWithTimetable,
	RoomId,
	RoomWithTimetable,
	ScheduleState,
	TimeSlotRef,
	Timetable,
	UtilizationStats,
} from '@/types'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

// ─── State ────────────────────────────────────────────────────────────────────

interface ScheduleSliceState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clear every timetable slot back to null. */
function clearTimetables<T extends { timetable: Timetable }>(
	record: Record<string, T>
): Record<string, T> {
	const out: Record<string, T> = {}
	for (const [id, entity] of Object.entries(record)) {
		out[id] = { ...entity, timetable: emptyTimetable() }
	}
	return out
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const scheduleSlice = createSlice({
	name: 'schedule',
	initialState: {
		rooms: {},
		lecturers: {},
		faculties: {},
	} as ScheduleSliceState,
	reducers: {
		/**
		 * Assign a class to a slot. Writes to all three timetables atomically.
		 * Returns { success, error } via a selector-free pattern — callers
		 * can inspect the returned action payload before dispatching.
		 * Since RTK requires reducers to be synchronous we do the guard check
		 * in the action creator below instead.
		 */
		_assignClass(state, action: PayloadAction<ClassAssignment>) {
			const a = action.payload
			const {
				facultyId,
				lecturerId,
				roomId,
				timeSlot: { day, hour },
			} = a
			state.rooms[roomId].timetable[day][hour] = a
			state.lecturers[lecturerId].timetable[day][hour] = a
			state.faculties[facultyId].timetable[day][hour] = a
		},

		_unassignSlot(
			state,
			action: PayloadAction<{
				roomId: RoomId
				lecturerId: LecturerId
				facultyId: FacultyId
				day: DayOfWeek
				hour: HourSlot
			}>
		) {
			const { roomId, lecturerId, facultyId, day, hour } = action.payload
			if (state.rooms[roomId]) state.rooms[roomId].timetable[day][hour] = null
			if (state.lecturers[lecturerId]) state.lecturers[lecturerId].timetable[day][hour] = null
			if (state.faculties[facultyId]) state.faculties[facultyId].timetable[day][hour] = null
		},

		resetSchedule(state) {
			state.rooms = clearTimetables(state.rooms) as typeof state.rooms
			state.lecturers = clearTimetables(state.lecturers) as typeof state.lecturers
			state.faculties = clearTimetables(state.faculties) as typeof state.faculties
		},

		loadSchedule(_state, action: PayloadAction<ScheduleState>) {
			return {
				rooms: action.payload.rooms as ScheduleSliceState['rooms'],
				lecturers: action.payload.lecturers as ScheduleSliceState['lecturers'],
				faculties: action.payload.faculties as ScheduleSliceState['faculties'],
			}
		},
	},
})

export const { resetSchedule, loadSchedule, _assignClass, _unassignSlot } = scheduleSlice.actions
export default scheduleSlice.reducer

// ─── Persistence thunks (authenticated mode) ──────────────────────────────────
// In demo mode these are no-ops — the schedule lives only in memory.
// In authenticated mode the current timetable is saved to / loaded from the API.

import { selectCurrentUniversity } from './appSlice'
import { selectIsDemoMode } from './authSlice'

/**
 * Persists the current schedule for the active university.
 * Reuses the university's existing schedule row (one per university) when present.
 */
export const saveScheduleThunk = createAsyncThunk<void, void, { state: RootState }>(
	'schedule/save',
	async (_arg, { getState }) => {
		const s = getState()
		const university = selectCurrentUniversity(s)
		if (selectIsDemoMode(s) || !university) return // demo mode: nothing to persist

		const state: ScheduleState = {
			rooms: s.schedule.rooms,
			lecturers: s.schedule.lecturers,
			faculties: s.schedule.faculties,
		}

		// One schedule per university: update the latest if it exists, else create.
		const existing = await schedulesApi.latest(university.id).catch(() => null)

		if (existing) {
			await schedulesApi.update(existing.id, { state })
		} else {
			await schedulesApi.create({
				name: `${university.name} timetable`,
				state,
				universityId: university.id,
			})
		}
	}
)

/** Loads the most recent saved schedule for the active university into Redux. */
export const loadLatestScheduleThunk = createAsyncThunk<boolean, void, { state: RootState }>(
	'schedule/loadLatest',
	async (_arg, { dispatch, getState }) => {
		const s = getState()
		const university = selectCurrentUniversity(s)
		if (selectIsDemoMode(s) || !university) return false

		const existing = await schedulesApi.latest(university.id).catch(() => null)
		if (!existing) return false

		dispatch(loadSchedule(existing.state))
		return true
	}
)

// ─── Thunk-style action creators with validation ──────────────────────────────
// These are plain functions (not RTK thunks) that can return a result.
// Components import these and dispatch the inner action only if valid.

import type { AppDispatch } from './index'

export interface AssignmentResult {
	success: boolean
	error?: string
}
export interface MoveResult {
	success: boolean
	error?: string
}

/** Validates constraints then dispatches _assignClass. */
export function assignClass(
	assignment: ClassAssignment
): (dispatch: AppDispatch, getState: () => RootState) => AssignmentResult {
	return (dispatch, getState) => {
		const { rooms, lecturers, faculties } = getState().schedule
		const {
			facultyId,
			lecturerId,
			roomId,
			timeSlot: { day, hour },
		} = assignment

		if (!rooms[roomId]) return { success: false, error: 'Room not found' }
		if (!lecturers[lecturerId]) return { success: false, error: 'Lecturer not found' }
		if (!faculties[facultyId]) return { success: false, error: 'Faculty not found' }

		if (rooms[roomId].timetable[day][hour] !== null)
			return { success: false, error: 'Room is already booked at this time' }
		if (lecturers[lecturerId].timetable[day][hour] !== null)
			return {
				success: false,
				error: 'Lecturer is already booked at this time',
			}
		if (faculties[facultyId].timetable[day][hour] !== null)
			return {
				success: false,
				error: 'Faculty already has a class at this time',
			}

		dispatch(_assignClass(assignment))
		return { success: true }
	}
}

/** Finds the assignment at slotRef, then removes it from all three timetables. */
export function unassignClass(
	slotRef: TimeSlotRef
): (dispatch: AppDispatch, getState: () => RootState) => void {
	return (dispatch, getState) => {
		const { rooms, lecturers, faculties } = getState().schedule
		const { day, hour, entityType, entityId } = slotRef

		let assignment: ClassAssignment | null = null
		if (entityType === 'room') assignment = rooms[entityId]?.timetable[day][hour] ?? null
		if (entityType === 'lecturer') assignment = lecturers[entityId]?.timetable[day][hour] ?? null
		if (entityType === 'faculty') assignment = faculties[entityId]?.timetable[day][hour] ?? null

		if (!assignment) return

		dispatch(
			_unassignSlot({
				roomId: assignment.roomId,
				lecturerId: assignment.lecturerId,
				facultyId: assignment.facultyId,
				day,
				hour,
			})
		)
	}
}

/** Move an assignment from one slot to another with rollback on failure. */
export function moveClass(
	from: TimeSlotRef,
	to: TimeSlotRef
): (dispatch: AppDispatch, getState: () => RootState) => MoveResult {
	return (dispatch, getState) => {
		const { rooms, lecturers, faculties } = getState().schedule
		const { day: fDay, hour: fHour, entityType, entityId } = from

		let assignment: ClassAssignment | null = null
		if (entityType === 'room') assignment = rooms[entityId]?.timetable[fDay][fHour] ?? null
		if (entityType === 'lecturer') assignment = lecturers[entityId]?.timetable[fDay][fHour] ?? null
		if (entityType === 'faculty') assignment = faculties[entityId]?.timetable[fDay][fHour] ?? null

		if (!assignment) return { success: false, error: 'No assignment at source slot' }

		dispatch(unassignClass(from))
		const result = dispatch(
			assignClass({ ...assignment, timeSlot: { day: to.day, hour: to.hour } })
		)
		if (!result.success) {
			// Rollback
			dispatch(_assignClass(assignment))
		}
		return result
	}
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectScheduleRooms = (s: RootState) => s.schedule.rooms
export const selectScheduleLecturers = (s: RootState) => s.schedule.lecturers
export const selectScheduleFaculties = (s: RootState) => s.schedule.faculties
export const selectHasSchedule = (s: RootState) => Object.keys(s.schedule.lecturers).length > 0

export const selectRoomTimetable = (roomId: RoomId) => (s: RootState) =>
	s.schedule.rooms[roomId]?.timetable ?? null

export const selectLecturerTimetable = (lecturerId: LecturerId) => (s: RootState) =>
	s.schedule.lecturers[lecturerId]?.timetable ?? null

export const selectFacultyTimetable = (facultyId: FacultyId) => (s: RootState) =>
	s.schedule.faculties[facultyId]?.timetable ?? null

export function selectConflicts(state: RootState): Conflict[] {
	const { rooms, lecturers, faculties } = state.schedule
	const conflicts: Conflict[] = []

	for (const { day, hour } of allTimeSlots()) {
		const roomIds = Object.values(rooms)
			.map(r => r.timetable[day][hour]?.roomId)
			.filter(Boolean) as RoomId[]
		const lecturerIds = Object.values(lecturers)
			.map(l => l.timetable[day][hour]?.lecturerId)
			.filter(Boolean) as LecturerId[]
		const facultyIds = Object.values(faculties)
			.map(f => f.timetable[day][hour]?.facultyId)
			.filter(Boolean) as FacultyId[]

		const check = (type: 'room' | 'lecturer' | 'faculty', ids: string[]) => {
			const counts = new Map<string, number>()
			ids.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))
			counts.forEach((count, id) => {
				if (count > 1)
					conflicts.push({
						type: 'double_booking',
						slots: [{ day, hour, entityType: type, entityId: id }],
						description: `${type} ${id} double-booked day ${day} hour ${hour}`,
					})
			})
		}
		check('room', roomIds)
		check('lecturer', lecturerIds)
		check('faculty', facultyIds)
	}
	return conflicts
}

export function selectUtilizationStats(state: RootState): UtilizationStats {
	const { rooms, lecturers } = state.schedule
	const slots = allTimeSlots()
	const totalSlots = Object.keys(rooms).length * slots.length
	let usedSlots = 0
	const byRoom: Record<RoomId, number> = {}
	const byLecturer: Record<LecturerId, number> = {}

	for (const [id, room] of Object.entries(rooms)) {
		let used = 0
		for (const { day, hour } of slots)
			if (room.timetable[day][hour] !== null) {
				usedSlots++
				used++
			}
		byRoom[id] = Math.round((used / slots.length) * 100)
	}
	for (const [id, lecturer] of Object.entries(lecturers)) {
		let used = 0
		for (const { day, hour } of slots) if (lecturer.timetable[day][hour] !== null) used++
		byLecturer[id] = Math.round((used / slots.length) * 100)
	}

	return {
		totalSlots,
		usedSlots,
		utilizationPercent: totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0,
		byRoom,
		byLecturer,
	}
}
