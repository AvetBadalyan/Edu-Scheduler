/**
 * Core Scheduling Algorithm with Backtracking
 *
 * Solves the constraint satisfaction problem: given faculties with syllabi,
 * lecturers with specialties, and rooms with capacities, assign classes to
 * time slots while respecting all constraints.
 *
 * Design:
 * - Uses a generator so callers can collect AlgorithmSteps for visualization
 * - Applies a "most constrained first" heuristic (subjects with the fewest
 *   qualified lecturers are scheduled first) to reduce backtracking
 * - Prefers distributing classes evenly across days
 * - Minimizes room capacity waste by sorting eligible rooms ascending
 * - Backtracks (undoes the previous assignment) when no valid slot is found
 */
import { ALL_DAYS, ALL_HOURS, emptyTimetable } from '@/lib/timetable'
import { validateScheduleInput } from '@/lib/validation/scheduleValidation'
import type {
	AlgorithmStep,
	BacktrackingOptions,
	ClassAssignment,
	DayOfWeek,
	FacultyId,
	FacultyWithTimetable,
	HourSlot,
	LecturerId,
	LecturerWithTimetable,
	Room,
	RoomId,
	RoomWithTimetable,
	ScheduleInput,
	ScheduleResult,
	ScheduleState,
	UnresolvedConstraint,
	ValidationResult,
} from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ALL_DAYS
const HOURS = ALL_HOURS

const DEFAULT_OPTIONS: BacktrackingOptions = {
	maxBacktracks: 10000,
	preferEvenDistribution: true,
	minimizeRoomWaste: true,
}

// ─── Internal mutable state ───────────────────────────────────────────────────

interface MutableState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
}

// ─── Factory helpers ──────────────────────────────────────────────────────────

function initState(input: ScheduleInput): MutableState {
	const state: MutableState = { rooms: {}, lecturers: {}, faculties: {} }

	for (const room of input.rooms) {
		state.rooms[room.id] = { ...room, timetable: emptyTimetable() }
	}
	for (const lecturer of input.lecturers) {
		state.lecturers[lecturer.id] = { ...lecturer, timetable: emptyTimetable() }
	}
	for (const faculty of input.faculties) {
		state.faculties[faculty.id] = {
			...faculty,
			timetable: emptyTimetable(),
		}
	}

	return state
}

// ─── Heuristics ──────────────────────────────────────────────────────────────

/**
 * Returns a list of (facultyId, subject) pairs ordered by most constrained:
 * subjects with fewer available lecturers are scheduled first.
 */
function buildAssignmentQueue(
	input: ScheduleInput
): Array<{ facultyId: FacultyId; subject: string; count: number }> {
	const queue: Array<{ facultyId: FacultyId; subject: string; count: number }> = []

	for (const faculty of input.faculties) {
		for (const entry of faculty.syllabus) {
			const lecturerCount = input.lecturers.filter(l =>
				l.specialties.includes(entry.subject)
			).length
			for (let i = 0; i < entry.requiredHours; i++) {
				queue.push({
					facultyId: faculty.id,
					subject: entry.subject,
					count: lecturerCount,
				})
			}
		}
	}

	// Most constrained first
	queue.sort((a, b) => a.count - b.count)
	return queue
}

/**
 * Returns time slots sorted to prefer even distribution across days.
 */
function sortedTimeSlots(
	state: MutableState,
	facultyId: FacultyId,
	options: BacktrackingOptions
): Array<{ day: DayOfWeek; hour: HourSlot }> {
	const slots: Array<{ day: DayOfWeek; hour: HourSlot; dayUsage: number }> = []

	const faculty = state.faculties[facultyId]

	for (const day of DAYS) {
		const dayUsage = HOURS.filter(h => faculty.timetable[day][h] !== null).length
		for (const hour of HOURS) {
			slots.push({ day, hour, dayUsage })
		}
	}

	if (options.preferEvenDistribution) {
		slots.sort((a, b) => a.dayUsage - b.dayUsage || a.hour - b.hour)
	}

	return slots
}

/**
 * Returns rooms sorted by capacity (ascending) to minimize waste.
 */
function sortedRooms(
	input: ScheduleInput,
	facultyStudentCount: number,
	options: BacktrackingOptions
): Room[] {
	const eligible = input.rooms.filter(r => r.capacity >= facultyStudentCount)
	if (options.minimizeRoomWaste) {
		eligible.sort((a, b) => a.capacity - b.capacity)
	}
	return eligible
}

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Generates a schedule using constraint satisfaction with backtracking.
 * Yields AlgorithmStep objects for visualization at each decision point.
 *
 * @yields AlgorithmStep — one step per evaluate/assign/conflict/backtrack/complete
 * @returns ScheduleResult — final outcome with the complete or partial schedule
 */
