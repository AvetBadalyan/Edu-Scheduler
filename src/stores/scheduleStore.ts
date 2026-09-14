import { allTimeSlots, emptyTimetable } from '@/lib/timetable'
import type {
	ClassAssignment,
	Conflict,
	FacultyId,
	FacultyWithTimetable,
	LecturerId,
	LecturerWithTimetable,
	RoomId,
	RoomWithTimetable,
	ScheduleMetadata,
	ScheduleState,
	TimeSlotRef,
	Timetable,
	UtilizationStats
} from '@/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ─── Move result ──────────────────────────────────────────────────────────────

export interface AssignmentResult {
	success: boolean
	error?: string
}

export interface MoveResult {
	success: boolean
	error?: string
}

// ─── ScheduleStore interface ──────────────────────────────────────────────────

interface ScheduleStore {
	// State
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
	scheduleMetadata: ScheduleMetadata | null

	// Actions
	assignClass: (assignment: ClassAssignment) => AssignmentResult
	unassignClass: (slotRef: TimeSlotRef) => void
	moveClass: (from: TimeSlotRef, to: TimeSlotRef) => MoveResult
	resetSchedule: () => void
	loadSchedule: (state: ScheduleState) => void

	// Selectors
	getRoomTimetable: (roomId: RoomId) => Timetable | null
	getLecturerTimetable: (lecturerId: LecturerId) => Timetable | null
	getFacultyTimetable: (facultyId: FacultyId) => Timetable | null
	getConflicts: () => Conflict[]
	getUtilizationStats: () => UtilizationStats
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useScheduleStore = create<ScheduleStore>()(
	devtools(
		(set, get) => ({
			rooms: {},
			lecturers: {},
			faculties: {},
			scheduleMetadata: null,

			// ── assignClass ───────────────────────────────────────────────────────

			assignClass: assignment => {
				const { rooms, lecturers, faculties } = get()
				const { facultyId, lecturerId, roomId, timeSlot } = assignment
				const { day, hour } = timeSlot

				// Validate entities exist
				if (!rooms[roomId]) return { success: false, error: 'Room not found' }
				if (!lecturers[lecturerId])
					return { success: false, error: 'Lecturer not found' }
				if (!faculties[facultyId])
					return { success: false, error: 'Faculty not found' }

				// Check for conflicts
				if (rooms[roomId].timetable[day][hour] !== null)
					return {
						success: false,
						error: 'Room is already booked at this time'
					}
				if (lecturers[lecturerId].timetable[day][hour] !== null)
					return {
						success: false,
						error: 'Lecturer is already booked at this time'
					}
				if (faculties[facultyId].timetable[day][hour] !== null)
					return {
						success: false,
						error: 'Faculty already has a class at this time'
					}

				set(state => ({
					rooms: {
						...state.rooms,
						[roomId]: {
							...state.rooms[roomId],
							timetable: {
								...state.rooms[roomId].timetable,
								[day]: {
									...state.rooms[roomId].timetable[day],
									[hour]: assignment
								}
							}
						}
					},
					lecturers: {
						...state.lecturers,
						[lecturerId]: {
							...state.lecturers[lecturerId],
							timetable: {
								...state.lecturers[lecturerId].timetable,
								[day]: {
									...state.lecturers[lecturerId].timetable[day],
									[hour]: assignment
								}
							}
						}
					},
					faculties: {
						...state.faculties,
						[facultyId]: {
							...state.faculties[facultyId],
							timetable: {
								...state.faculties[facultyId].timetable,
								[day]: {
									...state.faculties[facultyId].timetable[day],
									[hour]: assignment
								}
							}
						}
					}
				}))

				return { success: true }
			},

			// ── unassignClass ──────────────────────────────────────────────────────

			unassignClass: slotRef => {
				const { day, hour, entityType, entityId } = slotRef
				const { rooms, lecturers, faculties } = get()

				// Find the assignment to get all three entity IDs
				let assignment: ClassAssignment | null = null
				if (entityType === 'room' && rooms[entityId]) {
					assignment = rooms[entityId].timetable[day][hour]
				} else if (entityType === 'lecturer' && lecturers[entityId]) {
					assignment = lecturers[entityId].timetable[day][hour]
				} else if (entityType === 'faculty' && faculties[entityId]) {
					assignment = faculties[entityId].timetable[day][hour]
				}

				if (!assignment) return

				const { roomId, lecturerId, facultyId } = assignment

				set(state => ({
					rooms: rooms[roomId]
						? {
								...state.rooms,
								[roomId]: {
									...state.rooms[roomId],
									timetable: {
										...state.rooms[roomId].timetable,
										[day]: {
											...state.rooms[roomId].timetable[day],
											[hour]: null
										}
									}
								}
							}
						: state.rooms,
					lecturers: lecturers[lecturerId]
						? {
								...state.lecturers,
								[lecturerId]: {
									...state.lecturers[lecturerId],
									timetable: {
										...state.lecturers[lecturerId].timetable,
										[day]: {
											...state.lecturers[lecturerId].timetable[day],
											[hour]: null
										}
									}
								}
							}
						: state.lecturers,
					faculties: faculties[facultyId]
						? {
								...state.faculties,
								[facultyId]: {
									...state.faculties[facultyId],
									timetable: {
										...state.faculties[facultyId].timetable,
										[day]: {
											...state.faculties[facultyId].timetable[day],
											[hour]: null
										}
									}
								}
							}
						: state.faculties
				}))
			},

			// ── moveClass ─────────────────────────────────────────────────────────

			moveClass: (from, to) => {
				const { rooms, lecturers, faculties } = get()
				const { day: fromDay, hour: fromHour, entityType, entityId } = from
				const { day: toDay, hour: toHour } = to

				let assignment: ClassAssignment | null = null
				if (entityType === 'room')
					assignment = rooms[entityId]?.timetable[fromDay][fromHour] ?? null
				else if (entityType === 'lecturer')
					assignment = lecturers[entityId]?.timetable[fromDay][fromHour] ?? null
				else if (entityType === 'faculty')
					assignment = faculties[entityId]?.timetable[fromDay][fromHour] ?? null

				if (!assignment)
					return { success: false, error: 'No assignment at source slot' }

				const store = get()
				// Unassign from current slot
				store.unassignClass(from)
				// Assign to new slot
				const result = store.assignClass({
					...assignment,
					timeSlot: { day: toDay, hour: toHour }
				})
				if (!result.success) {
					// Rollback
					store.assignClass(assignment)
				}
				return result
			},

			// ── resetSchedule ─────────────────────────────────────────────────────

			resetSchedule: () => {
				set(state => {
					const clearTimetables = <T extends { timetable: Timetable }>(
						record: Record<string, T>
					): Record<string, T> => {
						const updated: Record<string, T> = {}
						for (const [id, entity] of Object.entries(record)) {
							updated[id] = { ...entity, timetable: emptyTimetable() }
						}
						return updated
					}
					return {
						rooms: clearTimetables(state.rooms),
						lecturers: clearTimetables(state.lecturers),
						faculties: clearTimetables(state.faculties)
					}
				})
			},

			// ── loadSchedule ──────────────────────────────────────────────────────

			loadSchedule: scheduleState => {
				set({
					rooms: scheduleState.rooms,
					lecturers: scheduleState.lecturers,
					faculties: scheduleState.faculties
				})
			},

			// ── Selectors ─────────────────────────────────────────────────────────

			getRoomTimetable: roomId => get().rooms[roomId]?.timetable ?? null,
			getLecturerTimetable: lecturerId =>
				get().lecturers[lecturerId]?.timetable ?? null,
			getFacultyTimetable: facultyId =>
				get().faculties[facultyId]?.timetable ?? null,

			getConflicts: () => {
				// Scan every slot for double-bookings: the same room, lecturer or
				// faculty referenced by more than one class in a single (day, hour).
				const { rooms, lecturers, faculties } = get()
				const conflicts: Conflict[] = []

				for (const { day, hour } of allTimeSlots()) {
					const roomCounts = new Map<RoomId, number>()
					const lecturerCounts = new Map<LecturerId, number>()
					const facultyCounts = new Map<FacultyId, number>()

					for (const room of Object.values(rooms)) {
						const a = room.timetable[day][hour]
						if (a) roomCounts.set(a.roomId, (roomCounts.get(a.roomId) ?? 0) + 1)
					}
					for (const lecturer of Object.values(lecturers)) {
						const a = lecturer.timetable[day][hour]
						if (a)
							lecturerCounts.set(
								a.lecturerId,
								(lecturerCounts.get(a.lecturerId) ?? 0) + 1
							)
					}
					for (const faculty of Object.values(faculties)) {
						const a = faculty.timetable[day][hour]
						if (a)
							facultyCounts.set(
								a.facultyId,
								(facultyCounts.get(a.facultyId) ?? 0) + 1
							)
					}

					const groups = [
						{ type: 'room' as const, counts: roomCounts },
						{ type: 'lecturer' as const, counts: lecturerCounts },
						{ type: 'faculty' as const, counts: facultyCounts }
					]

					for (const { type, counts } of groups) {
						for (const [id, count] of counts) {
							if (count > 1) {
								conflicts.push({
									type: 'double_booking',
									slots: [{ day, hour, entityType: type, entityId: id }],
									description: `${type} ${id} is booked ${count} times on day ${day}, hour ${hour}.`
								})
							}
						}
					}
				}

				return conflicts
			},

			getUtilizationStats: (): UtilizationStats => {
				const { rooms, lecturers } = get()
				const slots = allTimeSlots()
				const totalSlots = Object.keys(rooms).length * slots.length
				let usedSlots = 0
				const byRoom: Record<RoomId, number> = {}
				const byLecturer: Record<LecturerId, number> = {}

				for (const [roomId, room] of Object.entries(rooms)) {
					let roomUsed = 0
					for (const { day, hour } of slots) {
						if (room.timetable[day][hour] !== null) {
							usedSlots++
							roomUsed++
						}
					}
					byRoom[roomId] = Math.round((roomUsed / slots.length) * 100)
				}

				for (const [lecturerId, lecturer] of Object.entries(lecturers)) {
					let used = 0
					for (const { day, hour } of slots) {
						if (lecturer.timetable[day][hour] !== null) used++
					}
					byLecturer[lecturerId] = Math.round((used / slots.length) * 100)
				}

				return {
					totalSlots,
					usedSlots,
					utilizationPercent:
						totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0,
					byRoom,
					byLecturer
				}
			}
		}),
		{ name: 'ScheduleStore' }
	)
)
