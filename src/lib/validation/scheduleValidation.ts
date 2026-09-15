/**
 * Input validation for scheduling.
 *
 * Validates ScheduleInput before the scheduling algorithm runs.
 * Returns structured ValidationResult with specific error codes and messages.
 *
 * Requirements: 5.1, 5.2
 */
import type {
	Faculty,
	Lecturer,
	Room,
	ScheduleInput,
	ValidationError,
	ValidationResult,
} from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function error(code: string, message: string, field?: string): ValidationError {
	return { code, message, field }
}

// ─── Individual validators ────────────────────────────────────────────────────

function validateLecturer(l: Lecturer, index: number): ValidationError[] {
	const errors: ValidationError[] = []
	const field = `lecturers[${index}]`

	if (!l.name?.trim()) {
		errors.push(
			error('LECTURER_MISSING_NAME', `Lecturer at index ${index} has no name.`, `${field}.name`)
		)
	}
	if (!l.surname?.trim()) {
		errors.push(
			error(
				'LECTURER_MISSING_SURNAME',
				`Lecturer at index ${index} has no surname.`,
				`${field}.surname`
			)
		)
	}
	if (!l.specialties || l.specialties.length === 0) {
		errors.push(
			error(
				'LECTURER_NO_SPECIALTIES',
				`Lecturer "${l.name ?? index}" has no specialties.`,
				`${field}.specialties`
			)
		)
	}
	if (l.specialties?.some(s => !s?.trim())) {
		errors.push(
			error(
				'LECTURER_EMPTY_SPECIALTY',
				`Lecturer "${l.name ?? index}" has an empty specialty entry.`,
				`${field}.specialties`
			)
		)
	}

	return errors
}

function validateRoom(r: Room, index: number): ValidationError[] {
	const errors: ValidationError[] = []
	const field = `rooms[${index}]`

	if (!r.number?.trim()) {
		errors.push(
			error('ROOM_MISSING_NUMBER', `Room at index ${index} has no room number.`, `${field}.number`)
		)
	}
	if (!Number.isInteger(r.capacity) || r.capacity < 1 || r.capacity > 500) {
		errors.push(
			error(
				'ROOM_INVALID_CAPACITY',
				`Room "${r.number ?? index}" must have a capacity between 1 and 500.`,
				`${field}.capacity`
			)
		)
	}

	return errors
}

function validateFaculty(f: Faculty, index: number): ValidationError[] {
	const errors: ValidationError[] = []
	const field = `faculties[${index}]`

	if (!f.name?.trim()) {
		errors.push(
			error('FACULTY_MISSING_NAME', `Faculty at index ${index} has no name.`, `${field}.name`)
		)
	}
	if (!f.syllabus || f.syllabus.length === 0) {
		errors.push(
			error(
				'FACULTY_EMPTY_SYLLABUS',
				`Faculty "${f.name ?? index}" has no syllabus entries.`,
				`${field}.syllabus`
			)
		)
	}
	f.syllabus?.forEach((entry, ei) => {
		if (!entry.subject?.trim()) {
			errors.push(
				error(
					'SYLLABUS_MISSING_SUBJECT',
					`Faculty "${f.name ?? index}" syllabus entry ${ei} has no subject.`,
					`${field}.syllabus[${ei}].subject`
				)
			)
		}
		if (!Number.isInteger(entry.requiredHours) || entry.requiredHours < 1) {
			errors.push(
				error(
					'SYLLABUS_INVALID_HOURS',
					`Faculty "${f.name ?? index}" subject "${entry.subject}" must have at least 1 required hour.`,
					`${field}.syllabus[${ei}].requiredHours`
				)
			)
		}
	})
	if (!f.students || f.students.length === 0) {
		errors.push(
			error(
				'FACULTY_NO_STUDENTS',
				`Faculty "${f.name ?? index}" has no students.`,
				`${field}.students`
			)
		)
	}

	return errors
}

// ─── Cross-entity validators ──────────────────────────────────────────────────

function validateSpecialtyMatches(lecturers: Lecturer[], faculties: Faculty[]): ValidationError[] {
	const errors: ValidationError[] = []
	const allSubjects = new Set(faculties.flatMap(f => f.syllabus.map(s => s.subject)))

	// Each subject must have at least one lecturer who can teach it
	for (const subject of allSubjects) {
		const hasLecturer = lecturers.some(l => l.specialties.includes(subject))
		if (!hasLecturer) {
			errors.push(
				error(
					'NO_LECTURER_FOR_SUBJECT',
					`No lecturer is qualified to teach "${subject}". Schedule generation will be incomplete.`
				)
			)
		}
	}

	return errors
}

function validateRoomCapacity(rooms: Room[], faculties: Faculty[]): ValidationError[] {
	const errors: ValidationError[] = []
	const maxRoomCapacity = rooms.length > 0 ? Math.max(...rooms.map(r => r.capacity)) : 0

	for (const f of faculties) {
		const studentCount = f.students.length
		if (studentCount > maxRoomCapacity) {
			errors.push(
				error(
					'NO_ROOM_LARGE_ENOUGH',
					`Faculty "${f.name}" has ${studentCount} students but the largest room holds ${maxRoomCapacity}. No room can accommodate this faculty.`
				)
			)
		}
	}

	return errors
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Validates the full schedule input before algorithm execution.
 * Requirement 5.1: Validate all input data before attempting schedule generation.
 * Requirement 5.2: Return specific error messages identifying each issue.
 */
export function validateScheduleInput(input: ScheduleInput): ValidationResult {
	const errors: ValidationError[] = []

	// Check top-level presence
	if (!input.lecturers || input.lecturers.length === 0) {
		errors.push(error('NO_LECTURERS', 'At least one lecturer is required to generate a schedule.'))
	}
	if (!input.rooms || input.rooms.length === 0) {
		errors.push(error('NO_ROOMS', 'At least one room is required to generate a schedule.'))
	}
	if (!input.faculties || input.faculties.length === 0) {
		errors.push(error('NO_FACULTIES', 'At least one faculty is required to generate a schedule.'))
	}

	// Validate each entity
	input.lecturers?.forEach((l, i) => errors.push(...validateLecturer(l, i)))
	input.rooms?.forEach((r, i) => errors.push(...validateRoom(r, i)))
	input.faculties?.forEach((f, i) => errors.push(...validateFaculty(f, i)))

	// Cross-entity validation (only if individual validation passed)
	if (errors.length === 0) {
		errors.push(...validateSpecialtyMatches(input.lecturers, input.faculties))
		errors.push(...validateRoomCapacity(input.rooms, input.faculties))
	}

	return { isValid: errors.length === 0, errors }
}
