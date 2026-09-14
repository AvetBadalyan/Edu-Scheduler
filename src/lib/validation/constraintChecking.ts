/**
 * Constraint checking functions for the scheduling algorithm.
 *
 * Each function checks a specific constraint and returns a ConstraintCheck
 * so the visualization layer can display pass/fail with details.
 *
 * Properties validated:
 *   Property 1 – No double-booking of lecturers (Req 5.1, 5.2)
 *   Property 2 – No double-booking of rooms    (Req 5.1, 5.2)
 *   Property 3 – No double-booking of faculties (Req 5.1, 5.2)
 *   Property 4 – Room capacity satisfaction     (Req 5.4, 10.3)
 *   Property 5 – Lecturer specialty match       (Req 9.3)
 *   Property 6 – Timetable consistency          (Req 12.5)
 */
import type {
  AssignmentValidation,
  ClassAssignment,
  ConstraintCheck,
  ConstraintViolation,
  Faculty,
  Lecturer,
  Room,
  ScheduleState,
} from "@/types"

// ─── Per-constraint check functions ──────────────────────────────────────────

/**
 * Property 2: No double-booking of rooms.
 * Ensures the room is free at the given time slot.
 */
export function checkRoomAvailability(
  state: ScheduleState,
  assignment: ClassAssignment
): ConstraintCheck {
  const { roomId, timeSlot: { day, hour } } = assignment
  const room = state.rooms[roomId]
  const occupied = room?.timetable[day][hour] !== null

  return {
    constraint: "Room not double-booked",
    passed: !occupied,
    details: occupied
      ? `Room ${roomId} is already booked on day ${day}, hour ${hour}.`
      : `Room ${roomId} is free on day ${day}, hour ${hour}.`,
  }
}

/**
 * Property 1: No double-booking of lecturers.
 * Ensures the lecturer is free at the given time slot.
 */
export function checkLecturerAvailability(
  state: ScheduleState,
  assignment: ClassAssignment
): ConstraintCheck {
  const { lecturerId, timeSlot: { day, hour } } = assignment
  const lecturer = state.lecturers[lecturerId]
  const occupied = lecturer?.timetable[day][hour] !== null

  return {
    constraint: "Lecturer not double-booked",
    passed: !occupied,
    details: occupied
      ? `Lecturer ${lecturerId} is already teaching on day ${day}, hour ${hour}.`
      : `Lecturer ${lecturerId} is free on day ${day}, hour ${hour}.`,
  }
}

/**
 * Property 3: No double-booking of faculties.
 * Ensures the faculty has no other class at the given time slot.
 */
export function checkFacultyAvailability(
  state: ScheduleState,
  assignment: ClassAssignment
): ConstraintCheck {
  const { facultyId, timeSlot: { day, hour } } = assignment
  const faculty = state.faculties[facultyId]
  const occupied = faculty?.timetable[day][hour] !== null

  return {
    constraint: "Faculty not double-booked",
    passed: !occupied,
    details: occupied
      ? `Faculty ${facultyId} already has a class on day ${day}, hour ${hour}.`
      : `Faculty ${facultyId} is free on day ${day}, hour ${hour}.`,
  }
}

/**
 * Property 4: Room capacity satisfaction.
 * Room capacity >= faculty student count.
 */
export function checkRoomCapacity(
  rooms: Room[],
  faculties: Faculty[],
  assignment: ClassAssignment
): ConstraintCheck {
  const room = rooms.find((r) => r.id === assignment.roomId)
  const faculty = faculties.find((f) => f.id === assignment.facultyId)

  if (!room || !faculty) {
    return {
      constraint: "Room capacity satisfied",
      passed: false,
      details: `Room or faculty not found for capacity check.`,
    }
  }

  const passed = room.capacity >= faculty.students.length
  return {
    constraint: "Room capacity satisfied",
    passed,
    details: passed
      ? `Room ${room.number} (capacity ${room.capacity}) fits ${faculty.students.length} students.`
      : `Room ${room.number} (capacity ${room.capacity}) is too small for ${faculty.students.length} students.`,
  }
}

/**
 * Property 5: Lecturer specialty match.
 * Lecturer's specialties must include the subject being assigned.
 */
export function checkLecturerSpecialty(
  lecturers: Lecturer[],
  assignment: ClassAssignment
): ConstraintCheck {
  const lecturer = lecturers.find((l) => l.id === assignment.lecturerId)

  if (!lecturer) {
    return {
      constraint: "Lecturer specialty matches subject",
      passed: false,
      details: `Lecturer ${assignment.lecturerId} not found.`,
    }
  }

  const passed = lecturer.specialties.includes(assignment.subject)
  return {
    constraint: "Lecturer specialty matches subject",
    passed,
    details: passed
      ? `${lecturer.name} ${lecturer.surname} can teach "${assignment.subject}".`
      : `${lecturer.name} ${lecturer.surname} specialties [${lecturer.specialties.join(", ")}] do not include "${assignment.subject}".`,
  }
}

