/**
 * Scheduling Algorithm — Backtracking CSP Solver
 *
 * HOW IT WORKS:
 *
 * We have a list of classes to place (e.g. "JavaScript for Frontend Bootcamp").
 * Each class needs a free time slot + a qualified lecturer + a big enough room,
 * all at the same time with no conflicts.
 *
 * Step 1 — Sort by hardest first:
 *   Classes with fewer qualified lecturers go first. Scheduling the hardest
 *   classes first means less backtracking later.
 *
 * Step 2 — Try options one by one:
 *   For each class we try every (time slot + lecturer + room) combination.
 *   The moment we find one where nothing conflicts, we place the class and
 *   move on to the next.
 *
 * Step 3 — Backtrack if stuck:
 *   If a class has zero valid options, we go back to the previous class,
 *   undo its placement, and try its next option. This is backtracking.
 *   We repeat until all classes are placed or we run out of options.
 */

import { ALL_DAYS, ALL_HOURS, emptyTimetable } from '@/lib/timetable'
import { validateScheduleInput } from '@/lib/validation/scheduleValidation'
import type {
	BacktrackingOptions,
	ClassAssignment,
	DayOfWeek,
	FacultyId,
	FacultyWithTimetable,
	HourSlot,
	LecturerId,
	LecturerWithTimetable,
	RoomId,
	RoomWithTimetable,
	ScheduleInput,
	ScheduleResult,
	ScheduleState,
	UnresolvedConstraint,
} from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

/** All three timetables together — mutated as assignments are made and undone. */
interface MutableState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
}

/** One class waiting to be placed. */
interface QueueEntry {
	facultyId: FacultyId
	subject: string
	/** How many lecturers can teach this subject — fewer means harder to place. */
	lecturerCount: number
}

/** One fully-specified option for placing a class: slot + lecturer + room. */
interface Candidate {
	day: DayOfWeek
	hour: HourSlot
	lecturerId: LecturerId
	roomId: RoomId
}

/** Per-class backtracking state. */
interface ClassItem {
	/** Options to try, built fresh on each visit. */
	candidates: Candidate[]
	/** Which option to try next. */
	cursor: number
	/** What we placed here, or null if nothing placed yet. */
	placed: ClassAssignment | null
}

// ─── Default options ──────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: BacktrackingOptions = {
	maxBacktracks: 10000,
	preferEvenDistribution: true,
	minimizeRoomWaste: true,
}

// ─── Setup ────────────────────────────────────────────────────────────────────

// Create an empty timetable for every room, lecturer, and faculty.
// Every slot starts as null (free).
function initState(input: ScheduleInput): MutableState {
	const state: MutableState = { rooms: {}, lecturers: {}, faculties: {} }

	for (const room of input.rooms) state.rooms[room.id] = { ...room, timetable: emptyTimetable() }

	for (const lecturer of input.lecturers)
		state.lecturers[lecturer.id] = { ...lecturer, timetable: emptyTimetable() }

	for (const faculty of input.faculties)
		state.faculties[faculty.id] = { ...faculty, timetable: emptyTimetable() }

	return state
}

// Build the list of classes to place.
// One syllabus entry like "JavaScript: 5 hours" becomes 5 items in the queue.
// Sorted so the hardest-to-place classes go first.
function buildQueue(input: ScheduleInput): QueueEntry[] {
	const queue: QueueEntry[] = []

	for (const faculty of input.faculties) {
		for (const entry of faculty.syllabus) {
			const lecturerCount = input.lecturers.filter(l =>
				l.specialties.includes(entry.subject)
			).length

			for (let i = 0; i < entry.requiredHours; i++) {
				queue.push({ facultyId: faculty.id, subject: entry.subject, lecturerCount })
			}
		}
	}

	// Fewest qualified lecturers = hardest to place = goes first
	queue.sort((a, b) => a.lecturerCount - b.lecturerCount)
	return queue
}

// Build every (time slot + lecturer + room) option for one class.
// Slots sorted so days with fewer classes are filled first (even spread).
// Rooms sorted smallest-first to avoid wasting a big room on a small group.
function buildCandidates(
	facultyId: FacultyId,
	subject: string,
	input: ScheduleInput,
	state: MutableState,
	options: BacktrackingOptions
): Candidate[] {
	const faculty = state.faculties[facultyId]

	const qualifiedLecturers = input.lecturers.filter(l => l.specialties.includes(subject))

	const eligibleRooms = input.rooms
		.filter(r => r.capacity >= faculty.students.length)
		.sort((a, b) => (options.minimizeRoomWaste ? a.capacity - b.capacity : 0))

	const timeSlots = ALL_DAYS.flatMap(day => {
		const classesThisDay = ALL_HOURS.filter(h => faculty.timetable[day][h] !== null).length
		return ALL_HOURS.map(hour => ({ day, hour, classesThisDay }))
	}).sort((a, b) =>
		options.preferEvenDistribution ? a.classesThisDay - b.classesThisDay || a.hour - b.hour : 0
	)

	// Flat list of every combination in priority order
	const candidates: Candidate[] = []
	for (const { day, hour } of timeSlots)
		for (const lecturer of qualifiedLecturers)
			for (const room of eligibleRooms)
				candidates.push({ day, hour, lecturerId: lecturer.id, roomId: room.id })

	return candidates
}

