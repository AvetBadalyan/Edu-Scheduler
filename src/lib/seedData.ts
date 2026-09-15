/**
 * Demo seed data — Armenian Code Academy.
 *
 * Reflects ACA's real bootcamp catalog (bootcamps.aca.am).
 * Lecturers are real ACA team members with accurate specialties.
 * Images are only used for people where we have a real photo.
 */
import { emptyTimetable } from '@/lib/timetable'
import type {
	CreateFacultyInput,
	CreateLecturerInput,
	CreateRoomInput,
	Student,
	University,
} from '@/types'

import Anna from '@/assets/lecturers/Anna.jpg'
import Avet from '@/assets/lecturers/Avet.jpg'
import Elen from '@/assets/lecturers/Elen.jpg'
import Elmira from '@/assets/lecturers/Elmira-Avagyan.jpeg'
import Hovhannes from '@/assets/lecturers/hovhannesKocharyan.jpg'
import Norayr from '@/assets/lecturers/noro.jpg'
import Rafayel from '@/assets/lecturers/Raf.jpg'
import Sona from '@/assets/lecturers/sona.jpg'
import Vrezh from '@/assets/lecturers/Vrezh.jpg'

// ─── Demo University ──────────────────────────────────────────────────────────

export const DEMO_UNIVERSITY: University = {
	id: 'demo-university-aca',
	name: 'Armenian Code Academy',
	ownerId: 'demo-user',
	createdAt: new Date('2024-01-01'),
}

// ─── Lecturers ────────────────────────────────────────────────────────────────
// Real ACA tutors and team members with their actual specialties.

export const seedLecturers: CreateLecturerInput[] = [
	// ── Tutors ──────────────────────────────────────────────────────────────
	{
		name: 'Hovhannes',
		surname: 'Kocharyan',
		specialties: ['JavaScript', 'Web Fundamentals'],
		imageUrl: Hovhannes,
		availability: emptyTimetable(),
	},
	{
		name: 'Sona',
		surname: 'Shahgeldyan',
		specialties: ['NodeJS', 'Backend Development'],
		imageUrl: Sona,
		availability: emptyTimetable(),
	},
	{
		name: 'Elmira',
		surname: 'Avagyan',
		specialties: ['ReactJS', 'JavaScript'],
		imageUrl: Elmira,
		availability: emptyTimetable(),
	},
	{
		name: 'Vrezh',
		surname: 'Oganesyan',
		specialties: ['NodeJS', 'Backend Development'],
		imageUrl: Vrezh,
		availability: emptyTimetable(),
	},
	{
		name: 'Anna',
		surname: 'Minasyan',
		specialties: ['Python', 'Data Science'],
		imageUrl: Anna,
		availability: emptyTimetable(),
	},
	// ── Team ────────────────────────────────────────────────────────────────
	{
		name: 'Avet',
		surname: 'Badalyan',
		specialties: ['UI/UX Design', 'Product Design'],
		imageUrl: Avet,
		availability: emptyTimetable(),
	},
	{
		name: 'Elen',
		surname: 'Ghazaryan',
		specialties: ['JavaScript', 'ReactJS'],
		imageUrl: Elen,
		availability: emptyTimetable(),
	},
	{
		name: 'Rafayel',
		surname: 'Afrikyan',
		specialties: ['Web Fundamentals', 'HTML & CSS'],
		imageUrl: Rafayel,
		availability: emptyTimetable(),
	},
	{
		name: 'Norayr',
		surname: 'Hayrikyan',
		specialties: ['Project Management', 'Agile & Scrum'],
		imageUrl: Norayr,
		availability: emptyTimetable(),
	},
]

// ─── Rooms ────────────────────────────────────────────────────────────────────

const roomBlueprints: Array<{ number: string; capacity: number }> = [
	{ number: '101', capacity: 12 },
	{ number: '102', capacity: 12 },
	{ number: '201', capacity: 20 },
	{ number: '202', capacity: 20 },
	{ number: '301', capacity: 30 },
	{ number: '302', capacity: 30 },
]

export const seedRooms: CreateRoomInput[] = roomBlueprints.map(room => ({
	...room,
	availability: emptyTimetable(),
}))

// ─── Faculties ────────────────────────────────────────────────────────────────
// Based on ACA's real bootcamp catalog: bootcamps.aca.am

function makeStudents(count: number, prefix: string): Student[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `${prefix}-student-${i + 1}`,
		name: 'Student',
		surname: `${i + 1}`,
	}))
}

export const seedFaculties: CreateFacultyInput[] = [
	{
		name: 'Web Development Bootcamp',
		syllabus: [
			{ subject: 'Web Fundamentals', requiredHours: 3 },
			{ subject: 'HTML & CSS', requiredHours: 3 },
			{ subject: 'JavaScript', requiredHours: 5 },
			{ subject: 'ReactJS', requiredHours: 4 },
			{ subject: 'NodeJS', requiredHours: 3 },
		],
		students: makeStudents(22, 'wd'),
	},
	{
		name: 'Frontend Bootcamp',
		syllabus: [
			{ subject: 'Web Fundamentals', requiredHours: 2 },
			{ subject: 'HTML & CSS', requiredHours: 4 },
			{ subject: 'JavaScript', requiredHours: 5 },
			{ subject: 'ReactJS', requiredHours: 5 },
		],
		students: makeStudents(18, 'fe'),
	},
	{
		name: 'UI/UX Design Bootcamp',
		syllabus: [
			{ subject: 'UI/UX Design', requiredHours: 6 },
			{ subject: 'Product Design', requiredHours: 4 },
			{ subject: 'HTML & CSS', requiredHours: 2 },
			{ subject: 'Project Management', requiredHours: 2 },
		],
		students: makeStudents(20, 'ux'),
	},
	{
		name: 'Data Science Bootcamp',
		syllabus: [
			{ subject: 'Python', requiredHours: 5 },
			{ subject: 'Data Science', requiredHours: 6 },
			{ subject: 'Agile & Scrum', requiredHours: 2 },
			{ subject: 'Project Management', requiredHours: 2 },
		],
		students: makeStudents(16, 'ds'),
	},
]
