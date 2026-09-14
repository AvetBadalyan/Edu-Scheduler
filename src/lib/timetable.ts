/**
 * Timetable helpers shared across stores, forms and seed data.
 *
 * A timetable is a 5 (Mon–Fri) × 4 (hour slots) grid. An empty grid has every
 * slot set to `null`.
 */
import type { DayOfWeek, HourSlot, Timetable, TimeSlot } from '@/types'

export const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5]
export const ALL_HOURS: HourSlot[] = [1, 2, 3, 4]

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