// ─── Timetable helpers ────────────────────────────────────────────────────────

// Are the faculty, lecturer, and room all free at this day + hour?
function isSlotFree(
	state: MutableState,
	facultyId: FacultyId,
	lecturerId: LecturerId,
	roomId: RoomId,
	day: DayOfWeek,
	hour: HourSlot
): boolean {
	return (
		state.faculties[facultyId].timetable[day][hour] === null &&
		state.lecturers[lecturerId].timetable[day][hour] === null &&
		state.rooms[roomId].timetable[day][hour] === null
	)
}

// Place this assignment into all three timetables at the same time.
function placeAssignment(state: MutableState, assignment: ClassAssignment): void {
	const { day, hour } = assignment.timeSlot
	state.faculties[assignment.facultyId].timetable[day][hour] = assignment
	state.lecturers[assignment.lecturerId].timetable[day][hour] = assignment
	state.rooms[assignment.roomId].timetable[day][hour] = assignment
}

// Remove this assignment from all three timetables (called when backtracking).
function removeAssignment(state: MutableState, assignment: ClassAssignment): void {
	const { day, hour } = assignment.timeSlot
	state.faculties[assignment.facultyId].timetable[day][hour] = null
	state.lecturers[assignment.lecturerId].timetable[day][hour] = null
	state.rooms[assignment.roomId].timetable[day][hour] = null
}

// ─── Main algorithm ───────────────────────────────────────────────────────────

export function runSchedulingAlgorithm(
	input: ScheduleInput,
	options: BacktrackingOptions = DEFAULT_OPTIONS
): ScheduleResult {
	// Validate first
	const validation = validateScheduleInput(input)
	if (!validation.isValid) {
		return {
			success: false,
			schedule: { rooms: {}, lecturers: {}, faculties: {} },
			totalSteps: 0,
			backtracks: 0,
			unresolvedConstraints: validation.errors.map(e => ({
				type: e.code,
				description: e.message,
				affectedEntities: [],
			})),
		}
	}

	const state = initState(input)
	const queue = buildQueue(input)

	// One item per class in the queue.
	// candidates — list of options to try (built fresh on each visit)
	// cursor     — which option to try next
	// placed     — what we placed here (null if nothing placed yet)
	const classItems: ClassItem[] = queue.map(() => ({ candidates: [], cursor: 0, placed: null }))

	let backtracks = 0
	const unresolvedConstraints: UnresolvedConstraint[] = []

	let classIndex = 0
	while (classIndex < queue.length) {
		const { facultyId, subject } = queue[classIndex]
		const faculty = state.faculties[facultyId]

		// Build the candidate list on first visit, or after a backtrack cleared it.
		// We rebuild after backtrack because freeing a slot changes what's available.
		if (classItems[classIndex].candidates.length === 0) {
			classItems[classIndex].candidates = buildCandidates(facultyId, subject, input, state, options)
			classItems[classIndex].cursor = 0
		}

		// Try each candidate from where we left off
		let placed = false
		while (classItems[classIndex].cursor < classItems[classIndex].candidates.length) {
			const { day, hour, lecturerId, roomId } =
				classItems[classIndex].candidates[classItems[classIndex].cursor]

			if (!isSlotFree(state, facultyId, lecturerId, roomId, day, hour)) {
				classItems[classIndex].cursor++ // this slot is taken, try the next one
				continue
			}

			// Free slot found — place the class
			const assignment: ClassAssignment = {
				facultyId,
				lecturerId,
				roomId,
				subject,
				timeSlot: { day, hour },
				isManual: false,
			}
			placeAssignment(state, assignment)
			classItems[classIndex].placed = assignment

			placed = true
			classIndex++ // move on to the next class
			break
		}

		if (placed) continue

		// No valid option found — backtrack
		classItems[classIndex].candidates = [] // will rebuild fresh on next visit
		classItems[classIndex].cursor = 0

		const canBacktrack = classIndex > 0 && backtracks < options.maxBacktracks
		if (!canBacktrack) {
			// Truly stuck — record as unresolved and skip this class
			unresolvedConstraints.push({
				type: 'NO_VALID_SLOT',
				description: `Could not place "${subject}" for "${faculty.name}".`,
				affectedEntities: [facultyId, subject],
			})
			classIndex++
		} else {
			// Go back one step, undo the previous placement, try its next option
			classIndex--
			const previousClass = classItems[classIndex].placed
			if (previousClass) {
				removeAssignment(state, previousClass)
				classItems[classIndex].placed = null
			}
			classItems[classIndex].candidates = [] // rebuild — timetable just changed
			backtracks++
		}
	}

	const totalPlaced = classItems.filter(item => item.placed !== null).length

	return {
		success: unresolvedConstraints.length === 0,
		schedule: state as ScheduleState,
		totalSteps: totalPlaced + backtracks,
		backtracks,
		unresolvedConstraints,
	}
}
