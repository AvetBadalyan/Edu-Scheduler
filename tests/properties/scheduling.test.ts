/**
 * Property-based tests for the scheduling algorithm.
 *
 * Uses fast-check to generate arbitrary valid schedule inputs and verify
 * that correctness properties hold for every generated example.
 *
 * Requirements: 13.1, 13.2 — 5.1, 5.2, 5.4
 */
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { runSchedulingAlgorithm } from '@/lib/algorithm/schedulingAlgorithm'
import { emptyTimetable } from '@/lib/timetable'
import type {
  ClassAssignment,
  DayOfWeek,
  Faculty,
  HourSlot,
  Lecturer,
  Room,
  ScheduleResult,
  ScheduleState,
  TimeSlot,
} from '@/types'

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const SUBJECTS = ['Math', 'Physics', 'CS', 'English', 'History', 'Chemistry']

const arbSubject = fc.constantFrom(...SUBJECTS)

const arbLecturer = (id: string, subject: string): Lecturer => ({
  id,
  name: `Lecturer${id}`,
  surname: 'Test',
  specialties: [subject],
  availability: emptyTimetable(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

const arbRoom = (id: string, capacity: number): Room => ({
  id,
  number: `R${id}`,
  capacity,
  availability: emptyTimetable(),
  createdAt: new Date(),
  updatedAt: new Date(),
})

/** Generate a minimal but valid schedule input */
const arbScheduleInput = fc
  .record({
    numFaculties:  fc.integer({ min: 1, max: 3 }),
    numLecturers:  fc.integer({ min: 1, max: 4 }),
    numRooms:      fc.integer({ min: 1, max: 4 }),
    subjectPicks:  fc.array(fc.nat({ max: SUBJECTS.length - 1 }), { minLength: 3, maxLength: 6 }),
    studentCounts: fc.array(fc.integer({ min: 5, max: 30 }), { minLength: 3, maxLength: 6 }),
    capacities:    fc.array(fc.integer({ min: 10, max: 50 }), { minLength: 1, maxLength: 4 }),
  })
  .map(({ numFaculties, numLecturers, numRooms, subjectPicks, studentCounts, capacities }) => {
    const subjects = subjectPicks.map(i => SUBJECTS[i % SUBJECTS.length]!)
    const uniqueSubjects = [...new Set(subjects)]

    const lecturers: Lecturer[] = Array.from({ length: numLecturers }, (_, i) =>
      arbLecturer(`l${i}`, uniqueSubjects[i % uniqueSubjects.length]!)
    )

    const rooms: Room[] = Array.from({ length: numRooms }, (_, i) =>
      arbRoom(`r${i}`, capacities[i % capacities.length]!)
    )

    const faculties: Faculty[] = Array.from({ length: numFaculties }, (_, i) => ({
      id: `f${i}`,
      name: `Faculty${i}`,
      syllabus: uniqueSubjects.slice(0, 2).map(s => ({ subject: s, requiredHours: 1 })),
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllAssignments(state: ScheduleState): ClassAssignment[] {
  const seen = new Set<string>()
  const results: ClassAssignment[] = []

  for (const faculty of Object.values(state.faculties)) {
    for (const day of [1, 2, 3, 4, 5] as DayOfWeek[]) {
      for (const hour of [1, 2, 3, 4] as HourSlot[]) {
        const a = faculty.timetable[day][hour]
        if (a) {
          const key = `${a.facultyId}|${a.lecturerId}|${a.timeSlot.day}|${a.timeSlot.hour}`
          if (!seen.has(key)) { seen.add(key); results.push(a) }
        }
      }
    }
  }
  return results
}

function slotKey(slot: TimeSlot): string {
  return `${slot.day}-${slot.hour}`
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Scheduling algorithm — property tests', () => {

  it('Property 1: no lecturer is double-booked in the same time slot', () => {
    fc.assert(fc.property(arbScheduleInput, (input) => {
      const result: ScheduleResult = runSchedulingAlgorithm(input)
      const byLecturerSlot = new Map<string, ClassAssignment>()

      for (const a of getAllAssignments(result.schedule)) {
        const key = `${a.lecturerId}|${slotKey(a.timeSlot)}`
        expect(byLecturerSlot.has(key),
          `Lecturer ${a.lecturerId} double-booked at slot ${key}`
        ).toBe(false)
        byLecturerSlot.set(key, a)
      }

      // Also verify via the lecturer timetable
      for (const [lid, lec] of Object.entries(result.schedule.lecturers)) {
        const slots: string[] = []
        for (const d of [1,2,3,4,5] as DayOfWeek[]) {
          for (const h of [1,2,3,4] as HourSlot[]) {
            if (lec.timetable[d][h]) slots.push(`${d}-${h}`)
          }
        }
        expect(new Set(slots).size, `Lecturer ${lid} has duplicate slots`).toBe(slots.length)
      }
    }), { numRuns: 50 })
  })

  it('Property 2: no room is double-booked in the same time slot', () => {
    fc.assert(fc.property(arbScheduleInput, (input) => {
      const result = runSchedulingAlgorithm(input)
      for (const [rid, room] of Object.entries(result.schedule.rooms)) {
        const slots: string[] = []
        for (const d of [1,2,3,4,5] as DayOfWeek[]) {
          for (const h of [1,2,3,4] as HourSlot[]) {
            if (room.timetable[d][h]) slots.push(`${d}-${h}`)
          }
        }
        expect(new Set(slots).size, `Room ${rid} has duplicate slots`).toBe(slots.length)
      }
    }), { numRuns: 50 })
  })

  it('Property 3: no faculty is double-booked in the same time slot', () => {
    fc.assert(fc.property(arbScheduleInput, (input) => {
      const result = runSchedulingAlgorithm(input)
      for (const [fid, fac] of Object.entries(result.schedule.faculties)) {
        const slots: string[] = []
        for (const d of [1,2,3,4,5] as DayOfWeek[]) {
          for (const h of [1,2,3,4] as HourSlot[]) {
            if (fac.timetable[d][h]) slots.push(`${d}-${h}`)
          }
        }
        expect(new Set(slots).size, `Faculty ${fid} has duplicate slots`).toBe(slots.length)
      }
    }), { numRuns: 50 })
  })

  it('Property 4: lecturer specialty matches assigned subject', () => {
    fc.assert(fc.property(arbScheduleInput, (input) => {
      const result = runSchedulingAlgorithm(input)
      const lecturerMap = new Map(input.lecturers.map(l => [l.id, l]))

      for (const a of getAllAssignments(result.schedule)) {
        const lecturer = lecturerMap.get(a.lecturerId)
        if (!lecturer) continue
        expect(
          lecturer.specialties.includes(a.subject),
          `Lecturer ${a.lecturerId} (${lecturer.specialties}) assigned subject "${a.subject}"`
        ).toBe(true)
      }
    }), { numRuns: 50 })
  })

  it('Property 5: timetable consistency — each assignment appears in all three timetables', () => {
    fc.assert(fc.property(arbScheduleInput, (input) => {
      const result = runSchedulingAlgorithm(input)
      const { schedule } = result

      for (const a of getAllAssignments(schedule)) {
        const { day, hour } = a.timeSlot

        // Must appear in room timetable
        const roomEntry = schedule.rooms[a.roomId]?.timetable[day][hour]
        expect(roomEntry?.facultyId, `Assignment missing from room timetable`).toBe(a.facultyId)

        // Must appear in lecturer timetable
        const lecEntry = schedule.lecturers[a.lecturerId]?.timetable[day][hour]
        expect(lecEntry?.facultyId, `Assignment missing from lecturer timetable`).toBe(a.facultyId)
      }
    }), { numRuns: 50 })
  })

})
