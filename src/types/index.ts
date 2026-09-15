/**
 * Core domain type definitions for the Education Management System.
 * These types align with the design document's data models.
 */

// ─── Identifier types ──────────────────────────────────────────────────────────

export type LecturerId = string
export type RoomId = string
export type FacultyId = string
export type ScheduleId = string
export type UserId = string

// ─── Time types ───────────────────────────────────────────────────────────────

/** Monday = 1, Friday = 5 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5

/** Hour slots 1-4 within a day */
export type HourSlot = 1 | 2 | 3 | 4

export interface TimeSlot {
	day: DayOfWeek
	hour: HourSlot
}

export interface TimeSlotRef extends TimeSlot {
	entityType: 'room' | 'lecturer' | 'faculty'
	entityId: string
}

// ─── Timetable types ──────────────────────────────────────────────────────────

export type TimetableDay = Record<HourSlot, ClassAssignment | null>
export type Timetable = Record<DayOfWeek, TimetableDay>

// ─── Entity models ────────────────────────────────────────────────────────────

export interface Lecturer {
	id: LecturerId
	name: string
	surname: string
	/** Can teach multiple subjects */
	specialties: string[]
	imageUrl?: string
	/** null = available, blocked slots have ClassAssignment */
	availability: Timetable
	createdAt: Date
	updatedAt: Date
}

export interface LecturerWithTimetable extends Lecturer {
	timetable: Timetable
}

export interface Room {
	id: RoomId
	number: string
	capacity: number
	availability: Timetable
	createdAt: Date
	updatedAt: Date
}

export interface RoomWithTimetable extends Room {
	timetable: Timetable
}

export interface Student {
	id: string
	name: string
	surname: string
}

export interface SyllabusEntry {
	subject: string
	requiredHours: number
}

export interface Faculty {
	id: FacultyId
	name: string
	syllabus: SyllabusEntry[]
	students: Student[]
	createdAt: Date
	updatedAt: Date
}

export interface FacultyWithTimetable extends Faculty {
	timetable: Timetable
}

// ─── Schedule models ──────────────────────────────────────────────────────────

export interface ClassAssignment {
	facultyId: FacultyId
	lecturerId: LecturerId
	roomId: RoomId
	subject: string
	timeSlot: TimeSlot
	/** true if manually placed, false if auto-generated */
	isManual: boolean
}

export interface ScheduleState {
	rooms: Record<RoomId, RoomWithTimetable>
	lecturers: Record<LecturerId, LecturerWithTimetable>
	faculties: Record<FacultyId, FacultyWithTimetable>
}

export interface ScheduleStats {
	totalAssignments: number
	manualAssignments: number
	/** 0-100 */
	roomUtilization: number
	unresolvedConstraints: string[]
}

export interface ScheduleMetadata {
	id: ScheduleId
	name: string
	userId: UserId
	createdAt: Date
	updatedAt: Date
	isComplete: boolean
	stats: ScheduleStats
}

export interface Schedule extends ScheduleMetadata {
	state: ScheduleState
}

// ─── Algorithm models ─────────────────────────────────────────────────────────

export interface ScheduleInput {
	lecturers: Lecturer[]
	rooms: Room[]
	faculties: Faculty[]
}

export interface ConstraintCheck {
	constraint: string
	passed: boolean
	details: string
}

export interface AlgorithmStep {
	stepNumber: number
	type: 'evaluate' | 'assign' | 'conflict' | 'backtrack' | 'complete'
	description: string
	currentFaculty?: FacultyId
	currentSubject?: string
	currentLecturer?: LecturerId
	currentRoom?: RoomId
	currentSlot?: TimeSlot
	constraintChecks?: ConstraintCheck[]
	stateSnapshot?: Partial<ScheduleState>
}

export interface UnresolvedConstraint {
	type: string
	description: string
	affectedEntities: string[]
}

export interface ScheduleResult {
	success: boolean
	schedule: ScheduleState
	totalSteps: number
	backtracks: number
	unresolvedConstraints: UnresolvedConstraint[]
}

export interface BacktrackingOptions {
	maxBacktracks: number
	preferEvenDistribution: boolean
	minimizeRoomWaste: boolean
}

// ─── Validation models ────────────────────────────────────────────────────────

export interface ValidationError {
	code: string
	message: string
	field?: string
	context?: Record<string, unknown>
}

export interface ValidationResult {
	isValid: boolean
	errors: ValidationError[]
}

export interface ConstraintViolation {
	type:
		| 'lecturer_conflict'
		| 'room_conflict'
		| 'faculty_conflict'
		| 'capacity_exceeded'
		| 'specialty_mismatch'
	message: string
	conflictingAssignment?: ClassAssignment
}

export interface AssignmentValidation {
	isValid: boolean
	violations: ConstraintViolation[]
}

// ─── Edit history models ──────────────────────────────────────────────────────

export interface ScheduleEdit {
	id: string
	timestamp: Date
	type: 'assign' | 'unassign' | 'move'
	before: ClassAssignment | null
	after: ClassAssignment | null
}

export interface Conflict {
	type: 'double_booking' | 'capacity' | 'specialty_mismatch'
	slots: TimeSlotRef[]
	description: string
}

// ─── University models ────────────────────────────────────────────────────────

export type UniversityId = string

export interface University {
	id: UniversityId
	name: string
	/** Supabase user ID (or demo-user for seed data) */
	ownerId: string
	createdAt: Date
}

// ─── Authentication models ────────────────────────────────────────────────────

export interface User {
	id: UserId
	email: string
	name: string
	createdAt: Date
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface LoginResult {
	success: boolean
	// Note: 'account_locked' and 'session_expired' document intended future error states
	error?: 'invalid_credentials' | 'account_locked' | 'session_expired'
}

// ─── API models ───────────────────────────────────────────────────────────────

export interface ApiError {
	code: string
	message: string
	details?: Record<string, unknown>
}

// ─── UI / Visualization models ────────────────────────────────────────────────

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'complete'

export interface HighlightedElement {
	type: 'lecturer' | 'room' | 'faculty' | 'slot'
	id: string
	slot?: TimeSlot
	style: 'active' | 'conflict' | 'success'
}

export interface DecisionLogEntry {
	stepNumber: number
	description: string
	type: 'evaluate' | 'assign' | 'conflict' | 'backtrack' | 'complete'
}

export interface UtilizationStats {
	totalSlots: number
	usedSlots: number
	utilizationPercent: number
	byRoom: Record<RoomId, number>
	byLecturer: Record<LecturerId, number>
}

// ─── CRUD input types ─────────────────────────────────────────────────────────

export type CreateLecturerInput = Omit<Lecturer, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLecturerInput = Partial<CreateLecturerInput>

export type CreateRoomInput = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateRoomInput = Partial<CreateRoomInput>

export type CreateFacultyInput = Omit<Faculty, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateFacultyInput = Partial<CreateFacultyInput>

export interface CreateScheduleInput {
	name: string
	state: ScheduleState
}

export interface UpdateScheduleInput {
	name?: string
	state?: ScheduleState
}

export interface ScheduleSummary {
	id: ScheduleId
	name: string
	createdAt: Date
	updatedAt: Date
	isComplete: boolean
	stats: ScheduleStats
}
