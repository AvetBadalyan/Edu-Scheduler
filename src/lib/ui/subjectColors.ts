/**
 * Single source of truth for per-subject / per-specialty colours.
 *
 * Two visual styles are derived from the same subject set:
 *   - `techColor(subject)`   → structured badge palette used by LecturerList
 *                              (soft background + text + glow + dot).
 *   - `subjectPill(subject)` → bordered pill class string used by FacultyList.
 *   - `accentGradient(subject)` → hero gradient for a lecturer's primary specialty.
 *
 * Adding a subject here updates every list consistently.
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
		glow: 'shadow-yellow-400/30',
		dot: 'bg-yellow-400',
	},
	TypeScript: {
		bg: 'bg-blue-500/15',
		text: 'text-blue-700',
		glow: 'shadow-blue-500/30',
		dot: 'bg-blue-500',
	},
	ReactJS: {
		bg: 'bg-cyan-400/15',
		text: 'text-cyan-700',
		glow: 'shadow-cyan-400/30',
		dot: 'bg-cyan-400',
	},
	NodeJS: {
		bg: 'bg-green-500/15',
		text: 'text-green-700',
		glow: 'shadow-green-500/30',
		dot: 'bg-green-500',
	},
	Java: {
		bg: 'bg-orange-500/15',
		text: 'text-orange-700',
		glow: 'shadow-orange-500/30',
		dot: 'bg-orange-500',
	},
	Python: {
		bg: 'bg-sky-500/15',
		text: 'text-sky-700',
		glow: 'shadow-sky-500/30',
		dot: 'bg-sky-500',
	},
	CSS: {
		bg: 'bg-violet-500/15',
		text: 'text-violet-700',
		glow: 'shadow-violet-500/30',
		dot: 'bg-violet-500',
	},
	HTML: {
		bg: 'bg-rose-500/15',
		text: 'text-rose-700',
		glow: 'shadow-rose-500/30',
		dot: 'bg-rose-500',
	},
	'UI/UX': {
		bg: 'bg-fuchsia-500/15',
		text: 'text-fuchsia-700',
		glow: 'shadow-fuchsia-500/30',
		dot: 'bg-fuchsia-500',
	},
	'Project Management': {
		bg: 'bg-teal-500/15',
		text: 'text-teal-700',
		glow: 'shadow-teal-500/30',
		dot: 'bg-teal-500',
	},
}

export const DEFAULT_TECH: TechColor = {
	bg: 'bg-slate-400/15',
	text: 'text-slate-700',
	glow: 'shadow-slate-400/30',
	dot: 'bg-slate-400',
}

/** Primary-specialty → card accent gradient (used by LecturerCard). */
export const ACCENT_GRADIENTS: Record<string, string> = {
	JavaScript: 'from-yellow-400 to-amber-500',
	TypeScript: 'from-blue-500 to-indigo-600',
	ReactJS: 'from-cyan-400 to-blue-500',
	NodeJS: 'from-green-500 to-emerald-600',
	Java: 'from-orange-500 to-red-600',
	Python: 'from-sky-400 to-blue-600',
	CSS: 'from-violet-500 to-purple-600',
	HTML: 'from-rose-500 to-orange-600',
	'UI/UX': 'from-fuchsia-500 to-pink-600',
	'Project Management': 'from-teal-500 to-cyan-600',
}

export const DEFAULT_GRADIENT = 'from-slate-500 to-slate-600'

/** Bordered pill class string per subject (used by FacultyCard). */
const SUBJECT_PILLS: Record<string, string> = {
	JavaScript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	TypeScript: 'bg-blue-100 text-blue-800 border-blue-200',
	ReactJS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
	NodeJS: 'bg-green-100 text-green-800 border-green-200',
	Java: 'bg-orange-100 text-orange-800 border-orange-200',
	Python: 'bg-sky-100 text-sky-800 border-sky-200',
	CSS: 'bg-violet-100 text-violet-800 border-violet-200',
	HTML: 'bg-rose-100 text-rose-800 border-rose-200',
	'UI/UX': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
	'Project Management': 'bg-teal-100 text-teal-800 border-teal-200',
}
const DEFAULT_PILL = 'bg-slate-100 text-slate-700 border-slate-200'

/** Structured badge palette for a subject (LecturerList badges/chips). */
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
