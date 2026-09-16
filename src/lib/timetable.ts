/**
 * Timetable helpers shared across stores, forms and seed data.
 *
 * A timetable is a 5 (Mon–Fri) × 4 (hour slots) grid. An empty grid has every
 * slot set to `null`.
 */
import type { DayOfWeek, HourSlot, TimeSlot, Timetable } from '@/types'

export const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5]
export const ALL_HOURS: HourSlot[] = [1, 2, 3, 4]

/** Short day labels for compact/mobile views. */
export const DAY_NAMES: Record<DayOfWeek, string> = {
	1: 'Mon',
	2: 'Tue',
	3: 'Wed',
	4: 'Thu',
	5: 'Fri',
}

/** Full day labels for wide views and aria labels. */
export const DAY_FULL: Record<DayOfWeek, string> = {
	1: 'Monday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
}

/** Start time shown for each hour slot. */
export const HOUR_LABELS: Record<HourSlot, string> = {
	1: '09:00',
	2: '11:00',
	3: '13:00',
	4: '15:00',
}

/** Grid column template used by the timetable grid (time column + 5 days). */
export const TIMETABLE_GRID_COLS =
	'grid [grid-template-columns:4rem_repeat(5,minmax(0,1fr))] md:[grid-template-columns:5rem_repeat(5,minmax(0,1fr))]'

/** Creates a fresh timetable with every slot empty. */
export function emptyTimetable(): Timetable {
	return {
		1: { 1: null, 2: null, 3: null, 4: null },
		2: { 1: null, 2: null, 3: null, 4: null },
		3: { 1: null, 2: null, 3: null, 4: null },
		4: { 1: null, 2: null, 3: null, 4: null },
		5: { 1: null, 2: null, 3: null, 4: null },
	}
}

/** Every (day, hour) pair in a week — useful for iteration and stats. */
export function allTimeSlots(): TimeSlot[] {
	const slots: TimeSlot[] = []
	for (const day of ALL_DAYS) {
		for (const hour of ALL_HOURS) {
			slots.push({ day, hour })
		}
	}
	return slots
}

/** Count non-null slots across a collection of timetables. */
export function countTimetableSlots(
	timetables: Record<string, { timetable: Record<DayOfWeek, Record<HourSlot, unknown | null>> }>
): number {
	let n = 0
	for (const entity of Object.values(timetables))
		for (const day of ALL_DAYS)
			for (const hour of ALL_HOURS) if (entity.timetable[day][hour] !== null) n++
	return n
}
