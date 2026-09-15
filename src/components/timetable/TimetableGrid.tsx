/**
 * TimetableGrid — 5-day × 4-hour schedule grid.
 *
 * Reads entity names from scheduleStore so cells show human-readable text
 * instead of raw IDs.
 */
import { ALL_DAYS, ALL_HOURS } from '@/lib/timetable'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
	selectScheduleFaculties,
	selectScheduleLecturers,
	selectScheduleRooms,
} from '@/store/scheduleSlice'
import type {
	ClassAssignment,
	DayOfWeek,
	HourSlot,
	TimeSlot,
	TimeSlotRef,
	Timetable,
} from '@/types'
import React from 'react'
import ReactDOM from 'react-dom'

export interface TimetableGridProps {
	timetable: Timetable
	viewMode: 'lecturer' | 'room' | 'faculty'
	entityId: string
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
	isEditable?: boolean
	className?: string
}

const DAYS = ALL_DAYS
const HOURS = ALL_HOURS

const DAY_NAMES: Record<DayOfWeek, string> = {
	1: 'Mon',
	2: 'Tue',
	3: 'Wed',
	4: 'Thu',
	5: 'Fri',
}
const DAY_FULL: Record<DayOfWeek, string> = {
	1: 'Monday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
}
const HOUR_LABELS: Record<HourSlot, string> = {
	1: '09:00',
	2: '11:00',
	3: '13:00',
	4: '15:00',
}

// Deterministic per-subject colour — hash keeps colours stable across renders
const PALETTE = [
	'bg-indigo-100 border-indigo-300 text-indigo-900',
	'bg-emerald-100 border-emerald-300 text-emerald-900',
	'bg-amber-100 border-amber-300 text-amber-900',
	'bg-rose-100 border-rose-300 text-rose-900',
	'bg-violet-100 border-violet-300 text-violet-900',
	'bg-cyan-100 border-cyan-300 text-cyan-900',
	'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900',
	'bg-teal-100 border-teal-300 text-teal-900',
	'bg-orange-100 border-orange-300 text-orange-900',
	'bg-sky-100 border-sky-300 text-sky-900',
]

function hashSubject(subject: string): number {
	let h = 0
	for (let i = 0; i < subject.length; i++) {
		h = (h * 31 + subject.charCodeAt(i)) >>> 0
	}
	return h % PALETTE.length
}

function subjectColor(subject: string) {
	return PALETTE[hashSubject(subject)]
}

// ─── Tooltip (portal-based to escape overflow:hidden parents) ────────────────

interface TooltipProps {
	assignment: ClassAssignment
	lecturerName: string
	roomLabel: string
	facultyName: string
	anchorRect: DOMRect
}

