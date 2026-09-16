/**
 * All app route paths in one place, so routing, nav links, and redirects
 * can't drift or get a typo. Import ROUTES instead of writing path strings.
 */
export const ROUTES = {
	landing: '/',
	login: '/login',
	dashboard: '/dashboard',
	lecturers: '/lecturers',
	rooms: '/rooms',
	faculties: '/faculties',
	schedule: '/schedule',
} as const
