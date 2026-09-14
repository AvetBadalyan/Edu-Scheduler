/**
 * Property-based tests for schedule editing (move + undo/redo).
 * Requirements: 13.3 — 12.1, 12.4, 12.5
 */
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { emptyTimetable } from '@/lib/timetable'
import type {
  ClassAssignment, DayOfWeek, HourSlot,
  RoomWithTimetable, LecturerWithTimetable, FacultyWithTimetable,
  ScheduleState,
} from '@/types'

// ─── Minimal store-like helpers (pure functions, no Redux) ────────────────────

function makeAssignment(overrides: Partial<ClassAssignment> = {}): ClassAssignment {
  return {
    facultyId:  'f1',
    lecturerId: 'l1',
    roomId:     'r1',
    subject:    'Math',
    timeSlot:   { day: 1, hour: 1 },
    isManual:   false,
    ...overrides,
  }
}

function assignInState(state: ScheduleState, a: ClassAssignment): ScheduleState {
  const { day, hour } = a.timeSlot
  return {
    rooms: {
      ...state.rooms,
      [a.roomId]: {
        ...state.rooms[a.roomId]!,
        timetable: { ...state.rooms[a.roomId]!.timetable,
          [day]: { ...state.rooms[a.roomId]!.timetable[day], [hour]: a },
        },
      },
    },
    lecturers: {
      ...state.lecturers,
      [a.lecturerId]: {
        ...state.lecturers[a.lecturerId]!,
        timetable: { ...state.lecturers[a.lecturerId]!.timetable,
          [day]: { ...state.lecturers[a.lecturerId]!.timetable[day], [hour]: a },
        },
      },
    },
    faculties: {
      ...state.faculties,
      [a.facultyId]: {
        ...state.faculties[a.facultyId]!,
        timetable: { ...state.faculties[a.facultyId]!.timetable,
          [day]: { ...state.faculties[a.facultyId]!.timetable[day], [hour]: a },
        },
      },
    },
  }
}

function clearInState(state: ScheduleState, a: ClassAssignment): ScheduleState {
  const { day, hour } = a.timeSlot
  const clear = (t: Record<DayOfWeek, Record<HourSlot, ClassAssignment | null>>, d: DayOfWeek, h: HourSlot) =>
    ({ ...t, [d]: { ...t[d], [h]: null } })
  return {
    rooms:     { ...state.rooms,     [a.roomId]:     { ...state.rooms[a.roomId]!,     timetable: clear(state.rooms[a.roomId]!.timetable,     day, hour) } },
    lecturers: { ...state.lecturers, [a.lecturerId]: { ...state.lecturers[a.lecturerId]!, timetable: clear(state.lecturers[a.lecturerId]!.timetable, day, hour) } },
    faculties: { ...state.faculties, [a.facultyId]:  { ...state.faculties[a.facultyId]!,  timetable: clear(state.faculties[a.facultyId]!.timetable,  day, hour) } },
  }
}

function makeEmptyState(): ScheduleState {
  const roomTT:     RoomWithTimetable     = { id: 'r1', number: '101', capacity: 30, availability: emptyTimetable(), timetable: emptyTimetable(), createdAt: new Date(), updatedAt: new Date() }
  const lecTT:      LecturerWithTimetable = { id: 'l1', name: 'L', surname: 'T', specialties: ['Math'], availability: emptyTimetable(), timetable: emptyTimetable(), createdAt: new Date(), updatedAt: new Date() }
  const facTT:      FacultyWithTimetable  = { id: 'f1', name: 'F', syllabus: [{ subject: 'Math', requiredHours: 2 }], students: [], timetable: emptyTimetable(), remainingHours: { Math: 2 }, createdAt: new Date(), updatedAt: new Date() }
  return { rooms: { r1: roomTT }, lecturers: { l1: lecTT }, faculties: { f1: facTT } }
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const arbSlot = fc.record({
  day:  fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<DayOfWeek>,
  hour: fc.integer({ min: 1, max: 4 }) as fc.Arbitrary<HourSlot>,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Schedule editing — property tests', () => {

  it('Property 6: assignment appears in all three timetables after assign', () => {
    fc.assert(fc.property(arbSlot, (slot) => {
      const a = makeAssignment({ timeSlot: slot })
      const state = assignInState(makeEmptyState(), a)
      const { day, hour } = slot

      expect(state.rooms['r1']!.timetable[day][hour]).toEqual(a)
      expect(state.lecturers['l1']!.timetable[day][hour]).toEqual(a)
      expect(state.faculties['f1']!.timetable[day][hour]).toEqual(a)
    }), { numRuns: 100 })
  })

  it('Property 7: undo (clear) restores all three timetables to null', () => {
    fc.assert(fc.property(arbSlot, (slot) => {
      const a = makeAssignment({ timeSlot: slot })
      const after = assignInState(makeEmptyState(), a)
      const restored = clearInState(after, a)
      const { day, hour } = slot

      expect(restored.rooms['r1']!.timetable[day][hour]).toBeNull()
      expect(restored.lecturers['l1']!.timetable[day][hour]).toBeNull()
      expect(restored.faculties['f1']!.timetable[day][hour]).toBeNull()
    }), { numRuns: 100 })
  })

  it('Property 8: assign then clear is idempotent with initial empty state', () => {
    fc.assert(fc.property(arbSlot, (slot) => {
      const initial = makeEmptyState()
      const a = makeAssignment({ timeSlot: slot })
      const result = clearInState(assignInState(initial, a), a)
      const { day, hour } = slot

      // All three timetables at this slot should be null, same as initial
      expect(result.rooms['r1']!.timetable[day][hour])
        .toBe(initial.rooms['r1']!.timetable[day][hour])
      expect(result.lecturers['l1']!.timetable[day][hour])
        .toBe(initial.lecturers['l1']!.timetable[day][hour])
      expect(result.faculties['f1']!.timetable[day][hour])
        .toBe(initial.faculties['f1']!.timetable[day][hour])
    }), { numRuns: 100 })
  })

  it('Property 9: move — source slot empty, destination has assignment', () => {
    fc.assert(
      fc.property(
        arbSlot,
        arbSlot,
        (from, to) => {
          // Skip if same slot
          if (from.day === to.day && from.hour === to.hour) return

          const a = makeAssignment({ timeSlot: from })
          let state = assignInState(makeEmptyState(), a)

          // Move: clear from, assign at to
          const moved = makeAssignment({ timeSlot: to })
          state = clearInState(state, a)
          state = assignInState(state, moved)

          const { day: fd, hour: fh } = from
          const { day: td, hour: th } = to

          expect(state.rooms['r1']!.timetable[fd][fh]).toBeNull()
          expect(state.rooms['r1']!.timetable[td][th]).toEqual(moved)
        }
      ),
      { numRuns: 100 }
    )
  })

})
