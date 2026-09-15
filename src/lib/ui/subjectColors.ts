/**
 * Single source of truth for per-subject / per-specialty colours.
 *
 * The keys match the subject/specialty names used in the app (see seedData.ts),
 * so every subject renders with its own colour instead of the grey fallback.
 *
 * Three visual styles are derived from the same subject set:
 *   - `techColor(subject)`      → badge palette used by LecturerList (bg + text + glow + dot).
 *   - `accentGradient(subject)` → hero gradient for a lecturer's primary specialty.
 *   - `subjectPill(subject)`    → bordered pill class string used by FacultyList.
 */

export interface TechColor {
	bg: string
	text: string
	glow: string
	dot: string
}

export const TECH_COLORS: Record<string, TechColor> = {
	JavaScript: {
		bg: 'bg-yellow-400/15',
		text: 'text-yellow-700',
		glow: 'hover:shadow-yellow-400/30',
		dot: 'bg-yellow-400',
	},
	ReactJS: {
		bg: 'bg-cyan-400/15',
		text: 'text-cyan-700',
		glow: 'hover:shadow-cyan-400/30',
		dot: 'bg-cyan-400',
	},
	NodeJS: {
		bg: 'bg-green-500/15',
		text: 'text-green-700',
		glow: 'hover:shadow-green-500/30',
		dot: 'bg-green-500',
	},
	'Backend Development': {
		bg: 'bg-emerald-500/15',
		text: 'text-emerald-700',
		glow: 'hover:shadow-emerald-500/30',
		dot: 'bg-emerald-500',
	},
	'Web Fundamentals': {
		bg: 'bg-orange-500/15',
		text: 'text-orange-700',
		glow: 'hover:shadow-orange-500/30',
		dot: 'bg-orange-500',
	},
	'HTML & CSS': {
		bg: 'bg-rose-500/15',
		text: 'text-rose-700',
		glow: 'hover:shadow-rose-500/30',
		dot: 'bg-rose-500',
	},
	Python: {
		bg: 'bg-sky-500/15',
		text: 'text-sky-700',
		glow: 'hover:shadow-sky-500/30',
		dot: 'bg-sky-500',
	},
	'Data Science': {
		bg: 'bg-blue-500/15',
		text: 'text-blue-700',
		glow: 'hover:shadow-blue-500/30',
		dot: 'bg-blue-500',
	},
	'UI/UX Design': {
		bg: 'bg-fuchsia-500/15',
		text: 'text-fuchsia-700',
		glow: 'hover:shadow-fuchsia-500/30',
		dot: 'bg-fuchsia-500',
	},
	'Product Design': {
		bg: 'bg-pink-500/15',
		text: 'text-pink-700',
		glow: 'hover:shadow-pink-500/30',
		dot: 'bg-pink-500',
	},
	'Project Management': {
		bg: 'bg-teal-500/15',
		text: 'text-teal-700',
		glow: 'hover:shadow-teal-500/30',
		dot: 'bg-teal-500',
	},
	'Agile & Scrum': {
		bg: 'bg-violet-500/15',
		text: 'text-violet-700',
		glow: 'hover:shadow-violet-500/30',
		dot: 'bg-violet-500',
	},
}

export const DEFAULT_TECH: TechColor = {
	bg: 'bg-slate-400/15',
	text: 'text-slate-700',
	glow: 'hover:shadow-slate-400/30',
	dot: 'bg-slate-400',
}

/** Primary-specialty → card accent gradient (used by LecturerCard). */
export const ACCENT_GRADIENTS: Record<string, string> = {
	JavaScript: 'from-yellow-400 to-amber-500',
	ReactJS: 'from-cyan-400 to-blue-500',
	NodeJS: 'from-green-500 to-emerald-600',
	'Backend Development': 'from-emerald-500 to-teal-600',
	'Web Fundamentals': 'from-orange-500 to-red-600',
	'HTML & CSS': 'from-rose-500 to-orange-600',
	Python: 'from-sky-400 to-blue-600',
	'Data Science': 'from-blue-500 to-indigo-600',
	'UI/UX Design': 'from-fuchsia-500 to-pink-600',
	'Product Design': 'from-pink-500 to-rose-600',
	'Project Management': 'from-teal-500 to-cyan-600',
	'Agile & Scrum': 'from-violet-500 to-purple-600',
}

export const DEFAULT_GRADIENT = 'from-slate-500 to-slate-600'

/** Bordered pill class string per subject (used by FacultyCard). */
const SUBJECT_PILLS: Record<string, string> = {
	JavaScript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	ReactJS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
	NodeJS: 'bg-green-100 text-green-800 border-green-200',
	'Backend Development': 'bg-emerald-100 text-emerald-800 border-emerald-200',
	'Web Fundamentals': 'bg-orange-100 text-orange-800 border-orange-200',
	'HTML & CSS': 'bg-rose-100 text-rose-800 border-rose-200',
	Python: 'bg-sky-100 text-sky-800 border-sky-200',
	'Data Science': 'bg-blue-100 text-blue-800 border-blue-200',
	'UI/UX Design': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
	'Product Design': 'bg-pink-100 text-pink-800 border-pink-200',
	'Project Management': 'bg-teal-100 text-teal-800 border-teal-200',
	'Agile & Scrum': 'bg-violet-100 text-violet-800 border-violet-200',
}
const DEFAULT_PILL = 'bg-slate-100 text-slate-700 border-slate-200'

/** Badge palette for a subject (LecturerList badges/chips). */
export function techColor(subject: string): TechColor {
	return TECH_COLORS[subject] ?? DEFAULT_TECH
}

/** Card accent gradient for a subject (LecturerCard hero). */
export function accentGradient(subject: string): string {
	return ACCENT_GRADIENTS[subject] ?? DEFAULT_GRADIENT
}

/** Bordered pill class string for a subject (FacultyCard tags). */
export function subjectPill(subject: string): string {
	return SUBJECT_PILLS[subject] ?? DEFAULT_PILL
}
