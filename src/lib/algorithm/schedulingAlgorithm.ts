/**
 * Scheduling Algorithm — Backtracking CSP Solver
 *
 * Given faculties (with syllabi), lecturers (with specialties), and rooms
 * (with capacities), assigns every class to a time slot with no conflicts.
 *
 * How it works:
 * 1. Sort classes by "most constrained first" — hardest to place goes first.
 * 2. For each class, try every (time slot, lecturer, room) combination in order.
 * 3. If a class has no valid option, undo the previous placement and try its
 *    next option instead. This is backtracking.
 * 4. Repeat until all classes are placed or truly cannot be placed.
 *
 * The generator yields one AlgorithmStep per decision so the UI can visualize
 * the process step by step.
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

// ─── Types ────────────────────────────────────────────────────────────────────

/** All three timetables in one place — mutated as assignments are made/undone. */
interface MutableState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
}

/**
 * One fully-specified option for placing a class:
 * a specific time slot + lecturer + room combination.
 */
interface Candidate {
	day: DayOfWeek
	hour: HourSlot
	lecturerId: LecturerId
	roomId: RoomId
}

/**
 * Per-queue-item state used by the backtracker.
 * Keeping these together (rather than three separate arrays) makes the
 * backtrack logic easier to read.
 */
interface ItemState {
	/** Every valid (slot, lecturer, room) combo for this class, pre-sorted. */
	candidates: Candidate[]
	/** Which candidate to try next. Advances on each failed attempt. */
	cursor: number
	/** The assignment currently placed for this item, or null if unplaced. */
	placed: ClassAssignment | null
}

// ─── Default options ──────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: BacktrackingOptions = {
	maxBacktracks: 10000,
	preferEvenDistribution: true,
	minimizeRoomWaste: true,
}

// ─── Setup helpers ────────────────────────────────────────────────────────────

/** Creates empty timetables for every room, lecturer, and faculty. */
function initState(input: ScheduleInput): MutableState {
	const state: MutableState = { rooms: {}, lecturers: {}, faculties: {} }
	for (const room of input.rooms) state.rooms[room.id] = { ...room, timetable: emptyTimetable() }
	for (const lecturer of input.lecturers)
		state.lecturers[lecturer.id] = { ...lecturer, timetable: emptyTimetable() }
	for (const faculty of input.faculties)
		state.faculties[faculty.id] = { ...faculty, timetable: emptyTimetable() }
	return state
}

/**
 * Builds the list of classes to place, sorted most-constrained-first.
 * "Most constrained" = fewest lecturers qualified to teach that subject.
 * Scheduling the hardest classes first reduces backtracking.
 */
function buildQueue(input: ScheduleInput): Array<{ facultyId: FacultyId; subject: string }> {
	const queue: Array<{ facultyId: FacultyId; subject: string; qualifiedCount: number }> = []

	for (const faculty of input.faculties) {
		for (const entry of faculty.syllabus) {
			const qualifiedCount = input.lecturers.filter(l =>
				l.specialties.includes(entry.subject)
			).length
			for (let i = 0; i < entry.requiredHours; i++) {
				queue.push({ facultyId: faculty.id, subject: entry.subject, qualifiedCount })
			}
		}
	}

	queue.sort((a, b) => a.qualifiedCount - b.qualifiedCount)
	return queue
}

/**
 * Builds every possible (time slot, lecturer, room) combination for one class.
 * Slots are sorted to spread classes evenly across days.
 * Rooms are sorted smallest-first to minimize empty seats.
 */
function buildCandidates(
	facultyId: FacultyId,
	subject: string,
	input: ScheduleInput,
	state: MutableState,
	options: BacktrackingOptions
): Candidate[] {
	const faculty = state.faculties[facultyId]

	// Lecturers who can teach this subject
	const qualifiedLecturers = input.lecturers.filter(l => l.specialties.includes(subject))

	// Rooms big enough for this faculty's students, smallest first
	const eligibleRooms: Room[] = input.rooms
		.filter(r => r.capacity >= faculty.students.length)
		.sort((a, b) => (options.minimizeRoomWaste ? a.capacity - b.capacity : 0))

	// Time slots sorted so days with fewer classes are preferred
	const timeSlots = ALL_DAYS.flatMap(day => {
		const dayUsage = ALL_HOURS.filter(h => faculty.timetable[day][h] !== null).length
		return ALL_HOURS.map(hour => ({ day, hour, dayUsage }))
	}).sort((a, b) =>
		options.preferEvenDistribution ? a.dayUsage - b.dayUsage || a.hour - b.hour : 0
	)

	// Flat list of all combinations in priority order
	const candidates: Candidate[] = []
	for (const { day, hour } of timeSlots)
		for (const lecturer of qualifiedLecturers)
			for (const room of eligibleRooms)
				candidates.push({ day, hour, lecturerId: lecturer.id, roomId: room.id })

	return candidates
}

// ─── Timetable helpers ────────────────────────────────────────────────────────

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

function writeAssignment(state: MutableState, a: ClassAssignment): void {
	const { day, hour } = a.timeSlot
	state.faculties[a.facultyId].timetable[day][hour] = a
	state.lecturers[a.lecturerId].timetable[day][hour] = a
	state.rooms[a.roomId].timetable[day][hour] = a
}

function clearAssignment(state: MutableState, a: ClassAssignment): void {
	const { day, hour } = a.timeSlot
	state.faculties[a.facultyId].timetable[day][hour] = null
	state.lecturers[a.lecturerId].timetable[day][hour] = null
	state.rooms[a.roomId].timetable[day][hour] = null
}

