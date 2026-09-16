/**
 * RoomList — visual room management with capacity rings and utilisation bars.
 *
 * Rooms are grouped by size tier. Each card shows a bold room number,
 * a circular capacity indicator, an animated utilisation bar and
 * a colour-coded status pill. Hover lifts the card with a coloured glow.
 */
import { CardActions } from '@/components/ui/CardActions'
import { ALL_DAYS, ALL_HOURS, allTimeSlots } from '@/lib/timetable'
import { CAPACITY_TIERS, getTier, type CapacityTier } from '@/lib/ui/capacityTiers'
import { cn } from '@/lib/utils'
import { selectAllRooms } from '@/store/entitySlice'
import { useAppSelector } from '@/store/hooks'
import { selectScheduleRooms } from '@/store/scheduleSlice'
import type { Room, RoomId } from '@/types'
import { Users } from 'lucide-react'
import { useMemo } from 'react'

// ─── Utilisation helpers ──────────────────────────────────────────────────────

const TOTAL_SLOTS = allTimeSlots().length // 20 — computed once, not hardcoded

function calcUtil(
	room: Room,
	scheduleRooms: Record<string, { timetable: Record<number, Record<number, unknown>> }>
): number {
	const t = scheduleRooms[room.id]?.timetable
	if (!t) return 0
	let used = 0
	for (const day of ALL_DAYS) for (const hour of ALL_HOURS) if (t[day][hour] !== null) used++
	return Math.round((used / TOTAL_SLOTS) * 100)
}

function utilColor(pct: number) {
	if (pct >= 75) return { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
	if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
	return {
		bar: 'bg-emerald-500',
		text: 'text-emerald-700',
		bg: 'bg-emerald-50',
	}
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoomListProps {
	onEdit?: (r: Room) => void
	onDelete?: (id: RoomId) => void
	className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoomList({ onEdit, onDelete, className }: RoomListProps) {
	const rooms = useAppSelector(selectAllRooms)
	const scheduleRooms = useAppSelector(selectScheduleRooms)

	const grouped = useMemo(() => {
		const map = new Map<string, { tier: CapacityTier; rooms: Room[] }>()
		CAPACITY_TIERS.forEach(t => map.set(t.label, { tier: t, rooms: [] }))
		rooms.forEach(r => {
			const t = getTier(r.capacity)
			map.get(t.label)!.rooms.push(r)
		})
		return [...map.values()].filter(g => g.rooms.length > 0)
	}, [rooms])

	const overall = useMemo(() => {
		if (!rooms.length) return 0
		return Math.round(rooms.reduce((s, r) => s + calcUtil(r, scheduleRooms), 0) / rooms.length)
	}, [rooms, scheduleRooms])

	if (rooms.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
					🚪
				</div>
				<p className="text-base font-semibold text-gray-800">No rooms yet</p>
				<p className="text-sm text-gray-500">Click "Add Room" to register your first classroom.</p>
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col gap-8', className)}>
			{/* ── Overall utilisation banner ─────────────────────────────────── */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white shadow-lg">
				<div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/5" />
				<div className="pointer-events-none absolute -bottom-6 right-16 size-20 rounded-full bg-white/5" />
				<div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
							Overall Room Utilisation
						</p>
						<p className="mt-1 text-3xl font-black tabular-nums sm:text-4xl">{overall}%</p>
					</div>
					<div className="flex items-center gap-4 text-sm text-slate-300">
						<span>
							<span className="font-bold text-white">{rooms.length}</span> rooms
						</span>
						<span>
							<span className="font-bold text-white">
								{rooms.reduce((s, r) => s + r.capacity, 0)}
							</span>{' '}
							total seats
						</span>
					</div>
				</div>
				<div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
					<div
						className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-700"
						style={{ width: `${overall}%` }}
					/>
				</div>
			</div>

			{/* ── Tier groups ────────────────────────────────────────────────── */}
			{grouped.map(({ tier, rooms: tierRooms }, gi) => (
				<section key={tier.label}>
					{/* Tier header */}
					<div className="mb-4 flex items-center gap-3">
						<span
							className={cn(
								'flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-md',
								tier.gradient
							)}
							aria-hidden
						>
							{tier.icon}
						</span>
						<div>
							<h2 className="text-base font-bold text-gray-900">{tier.label} Rooms</h2>
							<p className="text-xs text-gray-500">
								{tier.min}–{tier.max === Infinity ? '∞' : tier.max} seats · {tierRooms.length} room
								{tierRooms.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{tierRooms.map((room, i) => (
							<RoomCard
								key={room.id}
								room={room}
								tier={tier}
								utilisation={calcUtil(room, scheduleRooms)}
								index={gi * 10 + i}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	)
}

// ─── RoomCard ─────────────────────────────────────────────────────────────────

interface RoomCardProps {
	room: Room
	tier: CapacityTier
	utilisation: number
	index: number
	onEdit?: (r: Room) => void
	onDelete?: (id: RoomId) => void
}

function RoomCard({ room, tier, utilisation, index, onEdit, onDelete }: RoomCardProps) {
	const uc = utilColor(utilisation)
	const delay = `${(index % 6) * 60}ms`

	return (
		<article
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-2xl bg-white',
				'border border-gray-100 shadow-md transition-all duration-300',
				'hover:-translate-y-1.5 hover:shadow-xl',
				tier.glow,
				'animate-fade-up'
			)}
			style={{ animationDelay: delay }}
		>
			{/* Gradient top strip */}
			<div className={cn('relative h-24 bg-gradient-to-br', tier.gradient)}>
				{/* Decorative circles */}
				<div className="absolute -left-4 -top-4 size-20 rounded-full bg-white/10" />
				<div className="absolute -right-2 -bottom-2 size-12 rounded-full bg-white/10" />

				{/* Room number — the hero element */}
				<div className="absolute inset-0 flex items-center justify-center">
					<p className="text-3xl font-black text-white drop-shadow-md tracking-tight">
						{room.number}
					</p>
				</div>

				{/* Utilisation pill */}
				<div
					className={cn(
						'absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-xs font-bold',
						uc.bg,
						uc.text
					)}
				>
					{utilisation}% used
				</div>
			</div>

			{/* Body */}
			<div className="flex flex-col gap-3 p-4">
				{/* Capacity row */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
						<Users className="size-4 text-gray-400" aria-hidden />
						<span className="text-lg font-black text-gray-900">{room.capacity}</span>
						<span className="text-xs text-gray-500">seats</span>
					</div>
					<span
						className={cn(
							'rounded-full px-2.5 py-1 text-xs font-bold',
							'bg-gradient-to-r',
							tier.gradient,
							'text-white shadow-sm'
						)}
					>
						{tier.label}
					</span>
				</div>

				{/* Utilisation bar */}
				<div>
					<div className="mb-1 flex justify-between text-xs text-gray-400">
						<span>Utilisation</span>
						<span className={cn('font-semibold', uc.text)}>{utilisation}%</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
						<div
							className={cn('h-1.5 rounded-full transition-all duration-700', uc.bar)}
							style={{ width: `${utilisation}%` }}
						/>
					</div>
				</div>

				{/* Actions */}
				<CardActions
					label={`room ${room.number}`}
					onEdit={onEdit ? () => onEdit(room) : undefined}
					onDelete={onDelete ? () => onDelete(room.id) : undefined}
				/>
			</div>
		</article>
	)
}
