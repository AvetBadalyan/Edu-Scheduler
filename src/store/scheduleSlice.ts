/**
 * scheduleSlice — timetable state for all rooms, lecturers and faculties.
 *
 * Each entity has a 5×4 timetable (days × hours). A cell is either null
 * (free) or a ClassAssignment object. The reducers (_assignClass,
 * _unassignSlot) and the moveClassWithHistory thunk keep all three
 * timetables consistent.
 */
import { schedulesApi } from '@/lib/api/schedules'
import { emptyTimetable } from '@/lib/timetable'
import type {
	ClassAssignment,
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
} from '@/types'
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

// ─── State ────────────────────────────────────────────────────────────────────

interface ScheduleSliceState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
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
			// Empty every room/lecturer/faculty timetable back to all-null.
			for (const room of Object.values(state.rooms)) room.timetable = emptyTimetable()
			for (const lecturer of Object.values(state.lecturers)) lecturer.timetable = emptyTimetable()
			for (const faculty of Object.values(state.faculties)) faculty.timetable = emptyTimetable()
		},

		loadSchedule(_state, action: PayloadAction<ScheduleState>) {
			// ScheduleState has the same shape as this slice's state, so use it directly.
			return action.payload
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

// ─── Manual edit thunks (drag-and-drop + undo/redo) ────────────────────────────
// Components dispatch these named thunks. The messy "read state, check, then
// dispatch" work lives here so components stay simple.

import {
	pushEdit,
	redo as redoHistory,
	selectCurrentEdit,
	selectNextEdit,
	undo as undoHistory,
} from './editHistorySlice'
import type { AppDispatch } from './index'

export interface MoveResult {
	success: boolean
	error?: string
}

/** Reads the assignment sitting in a given slot, or null if the slot is empty. */
function readAssignment(state: RootState, ref: TimeSlotRef): ClassAssignment | null {
	const { rooms, lecturers, faculties } = state.schedule
	const { day, hour, entityType, entityId } = ref
	if (entityType === 'room') return rooms[entityId]?.timetable[day][hour] ?? null
	if (entityType === 'lecturer') return lecturers[entityId]?.timetable[day][hour] ?? null
	return faculties[entityId]?.timetable[day][hour] ?? null
}

/** Returns an error message if the class can't go in its slot, or null if it's free. */
function findConflict(state: RootState, assignment: ClassAssignment): string | null {
	const { rooms, lecturers, faculties } = state.schedule
	const { facultyId, lecturerId, roomId, timeSlot } = assignment
	const { day, hour } = timeSlot

	if (!rooms[roomId]) return 'Room not found'
	if (!lecturers[lecturerId]) return 'Lecturer not found'
	if (!faculties[facultyId]) return 'Faculty not found'

	if (rooms[roomId].timetable[day][hour] !== null) return 'Room is already booked at this time'
	if (lecturers[lecturerId].timetable[day][hour] !== null)
		return 'Lecturer is already booked at this time'
	if (faculties[facultyId].timetable[day][hour] !== null)
		return 'Faculty already has a class at this time'

	return null
}

/**
 * Move a class from one slot to another and record it in the undo history.
 * Returns { success, error } so the page can show a toast.
 */
export const moveClassWithHistory =
	(from: TimeSlotRef, to: TimeSlotRef) =>
	(dispatch: AppDispatch, getState: () => RootState): MoveResult => {
		const before = readAssignment(getState(), from)
		if (!before) return { success: false, error: 'No assignment at source slot' }

		const moved: ClassAssignment = { ...before, timeSlot: { day: to.day, hour: to.hour } }

		// Free the old slot first, then make sure the new slot is clear.
		dispatch(_unassignSlot({ ...before, day: from.day, hour: from.hour }))
		const conflict = findConflict(getState(), moved)
		if (conflict) {
			dispatch(_assignClass(before)) // put it back
			return { success: false, error: conflict }
		}

		dispatch(_assignClass(moved))
		dispatch(
			pushEdit({
				id: crypto.randomUUID(),
				timestamp: new Date(),
				type: 'move',
				before,
				after: moved,
			})
		)
		return { success: true }
	}

/** Undo the most recent manual edit (reverses the last move). */
export const undoLastMove = () => (dispatch: AppDispatch, getState: () => RootState) => {
	const edit = selectCurrentEdit(getState())
	dispatch(undoHistory())
	if (!edit) return
	if (edit.after) dispatch(_unassignSlot({ ...edit.after, ...edit.after.timeSlot }))
	if (edit.before) dispatch(_assignClass(edit.before))
}

/** Redo the edit that was just undone (re-applies the move). */
export const redoLastMove = () => (dispatch: AppDispatch, getState: () => RootState) => {
	const edit = selectNextEdit(getState())
	dispatch(redoHistory())
	if (edit?.after) dispatch(_assignClass(edit.after))
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectScheduleRooms = (s: RootState) => s.schedule.rooms
export const selectScheduleLecturers = (s: RootState) => s.schedule.lecturers
export const selectScheduleFaculties = (s: RootState) => s.schedule.faculties
export const selectHasSchedule = (s: RootState) => Object.keys(s.schedule.lecturers).length > 0
