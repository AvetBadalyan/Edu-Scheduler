/**
 * Shared Tailwind class strings for form layouts.
 *
 * Keeps the three entity forms (Faculty / Lecturer / Room) visually identical
 * without repeating the same class strings in each file.
 */

/** Vertical field wrapper: label + control + error stacked with a small gap. */
export const FIELD = 'flex flex-col gap-1.5'

/** Inline validation error message (icon + text, red). */
export const ERROR = 'flex items-center gap-1 text-xs text-red-600'

/** Grouped section card (used for the Faculty syllabus/students blocks). */
export const SECTION = 'rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-3'

/** Section heading inside a SECTION card. */
export const SECTION_TITLE = 'flex items-center gap-2 text-sm font-bold text-gray-800'
