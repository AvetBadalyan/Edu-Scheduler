/**
 * Property-based tests — scheduling algorithm constraints.
 * Requirements: 13.2 — validates 5.1, 5.2, 5.4
 */
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { runSchedulingAlgorithm } from '@/lib/algorithm/schedulingAlgorithm'
import { emptyTimetable } from '@/lib/timetable'
import type { ClassAssignment, DayOfWeek, Faculty, HourSlot, Lecturer, Room, ScheduleState, TimeSlot } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUBJECTS = ['Math', 'Physics', 'CS', 'English', 'History']

const makeLecturer = (id: string, subject: string): Lecturer => ({
	id,
	name: `Lecturer${id}`,
	surname: 'Test',
	specialties: [subject],
	availability: emptyTimetable(),
	createdAt: new Date(),
	updatedAt: new Date(),
})

const makeRoom = (id: string, capacity: number): Room => ({
	id,
	number: `R${id}`,
	capacity,
	availability: emptyTimetable(),
	createdAt: new Date(),
	updatedAt: new Date(),
})

function getAllAssignments(state: ScheduleState): ClassAssignment[] {
	const seen = new Set<string>()
	const results: ClassAssignment[] = []
	for (const faculty of Object.values(state.faculties)) {
		for (const day of [1, 2, 3, 4, 5] as DayOfWeek[]) {
			for (const hour of [1, 2, 3, 4] as HourSlot[]) {
				const a = faculty.timetable[day][hour]
				if (a) {
					const key = `${a.facultyId}|${a.lecturerId}|${a.timeSlot.day}|${a.timeSlot.hour}`
					if (!seen.has(key)) {
						seen.add(key)
						results.push(a)
					}
				}
			}
		}
	}
	return results
}

function slotKey(slot: TimeSlot): string {
	return `${slot.day}-${slot.hour}`
}

// ─── Arbitrary ────────────────────────────────────────────────────────────────

const arbInput = fc
	.record({
		numFaculties: fc.integer({ min: 1, max: 3 }),
		numLecturers: fc.integer({ min: 1, max: 4 }),
		numRooms: fc.integer({ min: 1, max: 4 }),
		subjectPicks: fc.array(fc.nat({ max: SUBJECTS.length - 1 }), { minLength: 2, maxLength: 5 }),
		capacities: fc.array(fc.integer({ min: 10, max: 50 }), { minLength: 1, maxLength: 4 }),
		studentCounts: fc.array(fc.integer({ min: 5, max: 30 }), { minLength: 3, maxLength: 6 }),
	})
	.map(({ numFaculties, numLecturers, numRooms, subjectPicks, capacities, studentCounts }) => {
		const subjects = [...new Set(subjectPicks.map(i => SUBJECTS[i % SUBJECTS.length]!))]
		const lecturers: Lecturer[] = Array.from({ length: numLecturers }, (_, i) =>
			makeLecturer(`l${i}`, subjects[i % subjects.length]!)
		)
		const rooms: Room[] = Array.from({ length: numRooms }, (_, i) =>
			makeRoom(`r${i}`, capacities[i % capacities.length]!)
		)
		const faculties: Faculty[] = Array.from({ length: numFaculties }, (_, i) => ({
			id: `f${i}`,
			name: `Faculty${i}`,
			syllabus: subjects.slice(0, 2).map(s => ({ subject: s, requiredHours: 1 })),
			students: Array.from({ length: studentCounts[i % studentCounts.length]! }, (_, j) => ({
				id: `s${i}-${j}`,
				name: `Student${j}`,
				surname: `F${i}`,
			})),
			createdAt: new Date(),
			updatedAt: new Date(),
		}))
		return { lecturers, rooms, faculties }
	})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Scheduling algorithm — property tests', () => {
	it('Property 1: no lecturer double-booked in the same slot', () => {
		fc.assert(
			fc.property(arbInput, input => {
				const { schedule } = runSchedulingAlgorithm(input)
				for (const [lid, lec] of Object.entries(schedule.lecturers)) {
					const slots: string[] = []
					for (const d of [1, 2, 3, 4, 5] as DayOfWeek[])
						for (const h of [1, 2, 3, 4] as HourSlot[])
							if (lec.timetable[d][h]) slots.push(`${d}-${h}`)
					expect(new Set(slots).size, `Lecturer ${lid} has duplicate slots`).toBe(slots.length)
				}
			}),
			{ numRuns: 50 }
		)
	})

	it('Property 2: no room double-booked in the same slot', () => {
		fc.assert(
			fc.property(arbInput, input => {
				const { schedule } = runSchedulingAlgorithm(input)
				for (const [rid, room] of Object.entries(schedule.rooms)) {
					const slots: string[] = []
					for (const d of [1, 2, 3, 4, 5] as DayOfWeek[])
						for (const h of [1, 2, 3, 4] as HourSlot[])
							if (room.timetable[d][h]) slots.push(`${d}-${h}`)
					expect(new Set(slots).size, `Room ${rid} has duplicate slots`).toBe(slots.length)
				}
			}),
			{ numRuns: 50 }
		)
	})

	it('Property 3: no faculty double-booked in the same slot', () => {
		fc.assert(
			fc.property(arbInput, input => {
				const { schedule } = runSchedulingAlgorithm(input)
				for (const [fid, fac] of Object.entries(schedule.faculties)) {
					const slots: string[] = []
					for (const d of [1, 2, 3, 4, 5] as DayOfWeek[])
						for (const h of [1, 2, 3, 4] as HourSlot[])
							if (fac.timetable[d][h]) slots.push(`${d}-${h}`)
					expect(new Set(slots).size, `Faculty ${fid} has duplicate slots`).toBe(slots.length)
				}
			}),
			{ numRuns: 50 }
		)
	})

	it('Property 4: lecturer specialty matches assigned subject', () => {
		fc.assert(
			fc.property(arbInput, input => {
				const lecturerMap = new Map(input.lecturers.map(l => [l.id, l]))
				const { schedule } = runSchedulingAlgorithm(input)
				for (const a of getAllAssignments(schedule)) {
					const lecturer = lecturerMap.get(a.lecturerId)
					if (!lecturer) continue
					expect(
						lecturer.specialties.includes(a.subject),
						`Lecturer ${a.lecturerId} assigned subject "${a.subject}" but specialties are ${lecturer.specialties}`
					).toBe(true)
				}
			}),
			{ numRuns: 50 }
		)
	})

	it('Property 5: assignment appears in all three timetables consistently', () => {
		fc.assert(
			fc.property(arbInput, input => {
				const { schedule } = runSchedulingAlgorithm(input)
				for (const a of getAllAssignments(schedule)) {
					const { day, hour } = a.timeSlot
					expect(schedule.rooms[a.roomId]?.timetable[day][hour]?.facultyId).toBe(a.facultyId)
					expect(schedule.lecturers[a.lecturerId]?.timetable[day][hour]?.facultyId).toBe(
						a.facultyId
					)
				}
			}),
			{ numRuns: 50 }
		)
	})
})
