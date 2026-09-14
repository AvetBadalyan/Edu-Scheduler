/**
 * Demo seed data.
 *
 * Provides a realistic starting dataset so the app is immediately usable
 * without a backend. Loaded into the entity store on first boot
 * (see `useSeedData`). IDs are stable strings so they can be referenced from
 * generated schedules.
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
import Eduard from '@/assets/lecturers/image.jpg'
import Gago from '@/assets/lecturers/image1.jpg'
import Edgar from '@/assets/lecturers/image3.jpg'
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

export const seedLecturers: CreateLecturerInput[] = [
	{
		name: 'Gago',
		surname: 'Gagyan',
		specialties: ['Java'],
		imageUrl: Gago,
		availability: emptyTimetable(),
	},
	{
		name: 'Avet',
		surname: 'Badalyan',
		specialties: ['UI/UX'],
		imageUrl: Avet,
		availability: emptyTimetable(),
	},
	{
		name: 'Eduard',
		surname: 'Harutyunyan',
		specialties: ['ReactJS', 'JavaScript'],
		imageUrl: Eduard,
		availability: emptyTimetable(),
	},
	{
		name: 'Norayr',
		surname: 'Hayrikyan',
		specialties: ['Project Management'],
		imageUrl: Norayr,
		availability: emptyTimetable(),
	},
	{
		name: 'Elen',
		surname: 'Ghazaryan',
		specialties: ['JavaScript'],
		imageUrl: Elen,
		availability: emptyTimetable(),
	},
	{
		name: 'Edgar',
		surname: 'Khudoyan',
		specialties: ['NodeJS'],
		imageUrl: Edgar,
		availability: emptyTimetable(),
	},
	{
		name: 'Rafayel',
		surname: 'Afrikyan',
		specialties: ['CSS', 'HTML'],
		imageUrl: Rafayel,
		availability: emptyTimetable(),
	},
	{
		name: 'Hovhannes',
		surname: 'Kocharyan',
		specialties: ['ReactJS'],
		imageUrl: Hovhannes,
		availability: emptyTimetable(),
	},
	{
		name: 'Sona',
		surname: 'Shahgeldyan',
		specialties: ['NodeJS'],
		imageUrl: Sona,
		availability: emptyTimetable(),
	},
	{
		name: 'Elmira',
		surname: 'Avagyan',
		specialties: ['JavaScript'],
		imageUrl: Elmira,
		availability: emptyTimetable(),
	},
	{
		name: 'Vrezh',
		surname: 'Oganesyan',
		specialties: ['HTML'],
		imageUrl: Vrezh,
		availability: emptyTimetable(),
	},
	{
		name: 'Anna',
		surname: 'Minasyan',
		specialties: ['Python'],
		imageUrl: Anna,
		availability: emptyTimetable(),
	},
]

// ─── Rooms ────────────────────────────────────────────────────────────────────

const roomBlueprints: Array<{ number: string; capacity: number }> = [
	{ number: '101', capacity: 10 },
	{ number: '102', capacity: 10 },
	{ number: '201', capacity: 20 },
	{ number: '202', capacity: 20 },
	{ number: '301', capacity: 30 },
	{ number: '302', capacity: 30 },
	{ number: '401', capacity: 40 },
	{ number: '501', capacity: 50 },
]

export const seedRooms: CreateRoomInput[] = roomBlueprints.map(room => ({
	...room,
	availability: emptyTimetable(),
}))

// ─── Faculties ────────────────────────────────────────────────────────────────

function makeStudents(count: number, prefix: string): Student[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `${prefix}-student-${i + 1}`,
		name: `Student`,
		surname: `${i + 1}`,
	}))
}

export const seedFaculties: CreateFacultyInput[] = [
	{
		name: 'Frontend Bootcamp',
		syllabus: [
			{ subject: 'JavaScript', requiredHours: 5 },
			{ subject: 'HTML', requiredHours: 3 },
			{ subject: 'CSS', requiredHours: 3 },
			{ subject: 'ReactJS', requiredHours: 2 },
		],
		students: makeStudents(20, 'fe'),
	},
	{
		name: 'Backend Bootcamp',
		syllabus: [
			{ subject: 'Java', requiredHours: 5 },
			{ subject: 'NodeJS', requiredHours: 5 },
			{ subject: 'Python', requiredHours: 3 },
			{ subject: 'Project Management', requiredHours: 2 },
		],
		students: makeStudents(17, 'be'),
	},
	{
		name: 'UI/UX Bootcamp',
		syllabus: [
			{ subject: 'UI/UX', requiredHours: 5 },
			{ subject: 'HTML', requiredHours: 5 },
			{ subject: 'CSS', requiredHours: 5 },
			{ subject: 'Project Management', requiredHours: 2 },
		],
		students: makeStudents(29, 'ux'),
	},
	{
		name: 'Machine Learning',
		syllabus: [
			{ subject: 'Python', requiredHours: 5 },
			{ subject: 'Java', requiredHours: 3 },
			{ subject: 'Project Management', requiredHours: 2 },
		],
		students: makeStudents(24, 'ml'),
	},
]
