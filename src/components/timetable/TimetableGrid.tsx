/**
 * TimetableGrid — 5-day × 4-hour schedule grid.
 *
 * Reads entity names from scheduleStore so cells show human-readable text
 * instead of raw IDs.
 */
import {
	ALL_DAYS,
	ALL_HOURS,
	DAY_FULL,
	DAY_NAMES,
	HOUR_LABELS,
	TIMETABLE_GRID_COLS,
} from '@/lib/timetable'
import { subjectPill } from '@/lib/ui/subjectColors'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
	isSlotAvailableFor,
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
					<div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300">
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
	draggedAssignment: ClassAssignment | null
	setDraggedAssignment: (assignment: ClassAssignment | null) => void
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
	draggedAssignment,
	setDraggedAssignment,
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

	// Is THIS slot a valid drop target for the class being dragged? Checks the
	// dragged class against all three timetables (room, lecturer, faculty) — not
	// just the one on screen — so a slot that looks empty here but whose room is
	// booked elsewhere correctly shows as taken.
	const canAcceptDrag = useAppSelector(state =>
		draggedAssignment ? isSlotAvailableFor(state, draggedAssignment, slot.day, slot.hour) : false
	)

	const handleDragStart = (e: React.DragEvent) => {
		if (!isEditable || !assignment) return
		e.dataTransfer.setData('text/plain', JSON.stringify({ ...slot, entityType, entityId }))
		e.dataTransfer.effectAllowed = 'move'
		setDraggedAssignment(assignment)
	}

	const handleDragEnd = () => setDraggedAssignment(null)

	const handleDragOver = (e: React.DragEvent) => {
		if (!isEditable) return
		e.preventDefault()
		// Only real, conflict-free slots accept the drop.
		e.dataTransfer.dropEffect = canAcceptDrag ? 'move' : 'none'
	}

	const handleDrop = (e: React.DragEvent) => {
		setDraggedAssignment(null)
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

	// While a drag is in progress, hint which slots are truly free vs taken.
	// Skip the source cell (the class's own slot) — no need to flag it.
	const isDragging = draggedAssignment !== null
	const isSource =
		isDragging &&
		draggedAssignment.timeSlot.day === slot.day &&
		draggedAssignment.timeSlot.hour === slot.hour
	const showDropHints = isEditable && isDragging && !isSource
	const isFreeTarget = showDropHints && canAcceptDrag
	const isTakenTarget = showDropHints && !canAcceptDrag

	const cellClass = cn(
		// Base — content wraps naturally, no overflow clipping needed
		'group relative flex flex-col justify-center border-b border-r text-xs transition-all duration-150 select-none',
		'min-h-[4.5rem] p-1 md:min-h-[5.5rem] md:p-1.5',
		// Empty
		assignment === null && 'bg-white hover:bg-slate-50',
		// Filled — shared per-subject colour (matches the lists app-wide)
		assignment !== null && subjectPill(assignment.subject),
		// Editable states
		isEditable && assignment !== null && 'cursor-grab active:cursor-grabbing',
		isEditable && assignment === null && 'cursor-pointer',
		// Manual marker
		assignment?.isManual && 'border-dashed',
		// Drag hints — free slots invite the drop, taken slots warn it's occupied
		isFreeTarget && 'bg-emerald-50 ring-2 ring-inset ring-emerald-400 hover:bg-emerald-100',
		isTakenTarget && 'cursor-not-allowed opacity-60 ring-2 ring-inset ring-rose-300'
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
			onDragEnd={handleDragEnd}
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
					{/* Subject — wraps to multiple lines, no truncation */}
					<span className="block text-xs font-semibold leading-snug break-words">
						{assignment.subject}
					</span>
					{/* Lecturer + Room — hidden on mobile to save space, shown from md up.
					    Solid gray (not opacity) so text keeps enough contrast on the coloured cell. */}
					<span className="mt-0.5 hidden truncate text-xs leading-snug text-gray-600 md:block">
						{lecturerName}
					</span>
					<span className="hidden truncate text-xs leading-snug text-gray-500 md:block">
						{roomLabel}
					</span>
					{/* Manual badge */}
					{assignment.isManual && (
						<span className="absolute right-1 top-0.5 rounded bg-amber-400 px-1 py-px text-[10px] font-bold text-amber-900">
							M
						</span>
					)}
				</>
			) : (
				<span className="block text-center text-xs text-gray-400">—</span>
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

// Header row. Day names show short on mobile (Mon) and full from md up (Monday).
function GridHeader() {
	return (
		<div className={cn(TIMETABLE_GRID_COLS, 'border-b')}>
			<div className="flex h-9 items-center justify-center border-r bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500 md:h-10">
				Time
			</div>
			{ALL_DAYS.map(day => (
				<div
					key={day}
					className="flex h-9 items-center justify-center border-r bg-gray-50 text-xs font-semibold text-gray-600 md:h-10"
					role="columnheader"
					aria-label={DAY_FULL[day]}
				>
					<span className="md:hidden">{DAY_NAMES[day]}</span>
					<span className="hidden md:inline">{DAY_FULL[day]}</span>
				</div>
			))}
		</div>
	)
}

// One data row for a given hour.
interface GridRowProps {
	hour: HourSlot
	timetable: Timetable
	viewMode: 'lecturer' | 'room' | 'faculty'
	entityId: string
	isEditable: boolean
	draggedAssignment: ClassAssignment | null
	setDraggedAssignment: (assignment: ClassAssignment | null) => void
	resolveLecturerName: (id: string) => string
	resolveRoomLabel: (id: string) => string
	resolveFacultyName: (id: string) => string
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
}

function GridRow({
	hour,
	timetable,
	viewMode,
	entityId,
	isEditable,
	draggedAssignment,
	setDraggedAssignment,
	resolveLecturerName,
	resolveRoomLabel,
	resolveFacultyName,
	onSlotClick,
	onSlotDrop,
}: GridRowProps) {
	return (
		<div className={TIMETABLE_GRID_COLS} role="row">
			<div className="flex min-h-[4rem] items-center justify-center border-b border-r bg-gray-50 px-1 text-center text-xs font-medium leading-tight text-gray-500 md:min-h-[5.5rem]">
				{HOUR_LABELS[hour]}
			</div>
			{ALL_DAYS.map(day => {
				const assignment = timetable[day][hour]
				return (
					<TimetableCell
						key={`${day}-${hour}`}
						assignment={assignment}
						isEditable={isEditable}
						draggedAssignment={draggedAssignment}
						setDraggedAssignment={setDraggedAssignment}
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
	// The class currently being dragged (null when not dragging). Used to
	// highlight which slots it can actually move to — checked against all three
	// timetables (room, lecturer, faculty), not just the one on screen.
	const [draggedAssignment, setDraggedAssignment] = React.useState<ClassAssignment | null>(null)

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
		<div className={cn('relative w-full', className)}>
			{/* Scroll hint — fade on right edge to signal more content */}
			<div
				className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/80 to-transparent rounded-r-xl md:hidden"
				aria-hidden
			/>

			<div
				className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
				role="grid"
				aria-label={`${viewMode} timetable`}
				style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
			>
				{/* min-w-[560px] gives ~100px per day column — clean 2-line wrap for long subject names */}
				<div className="min-w-[560px] md:min-w-[640px]">
					<GridHeader />

					{ALL_HOURS.map(hour => (
						<GridRow
							key={hour}
							hour={hour}
							timetable={timetable}
							viewMode={viewMode}
							entityId={entityId}
							isEditable={isEditable}
							draggedAssignment={draggedAssignment}
							setDraggedAssignment={setDraggedAssignment}
							resolveLecturerName={resolveLecturerName}
							resolveRoomLabel={resolveRoomLabel}
							resolveFacultyName={resolveFacultyName}
							onSlotClick={onSlotClick}
							onSlotDrop={onSlotDrop}
						/>
					))}
				</div>
			</div>

			{/* Mobile scroll hint text */}
			<p className="mt-1.5 text-center text-xs text-gray-400 md:hidden" aria-hidden>
				← scroll to see all days →
			</p>
		</div>
	)
}
