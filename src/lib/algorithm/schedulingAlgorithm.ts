/**
 * Core Scheduling Algorithm — Chronological Backtracking CSP Solver
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
 * - True chronological backtracking: each queue item has a flat candidate list
 *   (slot × lecturer × room) and a cursor into it. On backtrack the cursor of
 *   the failed item resets, we step back to the previous item, undo its
 *   placement, and advance its cursor past the option that just failed —
 *   guaranteeing we never revisit the same dead end.
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

// ─── Candidate builder ────────────────────────────────────────────────────────

/**
 * A fully-specified placement option for one queue item.
 * Building the list once per item (in slot-first order) lets the backtracker
 * simply advance a cursor rather than re-running the triple nested loop.
 */
interface Candidate {
	day: DayOfWeek
	hour: HourSlot
	lecturerId: LecturerId
	roomId: RoomId
}

function buildCandidates(
	facultyId: FacultyId,
	subject: string,
	input: ScheduleInput,
	state: MutableState,
	options: BacktrackingOptions
): Candidate[] {
	const faculty = state.faculties[facultyId]
	const qualifiedLecturers = input.lecturers.filter(l => l.specialties.includes(subject))
	const eligibleRooms = sortedRooms(input, faculty.students.length, options)
	const timeSlots = sortedTimeSlots(state, facultyId, options)

	const candidates: Candidate[] = []
	for (const { day, hour } of timeSlots) {
		for (const lecturer of qualifiedLecturers) {
			for (const room of eligibleRooms) {
				candidates.push({ day, hour, lecturerId: lecturer.id, roomId: room.id })
			}
		}
	}
	return candidates
}

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Generates a schedule using constraint satisfaction with backtracking.
 * Yields AlgorithmStep objects for visualization at each decision point.
 *
 * Uses chronological backtracking with per-item candidate cursors:
 * - Each queue item has a flat list of (slot, lecturer, room) candidates built
 *   once from the heuristic orderings.
 * - A cursor per item tracks the next candidate to try.
 * - On backtrack the cursor of the failed item resets to 0, we step back to
 *   the previous item, undo its assignment, and advance its cursor by 1 so it
 *   tries the next option — never revisiting the same dead end.
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

	// ── 3. Assignment loop with chronological backtracking ───────────────────
	//
	// Per-item cursors are the key: each queue[i] gets cursors[i] which is the
	// index into that item's candidate list of the *next option to try*.
	// When we backtrack to item i we advance cursors[i] past the option that
	// just caused trouble — so we never revisit the same dead end.

	let queueIndex = 0

	// placed[i] = the assignment currently occupying queue[i]'s slot (or null).
	const placed: (ClassAssignment | null)[] = new Array(queue.length).fill(null)
	// cursors[i] = index into queue[i]'s candidate list to try next.
	const cursors: number[] = new Array(queue.length).fill(0)
	// candidateLists[i] is built lazily the first time we visit item i.
	const candidateLists: (Candidate[] | null)[] = new Array(queue.length).fill(null)

	while (queueIndex < queue.length) {
		const { facultyId, subject } = queue[queueIndex]
		const faculty = state.faculties[facultyId]

		// Build candidate list the first time we visit this item
		if (candidateLists[queueIndex] === null) {
			candidateLists[queueIndex] = buildCandidates(facultyId, subject, input, state, options)

			yield step('evaluate', `Looking for slot to assign "${subject}" for "${faculty.name}".`, {
				currentFaculty: facultyId,
				currentSubject: subject,
			})
		}

		const candidates = candidateLists[queueIndex]!
		let assigned = false

		// Walk candidate list from the current cursor — skip any that are now
		// occupied (a prior backtrack may have freed them but also constraints
		// may have changed since the list was built).
		while (cursors[queueIndex] < candidates.length) {
			const { day, hour, lecturerId, roomId } = candidates[cursors[queueIndex]]

			const isValid =
				state.lecturers[lecturerId].timetable[day][hour] === null &&
				state.rooms[roomId].timetable[day][hour] === null &&
				state.faculties[facultyId].timetable[day][hour] === null

			if (!isValid) {
				cursors[queueIndex]++
				continue
			}

			// Valid slot found — assign atomically to all three timetables.
			const assignment: ClassAssignment = {
				facultyId,
				lecturerId,
				roomId,
				subject,
				timeSlot: { day, hour },
				isManual: false,
			}

			state.rooms[roomId].timetable[day][hour] = assignment
			state.lecturers[lecturerId].timetable[day][hour] = assignment
			state.faculties[facultyId].timetable[day][hour] = assignment
			placed[queueIndex] = assignment

			const lecturer = input.lecturers.find(l => l.id === lecturerId)!
			const room = input.rooms.find(r => r.id === roomId)!

			yield step(
				'assign',
				`Assigned "${subject}" to ${lecturer.name} in room ${room.number} on day ${day} hour ${hour}.`,
				{
					currentFaculty: facultyId,
					currentSubject: subject,
					currentLecturer: lecturerId,
					currentRoom: roomId,
					currentSlot: { day, hour },
				}
			)

			assigned = true
			queueIndex++
			break
		}

		if (!assigned) {
			// This item has exhausted all its candidates — backtrack.
			// Reset this item's cursor and candidate list so it rebuilds fresh
			// next time we reach it (constraints will have changed).
			cursors[queueIndex] = 0
			candidateLists[queueIndex] = null

			if (backtracks >= options.maxBacktracks || queueIndex === 0) {
				// Can't backtrack further — record as unresolved and skip forward.
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

				queueIndex++
			} else {
				// Step back to the previous item and undo its placement.
				queueIndex--
				const prev = placed[queueIndex]!
				const {
					roomId,
					lecturerId,
					timeSlot: { day, hour },
				} = prev
				state.rooms[roomId].timetable[day][hour] = null
				state.lecturers[lecturerId].timetable[day][hour] = null
				state.faculties[prev.facultyId].timetable[day][hour] = null
				placed[queueIndex] = null

				// Advance the previous item's cursor PAST the option it just used,
				// so it won't try the same placement again.
				cursors[queueIndex]++
				backtracks++

				yield step(
					'backtrack',
					`Backtracking (${backtracks}/${options.maxBacktracks}). Undoing "${prev.subject}" assignment, trying next option.`,
					{
						currentFaculty: prev.facultyId,
						currentSubject: prev.subject,
						currentLecturer: prev.lecturerId,
						currentRoom: prev.roomId,
						currentSlot: { day, hour },
					}
				)
			}
		}
	}

	// ── 4. Complete ───────────────────────────────────────────────────────────

	const totalAssigned = placed.filter(Boolean).length
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
