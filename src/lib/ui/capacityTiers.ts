/**
 * Single source of truth for room capacity tiers.
 *
 * The thresholds (20 / 40 / 100) and labels live here so RoomList (grouping +
 * card styling) and RoomForm (capacity hint) never drift apart.
 */

/** Allowed room-capacity range, shared by the form input and the validator. */
export const MIN_ROOM_CAPACITY = 1
export const MAX_ROOM_CAPACITY = 500

export interface CapacityTier {
	label: string
	min: number
	max: number
	icon: string
	/** Card gradient (RoomList). */
	gradient: string
	/** Focus ring accent (RoomList). */
	ring: string
	/** Hover glow shadow (RoomList). */
	glow: string
	/** Compact text/bg hint used by the RoomForm capacity badge. */
	hint: string
}

export const CAPACITY_TIERS: CapacityTier[] = [
	{
		label: 'Small',
		min: 1,
		max: 20,
		icon: '🪑',
		gradient: 'from-sky-500 to-blue-600',
		ring: 'ring-sky-400/40',
		glow: 'hover:shadow-sky-400/25',
		hint: 'text-sky-700 bg-sky-50',
	},
	{
		label: 'Medium',
		min: 21,
		max: 40,
		icon: '🏫',
		gradient: 'from-violet-500 to-purple-600',
		ring: 'ring-violet-400/40',
		glow: 'hover:shadow-violet-400/25',
		hint: 'text-violet-700 bg-violet-50',
	},
	{
		label: 'Large',
		min: 41,
		max: 100,
		icon: '🎓',
		gradient: 'from-emerald-500 to-teal-600',
		ring: 'ring-emerald-400/40',
		glow: 'hover:shadow-emerald-400/25',
		hint: 'text-emerald-700 bg-emerald-50',
	},
	{
		label: 'Auditorium',
		min: 101,
		max: Infinity,
		icon: '🏟️',
		gradient: 'from-amber-500 to-orange-600',
		ring: 'ring-amber-400/40',
		glow: 'hover:shadow-amber-400/25',
		hint: 'text-amber-700 bg-amber-50',
	},
]

/** Find the tier a given capacity falls into (defaults to the smallest). */
export function getTier(capacity: number): CapacityTier {
	return CAPACITY_TIERS.find(t => capacity >= t.min && capacity <= t.max) ?? CAPACITY_TIERS[0]
}

/** Compact hint (label + colour) for the RoomForm capacity badge. */
export function capacityHint(capacity: number): { label: string; color: string } {
	const tier = getTier(capacity)
	// RoomForm historically appended " room" to Small/Medium/Large; keep that wording.
	const label = tier.label === 'Auditorium' ? 'Auditorium' : `${tier.label} room`
	return { label, color: tier.hint }
}