function AssignmentTooltip({
	assignment,
	lecturerName,
	roomLabel,
	facultyName,
	anchorRect,
}: TooltipProps) {
	// Position the tooltip above the cell, centred horizontally
	const left = anchorRect.left + anchorRect.width / 2
	const top = anchorRect.top + window.scrollY - 8 // 8px gap above cell

	return ReactDOM.createPortal(
		<div
			role="tooltip"
			style={{
				position: 'absolute',
				left,
				top,
				transform: 'translate(-50%, -100%)',
				zIndex: 9999,
			}}
			className="pointer-events-none w-56 animate-fade-in"
		>
			{/* Card */}
			<div className="rounded-xl bg-gray-900 px-3.5 py-3 shadow-2xl ring-1 ring-white/10">
				{/* Subject */}
				<p className="mb-2 text-sm font-bold text-white">{assignment.subject}</p>

				<div className="flex flex-col gap-1">
					<Row icon="👩‍🏫" label="Lecturer" value={lecturerName} />
					<Row icon="🚪" label="Room" value={roomLabel} />
					<Row icon="🎓" label="Group" value={facultyName} />
				</div>

				{assignment.isManual && (
					<div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-300">
						✎ Manually placed
					</div>
				)}
			</div>

			{/* Arrow pointing down */}
			<div
				className="mx-auto h-0 w-0"
				style={{
					borderLeft: '6px solid transparent',
					borderRight: '6px solid transparent',
					borderTop: '6px solid #111827', // gray-900
				}}
			/>
		</div>,
		document.body
	)
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
	return (
		<p className="flex items-baseline gap-1.5 text-xs">
			<span aria-hidden>{icon}</span>
			<span className="text-gray-500 shrink-0">{label}</span>
			<span className="text-gray-200 truncate">{value}</span>
		</p>
	)
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

interface CellProps {
	assignment: ClassAssignment | null
	isEditable: boolean
	slot: TimeSlot
	entityId: string
	entityType: 'lecturer' | 'room' | 'faculty'
	lecturerName: string
	roomLabel: string
	facultyName: string
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
}

function TimetableCell({
	assignment,
	isEditable,
	slot,
	entityId,
	entityType,
	lecturerName,
	roomLabel,
	facultyName,
	onSlotClick,
	onSlotDrop,
}: CellProps) {
	const [showTooltip, setShowTooltip] = React.useState(false)
	const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)
	const cellRef = React.useRef<HTMLDivElement>(null)

	const handleMouseEnter = () => {
		if (assignment && cellRef.current) {
			setAnchorRect(cellRef.current.getBoundingClientRect())
			setShowTooltip(true)
		}
	}
	const handleMouseLeave = () => setShowTooltip(false)
	const handleFocus = () => {
		if (assignment && cellRef.current) {
			setAnchorRect(cellRef.current.getBoundingClientRect())
			setShowTooltip(true)
		}
	}
	const handleBlur = () => setShowTooltip(false)

	const handleDragStart = (e: React.DragEvent) => {
		if (!isEditable || !assignment) return
		e.dataTransfer.setData('text/plain', JSON.stringify({ ...slot, entityType, entityId }))
		e.dataTransfer.effectAllowed = 'move'
	}

	const handleDragOver = (e: React.DragEvent) => {
		if (!isEditable) return
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	const handleDrop = (e: React.DragEvent) => {
		if (!isEditable || !onSlotDrop) return
		e.preventDefault()
		try {
			const from: TimeSlotRef = JSON.parse(e.dataTransfer.getData('text/plain'))
			const to: TimeSlotRef = { ...slot, entityType, entityId }
			if (from.day !== to.day || from.hour !== to.hour) onSlotDrop(from, to)
		} catch {
			// ignore
		}
	}

	const cellClass = cn(
		// Base
		'group relative flex flex-col justify-center border-b border-r p-1.5 text-xs transition-all duration-150 select-none min-h-[5.5rem]',
		// Empty
		assignment === null && 'bg-white hover:bg-slate-50',
		// Filled
		assignment !== null && subjectColor(assignment.subject),
		// Editable states
		isEditable && assignment !== null && 'cursor-grab active:cursor-grabbing',
		isEditable && assignment === null && 'cursor-pointer',
		// Manual marker
		assignment?.isManual && 'border-dashed'
	)

	return (
		<div
			ref={cellRef}
			className={cellClass}
			role={isEditable ? 'button' : 'cell'}
			tabIndex={isEditable ? 0 : undefined}
			aria-label={
				assignment
					? `${assignment.subject} — ${lecturerName} — ${DAY_FULL[slot.day as DayOfWeek]}`
					: `Empty — ${DAY_FULL[slot.day as DayOfWeek]}`
			}
			draggable={isEditable && assignment !== null}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={() => onSlotClick?.(slot, assignment)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			{assignment !== null ? (
				<>
					{/* Subject */}
					<span className="block truncate font-semibold leading-snug">{assignment.subject}</span>
					{/* Lecturer name (resolved, not raw ID) */}
					<span className="block truncate text-[11px] opacity-70 leading-snug mt-0.5">
						{lecturerName}
					</span>
					{/* Room */}
					<span className="block truncate text-[10px] opacity-50 leading-snug">{roomLabel}</span>
					{/* Manual badge */}
					{assignment.isManual && (
						<span className="absolute right-1 top-0.5 rounded bg-amber-400 px-1 py-px text-[9px] font-bold text-amber-900">
							M
						</span>
					)}
				</>
			) : (
				<span className="block text-center text-[11px] text-gray-400">—</span>
			)}

			{showTooltip && assignment !== null && anchorRect && (
				<AssignmentTooltip
					assignment={assignment}
					lecturerName={lecturerName}
					roomLabel={roomLabel}
					facultyName={facultyName}
					anchorRect={anchorRect}
				/>
			)}
		</div>
	)
}

// ─── TimetableGrid ────────────────────────────────────────────────────────────

export function TimetableGrid({
	timetable,
	viewMode,
	entityId,
	onSlotClick,
	onSlotDrop,
	isEditable = false,
	className,
}: TimetableGridProps) {
	// Pull entity name maps so cells can display names, not IDs
	const storeLecturers = useAppSelector(selectScheduleLecturers)
	const storeRooms = useAppSelector(selectScheduleRooms)
	const storeFaculties = useAppSelector(selectScheduleFaculties)

	function resolveLecturerName(id: string) {
		const l = storeLecturers[id]
		return l ? `${l.name} ${l.surname}` : id
	}
	function resolveRoomLabel(id: string) {
		const r = storeRooms[id]
		return r ? `Room ${r.number}` : id
	}
	function resolveFacultyName(id: string) {
		const f = storeFaculties[id]
		return f ? f.name : id
	}

	return (
		<div
			className={cn(
				'w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm',
				className
			)}
			role="grid"
			aria-label={`${viewMode} timetable`}
		>
			{/* Min-width so the grid doesn't collapse on small screens */}
			<div className="min-w-[600px]">
				{/* Header row */}
				<div className="grid border-b" style={{ gridTemplateColumns: '5rem repeat(5, 1fr)' }}>
					<div className="flex h-10 items-center justify-center border-r bg-gray-50 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
						Hour
					</div>
					{DAYS.map(day => (
						<div
							key={day}
							className="flex h-10 items-center justify-center border-r bg-gray-50 text-xs font-semibold text-gray-600"
							role="columnheader"
							aria-label={DAY_FULL[day]}
						>
							<span className="hidden sm:block">{DAY_FULL[day]}</span>
							<span className="sm:hidden">{DAY_NAMES[day]}</span>
						</div>
					))}
				</div>

				{/* Data rows */}
				{HOURS.map(hour => (
					<div
						key={hour}
						className="grid"
						style={{ gridTemplateColumns: '5rem repeat(5, 1fr)' }}
						role="row"
					>
						{/* Hour label */}
						<div className="flex min-h-[5.5rem] items-center justify-center border-b border-r bg-gray-50 text-[11px] font-medium text-gray-500">
							{HOUR_LABELS[hour]}
						</div>

						{DAYS.map(day => {
							const assignment = timetable[day][hour]
							return (
								<TimetableCell
									key={`${day}-${hour}`}
									assignment={assignment}
									isEditable={isEditable}
									slot={{ day, hour }}
									entityId={entityId}
									entityType={viewMode}
									lecturerName={assignment ? resolveLecturerName(assignment.lecturerId) : ''}
									roomLabel={assignment ? resolveRoomLabel(assignment.roomId) : ''}
									facultyName={assignment ? resolveFacultyName(assignment.facultyId) : ''}
									onSlotClick={onSlotClick}
									onSlotDrop={onSlotDrop}
								/>
							)
						})}
					</div>
				))}
			</div>
		</div>
	)
}

export default TimetableGrid
