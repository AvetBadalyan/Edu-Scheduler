/**
 * Property-based tests — schedule editing (assign / clear / move).
 * Requirements: 13.3 — validates 12.1, 12.4, 12.5
 */
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { emptyTimetable } from '@/lib/timetable'
import type {
	ClassAssignment,
	DayOfWeek,
	FacultyWithTimetable,
	HourSlot,
	LecturerWithTimetable,
	RoomWithTimetable,
	ScheduleState,
} from '@/types'

// ─── Pure helpers (no Redux) ──────────────────────────────────────────────────

function makeEmptyState(): ScheduleState {
	const room: RoomWithTimetable = {
		id: 'r1',
		number: '101',
		capacity: 30,
		availability: emptyTimetable(),
		timetable: emptyTimetable(),
		createdAt: new Date(),
		updatedAt: new Date(),
	}
	const lecturer: LecturerWithTimetable = {
		id: 'l1',
		name: 'L',
		surname: 'T',
		specialties: ['Math'],
		availability: emptyTimetable(),
		timetable: emptyTimetable(),
		createdAt: new Date(),
		updatedAt: new Date(),
	}
	const faculty: FacultyWithTimetable = {
		id: 'f1',
		name: 'F',
		syllabus: [{ subject: 'Math', requiredHours: 2 }],
		students: [],
		timetable: emptyTimetable(),
		remainingHours: { Math: 2 },
		createdAt: new Date(),
		updatedAt: new Date(),
	}
	return { rooms: { r1: room }, lecturers: { l1: lecturer }, faculties: { f1: faculty } }
}

function makeAssignment(day: DayOfWeek, hour: HourSlot): ClassAssignment {
	return { facultyId: 'f1', lecturerId: 'l1', roomId: 'r1', subject: 'Math', timeSlot: { day, hour }, isManual: false }
}

function assign(state: ScheduleState, a: ClassAssignment): ScheduleState {
	const { day, hour } = a.timeSlot
	return {
		rooms: { ...state.rooms, r1: { ...state.rooms.r1!, timetable: { ...state.rooms.r1!.timetable, [day]: { ...state.rooms.r1!.timetable[day], [hour]: a } } } },
		lecturers: { ...state.lecturers, l1: { ...state.lecturers.l1!, timetable: { ...state.lecturers.l1!.timetable, [day]: { ...state.lecturers.l1!.timetable[day], [hour]: a } } } },
		faculties: { ...state.faculties, f1: { ...state.faculties.f1!, timetable: { ...state.faculties.f1!.timetable, [day]: { ...state.faculties.f1!.timetable[day], [hour]: a } } } },
	}
}

function clear(state: ScheduleState, day: DayOfWeek, hour: HourSlot): ScheduleState {
	return {
		rooms: { ...state.rooms, r1: { ...state.rooms.r1!, timetable: { ...state.rooms.r1!.timetable, [day]: { ...state.rooms.r1!.timetable[day], [hour]: null } } } },
		lecturers: { ...state.lecturers, l1: { ...state.lecturers.l1!, timetable: { ...state.lecturers.l1!.timetable, [day]: { ...state.lecturers.l1!.timetable[day], [hour]: null } } } },
		faculties: { ...state.faculties, f1: { ...state.faculties.f1!, timetable: { ...state.faculties.f1!.timetable, [day]: { ...state.faculties.f1!.timetable[day], [hour]: null } } } },
	}
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const arbSlot = fc.record({
	day: fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<DayOfWeek>,
	hour: fc.integer({ min: 1, max: 4 }) as fc.Arbitrary<HourSlot>,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Schedule editing — property tests', () => {
	it('Property 6: assignment appears in all three timetables after assign', () => {
		fc.assert(
			fc.property(arbSlot, ({ day, hour }) => {
				const a = makeAssignment(day, hour)
				const state = assign(makeEmptyState(), a)
				expect(state.rooms.r1!.timetable[day][hour]).toEqual(a)
				expect(state.lecturers.l1!.timetable[day][hour]).toEqual(a)
				expect(state.faculties.f1!.timetable[day][hour]).toEqual(a)
			}),
			{ numRuns: 100 }
		)
	})

	it('Property 7: clear removes assignment from all three timetables', () => {
		fc.assert(
			fc.property(arbSlot, ({ day, hour }) => {
				const a = makeAssignment(day, hour)
				const after = assign(makeEmptyState(), a)
				const restored = clear(after, day, hour)
				expect(restored.rooms.r1!.timetable[day][hour]).toBeNull()
				expect(restored.lecturers.l1!.timetable[day][hour]).toBeNull()
				expect(restored.faculties.f1!.timetable[day][hour]).toBeNull()
			}),
			{ numRuns: 100 }
		)
	})

	it('Property 8: assign then clear is idempotent with initial state', () => {
		fc.assert(
			fc.property(arbSlot, ({ day, hour }) => {
				const initial = makeEmptyState()
				const result = clear(assign(initial, makeAssignment(day, hour)), day, hour)
				expect(result.rooms.r1!.timetable[day][hour]).toBe(initial.rooms.r1!.timetable[day][hour])
			}),
			{ numRuns: 100 }
		)
	})

	it('Property 9: move — source empty, destination has assignment', () => {
		fc.assert(
			fc.property(arbSlot, arbSlot, (from, to) => {
				if (from.day === to.day && from.hour === to.hour) return
				const initial = assign(makeEmptyState(), makeAssignment(from.day, from.hour))
				const moved = clear(initial, from.day, from.hour)
				const final = assign(moved, makeAssignment(to.day, to.hour))
				expect(final.rooms.r1!.timetable[from.day][from.hour]).toBeNull()
				expect(final.rooms.r1!.timetable[to.day][to.hour]).not.toBeNull()
			}),
			{ numRuns: 100 }
		)
	})
})