// ─── Core algorithm ───────────────────────────────────────────────────────────

export function* generateSchedule(
	input: ScheduleInput,
	options: BacktrackingOptions = DEFAULT_OPTIONS
): Generator<AlgorithmStep, ScheduleResult> {
	let stepNumber = 0
	let backtracks = 0
	const unresolvedConstraints: UnresolvedConstraint[] = []

	// Helper to create a step object for the visualization player
	const step = (
		type: AlgorithmStep['type'],
		description: string,
		extra: Partial<AlgorithmStep> = {}
	): AlgorithmStep => ({ stepNumber: ++stepNumber, type, description, ...extra })

	// ── 1. Validate ──────────────────────────────────────────────────────────

	const validation: ValidationResult = validateScheduleInput(input)
	if (!validation.isValid) {
		yield step('complete', `Validation failed: ${validation.errors.map(e => e.message).join('; ')}`)
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

	// ── 2. Initialize ────────────────────────────────────────────────────────

	const state = initState(input)
	const queue = buildQueue(input)

	// Per-item backtracking state. items[i] tracks everything we need to
	// place, retry, or undo queue[i].
	const items: ItemState[] = queue.map(() => ({
		candidates: [], // built on first visit (state may differ on revisit)
		cursor: 0,
		placed: null,
	}))

	yield step('evaluate', `Starting schedule generation for ${queue.length} class assignments.`)

	// ── 3. Main loop ─────────────────────────────────────────────────────────
	//
	// We walk forward through the queue placing classes one by one.
	// When a class has no valid option, we walk backward (backtrack),
	// undo the previous placement, and try that item's next option.

	let i = 0
	while (i < queue.length) {
		const { facultyId, subject } = queue[i]
		const faculty = state.faculties[facultyId]

		// Build candidates on first visit (or after a backtrack cleared them).
		// We rebuild after backtrack because freed slots change what's available.
		if (items[i].candidates.length === 0) {
			items[i].candidates = buildCandidates(facultyId, subject, input, state, options)
			items[i].cursor = 0
			yield step('evaluate', `Looking for a slot for "${subject}" (${faculty.name}).`, {
				currentFaculty: facultyId,
				currentSubject: subject,
			})
		}

		// Try candidates from the current cursor onward
		let placed = false
		while (items[i].cursor < items[i].candidates.length) {
			const { day, hour, lecturerId, roomId } = items[i].candidates[items[i].cursor]

			if (!isSlotFree(state, facultyId, lecturerId, roomId, day, hour)) {
				items[i].cursor++
				continue
			}

			// Found a valid slot — place the class
			const assignment: ClassAssignment = {
				facultyId,
				lecturerId,
				roomId,
				subject,
				timeSlot: { day, hour },
				isManual: false,
			}
			writeAssignment(state, assignment)
			items[i].placed = assignment

			const lecturer = input.lecturers.find(l => l.id === lecturerId)!
			const room = input.rooms.find(r => r.id === roomId)!
			yield step(
				'assign',
				`Assigned "${subject}" to ${lecturer.name} in room ${room.number} (day ${day}, hour ${hour}).`,
				{
					currentFaculty: facultyId,
					currentSubject: subject,
					currentLecturer: lecturerId,
					currentRoom: roomId,
					currentSlot: { day, hour },
				}
			)

			placed = true
			i++
			break
		}

		if (placed) continue

		// No valid candidate found for this class — backtrack
		items[i].candidates = [] // clear so it rebuilds on next visit
		items[i].cursor = 0

		const canBacktrack = i > 0 && backtracks < options.maxBacktracks
		if (!canBacktrack) {
			// Truly stuck — record as unresolved and move on
			unresolvedConstraints.push({
				type: 'NO_VALID_SLOT',
				description: `Could not place "${subject}" for "${faculty.name}".`,
				affectedEntities: [facultyId, subject],
			})
			yield step('backtrack', `No slot found for "${subject}" — skipping.`, {
				currentFaculty: facultyId,
				currentSubject: subject,
			})
			i++
		} else {
			// Step back, undo the previous placement, try its next option
			i--
			const prev = items[i].placed!
			clearAssignment(state, prev)
			items[i].placed = null
			items[i].candidates = [] // rebuild on next visit — freed slot changes availability
			backtracks++

			yield step(
				'backtrack',
				`Backtrack #${backtracks}: undoing "${prev.subject}", trying next option.`,
				{
					currentFaculty: prev.facultyId,
					currentSubject: prev.subject,
					currentLecturer: prev.lecturerId,
					currentRoom: prev.roomId,
					currentSlot: prev.timeSlot,
				}
			)
		}
	}

	// ── 4. Done ──────────────────────────────────────────────────────────────

	const totalPlaced = items.filter(it => it.placed !== null).length
	const success = unresolvedConstraints.length === 0

	yield step(
		'complete',
		success
			? `Done! ${totalPlaced} classes placed with ${backtracks} backtracks.`
			: `Finished with ${unresolvedConstraints.length} unresolved. ${totalPlaced} classes placed.`
	)

	return {
		success,
		schedule: state as ScheduleState,
		totalSteps: stepNumber,
		backtracks,
		unresolvedConstraints,
	}
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/** Run to completion without collecting steps. Use when you don't need visualization. */
export function runSchedulingAlgorithm(
	input: ScheduleInput,
	options?: BacktrackingOptions
): ScheduleResult {
	const gen = generateSchedule(input, options)
	let next = gen.next()
	while (!next.done) next = gen.next()
	return next.value as ScheduleResult
}

/** Collect all steps and the final result. Used by the visualization store. */
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