export function* generateSchedule(
	input: ScheduleInput,
	options: BacktrackingOptions = DEFAULT_OPTIONS
): Generator<AlgorithmStep, ScheduleResult> {
	let stepNumber = 0
	let backtracks = 0
	const unresolvedConstraints: UnresolvedConstraint[] = []

	const step = (
		type: AlgorithmStep['type'],
		description: string,
		extra: Partial<AlgorithmStep> = {}
	): AlgorithmStep => ({
		stepNumber: ++stepNumber,
		type,
		description,
		...extra,
	})

	// ── 1. Validate input ────────────────────────────────────────────────────

	const validation: ValidationResult = validateScheduleInput(input)
	if (!validation.isValid) {
		const errMsg = validation.errors.map(e => e.message).join('; ')
		yield step('complete', `Validation failed: ${errMsg}`)
		return {
			success: false,
			schedule: { rooms: {}, lecturers: {}, faculties: {} },
			totalSteps: stepNumber,
			backtracks: 0,
			unresolvedConstraints: validation.errors.map(e => ({
				type: e.code,
				description: e.message,
				affectedEntities: [],
			})),
		}
	}

	// ── 2. Initialize mutable state ──────────────────────────────────────────

	const state = initState(input)
	const queue = buildAssignmentQueue(input)

	yield step('evaluate', `Starting schedule generation for ${queue.length} class assignments.`)

	// ── 3. Assignment loop with backtracking ─────────────────────────────────

	let queueIndex = 0
	const assignmentHistory: ClassAssignment[] = []

	while (queueIndex < queue.length) {
		const { facultyId, subject } = queue[queueIndex]
		const faculty = state.faculties[facultyId]

		// Find qualified lecturers
		const qualifiedLecturers = input.lecturers.filter(l => l.specialties.includes(subject))

		const eligibleRooms = sortedRooms(input, faculty.students.length, options)
		const timeSlots = sortedTimeSlots(state, facultyId, options)

		yield step('evaluate', `Looking for slot to assign "${subject}" for "${faculty.name}".`, {
			currentFaculty: facultyId,
			currentSubject: subject,
		})

		let assigned = false

		outerLoop: for (const { day, hour } of timeSlots) {
			for (const lecturer of qualifiedLecturers) {
				// Skip if lecturer is busy at this slot
				if (state.lecturers[lecturer.id].timetable[day][hour] !== null) continue

				for (const room of eligibleRooms) {
					// Skip if room or faculty is busy at this slot
					if (state.rooms[room.id].timetable[day][hour] !== null) continue
					if (state.faculties[facultyId].timetable[day][hour] !== null) continue

					// All three are free — this slot is valid.
					// Build the assignment and write it to all three timetables atomically.
					const candidate: ClassAssignment = {
						facultyId,
						lecturerId: lecturer.id,
						roomId: room.id,
						subject,
						timeSlot: { day, hour },
						isManual: false,
					}

					state.rooms[room.id].timetable[day][hour] = candidate
					state.lecturers[lecturer.id].timetable[day][hour] = candidate
					state.faculties[facultyId].timetable[day][hour] = candidate

					assignmentHistory.push(candidate)

					yield step(
						'assign',
						`Assigned "${subject}" to ${lecturer.name} in room ${room.number} on day ${day} hour ${hour}.`,
						{
							currentFaculty: facultyId,
							currentSubject: subject,
							currentLecturer: lecturer.id,
							currentRoom: room.id,
							currentSlot: { day, hour },
						}
					)

					assigned = true
					queueIndex++
					break outerLoop
				}
			}
		}

		if (!assigned) {
			// Backtrack
			if (backtracks >= options.maxBacktracks || assignmentHistory.length === 0) {
				// Cannot backtrack further — record unresolved constraint
				unresolvedConstraints.push({
					type: 'NO_VALID_SLOT',
					description: `Could not schedule "${subject}" for faculty "${faculty.name}". No valid time slot found.`,
					affectedEntities: [facultyId, subject],
				})

				yield step(
					'backtrack',
					`No valid slot for "${subject}" (faculty "${faculty.name}"). Recording as unresolved and continuing.`,
					{
						currentFaculty: facultyId,
						currentSubject: subject,
					}
				)

				queueIndex++ // Skip this assignment
			} else {
				// Undo last assignment
				const lastAssignment = assignmentHistory.pop()!
				const {
					roomId,
					lecturerId,
					timeSlot: { day, hour },
				} = lastAssignment
				state.rooms[roomId].timetable[day][hour] = null
				state.lecturers[lecturerId].timetable[day][hour] = null
				state.faculties[lastAssignment.facultyId].timetable[day][hour] = null

				backtracks++
				queueIndex-- // Retry the previous item too

				yield step(
					'backtrack',
					`Backtracking (${backtracks}/${options.maxBacktracks}). Undoing last assignment of "${lastAssignment.subject}".`,
					{
						currentFaculty: lastAssignment.facultyId,
						currentSubject: lastAssignment.subject,
					}
				)
			}
		}
	}

	// ── 4. Complete ───────────────────────────────────────────────────────────

	const totalAssigned = assignmentHistory.length
	const success = unresolvedConstraints.length === 0

	yield step(
		'complete',
		success
			? `Schedule complete! ${totalAssigned} classes assigned with ${backtracks} backtracks.`
			: `Schedule partially complete. ${totalAssigned} classes assigned; ${unresolvedConstraints.length} constraints unresolved.`
	)

	return {
		success,
		schedule: state as ScheduleState,
		totalSteps: stepNumber,
		backtracks,
		unresolvedConstraints,
	}
}

/**
 * Runs the generator to completion and returns the final ScheduleResult.
 * Use when you don't need step-by-step visualization.
 */
export function runSchedulingAlgorithm(
	input: ScheduleInput,
	options?: BacktrackingOptions
): ScheduleResult {
	const gen = generateSchedule(input, options)
	let result = gen.next()
	while (!result.done) {
		result = gen.next()
	}
	return result.value as ScheduleResult
}

/**
 * Collects all AlgorithmSteps from a generator run.
 * Used by the visualization store.
 */
export function collectSteps(
	input: ScheduleInput,
	options?: BacktrackingOptions
): { steps: AlgorithmStep[]; result: ScheduleResult } {
	const steps: AlgorithmStep[] = []
	const gen = generateSchedule(input, options)
	let next = gen.next()
	while (!next.done) {
		steps.push(next.value as AlgorithmStep)
		next = gen.next()
	}
	return { steps, result: next.value as ScheduleResult }
}