/**
 * Property 6: Timetable consistency.
 * An assignment in the schedule should appear in all three timetables at the
 * same slot. Used for post-hoc verification.
 */
export function checkTimetableConsistency(
  state: ScheduleState,
  assignment: ClassAssignment
): ConstraintCheck {
  const { roomId, lecturerId, facultyId, timeSlot: { day, hour } } = assignment
  const inRoom = state.rooms[roomId]?.timetable[day][hour]
  const inLecturer = state.lecturers[lecturerId]?.timetable[day][hour]
  const inFaculty = state.faculties[facultyId]?.timetable[day][hour]

  const consistent =
    inRoom !== null && inRoom !== undefined &&
    inLecturer !== null && inLecturer !== undefined &&
    inFaculty !== null && inFaculty !== undefined

  return {
    constraint: "Timetable consistency",
    passed: consistent,
    details: consistent
      ? `Assignment appears in all three timetables at day ${day}, hour ${hour}.`
      : `Assignment is missing from one or more timetables at day ${day}, hour ${hour}.`,
  }
}

// ─── Composite validator (used by ScheduleStore and algorithm) ────────────────

/**
 * Validates all constraints for a proposed assignment.
 * Returns detailed violations list.
 *
 * @param state   Current schedule state (existing timetables)
 * @param lecturers Full lecturer array (for specialty/capacity checks)
 * @param rooms   Full room array
 * @param faculties Full faculty array
 * @param assignment The proposed new assignment
 */
export function validateAssignment(
  state: ScheduleState,
  lecturers: Lecturer[],
  rooms: Room[],
  faculties: Faculty[],
  assignment: ClassAssignment
): AssignmentValidation {
  const violations: ConstraintViolation[] = []

  const roomCheck = checkRoomAvailability(state, assignment)
  if (!roomCheck.passed) {
    violations.push({
      type: "room_conflict",
      message: roomCheck.details,
      conflictingAssignment:
        state.rooms[assignment.roomId]?.timetable[assignment.timeSlot.day][assignment.timeSlot.hour] ?? undefined,
    })
  }

  const lecturerCheck = checkLecturerAvailability(state, assignment)
  if (!lecturerCheck.passed) {
    violations.push({
      type: "lecturer_conflict",
      message: lecturerCheck.details,
      conflictingAssignment:
        state.lecturers[assignment.lecturerId]?.timetable[assignment.timeSlot.day][assignment.timeSlot.hour] ?? undefined,
    })
  }

  const facultyCheck = checkFacultyAvailability(state, assignment)
  if (!facultyCheck.passed) {
    violations.push({
      type: "faculty_conflict",
      message: facultyCheck.details,
      conflictingAssignment:
        state.faculties[assignment.facultyId]?.timetable[assignment.timeSlot.day][assignment.timeSlot.hour] ?? undefined,
    })
  }

  const capacityCheck = checkRoomCapacity(rooms, faculties, assignment)
  if (!capacityCheck.passed) {
    violations.push({ type: "capacity_exceeded", message: capacityCheck.details })
  }

  const specialtyCheck = checkLecturerSpecialty(lecturers, assignment)
  if (!specialtyCheck.passed) {
    violations.push({ type: "specialty_mismatch", message: specialtyCheck.details })
  }

  return { isValid: violations.length === 0, violations }
}

/**
 * Returns all constraint check results for a proposed assignment.
 * Used by the visualization engine to show pass/fail per constraint.
 */
export function getConstraintChecks(
  state: ScheduleState,
  lecturers: Lecturer[],
  rooms: Room[],
  faculties: Faculty[],
  assignment: ClassAssignment
): ConstraintCheck[] {
  return [
    checkRoomAvailability(state, assignment),
    checkLecturerAvailability(state, assignment),
    checkFacultyAvailability(state, assignment),
    checkRoomCapacity(rooms, faculties, assignment),
    checkLecturerSpecialty(lecturers, assignment),
  ]
}

/**
 * Collects all assignments from the full schedule state.
 * Iterates room timetables as the canonical source.
 */
export function getAllAssignments(state: ScheduleState): ClassAssignment[] {
  const assignments: ClassAssignment[] = []
  for (const room of Object.values(state.rooms)) {
    for (const day of [1, 2, 3, 4, 5] as const) {
      for (const hour of [1, 2, 3, 4] as const) {
        const a = room.timetable[day][hour]
        if (a !== null) assignments.push(a)
      }
    }
  }
  return assignments
}
