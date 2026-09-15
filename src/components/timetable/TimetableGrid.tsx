/**
 * TimetableGrid — 5-day × 4-hour schedule grid.
 *
 * Reads entity names from scheduleStore so cells show human-readable text
 * instead of raw IDs.
 */
import { ALL_DAYS, ALL_HOURS } from '@/lib/timetable'
import { subjectPill } from '@/lib/ui/subjectColors'
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
	compact: boolean
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
	compact,
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
		// Base — content wraps naturally, no overflow clipping needed
		'group relative flex flex-col justify-center border-b border-r text-xs transition-all duration-150 select-none',
		compact ? 'p-1 min-h-[4.5rem]' : 'p-1.5 min-h-[5.5rem]',
		// Empty
		assignment === null && 'bg-white hover:bg-slate-50',
		// Filled — shared per-subject colour (matches the lists app-wide)
		assignment !== null && subjectPill(assignment.subject),
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
					{/* Subject — wraps to multiple lines, no truncation */}
					<span
						className={cn('block font-semibold leading-snug break-words', compact && 'text-xs')}
					>
						{assignment.subject}
					</span>
					{/* Lecturer + Room — hidden in compact mode to save space.
					    Solid gray (not opacity) so text keeps enough contrast on the coloured cell. */}
					{!compact && (
						<>
							<span className="mt-0.5 block truncate text-xs leading-snug text-gray-600">
								{lecturerName}
							</span>
							<span className="block truncate text-xs leading-snug text-gray-500">{roomLabel}</span>
						</>
					)}
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

// Single source of truth for the grid column template used by every row.
// minmax(0, 1fr) instead of 1fr — prevents long subject names from stretching columns.
const GRID_COLS_STYLE = { gridTemplateColumns: '4rem repeat(5, minmax(0, 1fr))' } as const
const GRID_COLS_STYLE_MD = { gridTemplateColumns: '5rem repeat(5, minmax(0, 1fr))' } as const

// One header, rendered twice: compact (short day names) for mobile, full for desktop.
function GridHeader({ compact }: { compact: boolean }) {
	const style = compact ? GRID_COLS_STYLE : GRID_COLS_STYLE_MD
	const dayLabel = (day: DayOfWeek) => (compact ? DAY_NAMES[day] : DAY_FULL[day])
	const height = compact ? 'h-9' : 'h-10'
	const visibility = compact ? 'md:hidden' : 'hidden md:grid'

	return (
		<div className={cn('grid border-b', visibility)} style={style}>
			<div
				className={cn(
					'flex items-center justify-center border-r bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide',
					height
				)}
			>
				{compact ? 'Time' : 'Hour'}
			</div>
			{ALL_DAYS.map(day => (
				<div
					key={day}
					className={cn(
						'flex items-center justify-center border-r bg-gray-50 text-xs font-semibold text-gray-600',
						height
					)}
					role="columnheader"
					aria-label={DAY_FULL[day]}
				>
					{dayLabel(day)}
				</div>
			))}
		</div>
	)
}

// One data row for a given hour, rendered twice: compact for mobile, full for desktop.
interface GridRowProps {
	hour: HourSlot
	compact: boolean
	timetable: Timetable
	viewMode: 'lecturer' | 'room' | 'faculty'
	entityId: string
	isEditable: boolean
	resolveLecturerName: (id: string) => string
	resolveRoomLabel: (id: string) => string
	resolveFacultyName: (id: string) => string
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
}

function GridRow({
	hour,
	compact,
	timetable,
	viewMode,
	entityId,
	isEditable,
	resolveLecturerName,
	resolveRoomLabel,
	resolveFacultyName,
	onSlotClick,
	onSlotDrop,
}: GridRowProps) {
	const style = compact ? GRID_COLS_STYLE : GRID_COLS_STYLE_MD
	const visibility = compact ? 'grid md:hidden' : 'hidden md:grid'
	const labelCell = compact ? 'min-h-[4rem] leading-tight text-center px-1' : 'min-h-[5.5rem]'

	return (
		<div className={visibility} style={style} role="row">
			<div
				className={cn(
					'flex items-center justify-center border-b border-r bg-gray-50 text-xs font-medium text-gray-500',
					labelCell
				)}
			>
				{HOUR_LABELS[hour]}
			</div>
			{ALL_DAYS.map(day => {
				const assignment = timetable[day][hour]
				return (
					<TimetableCell
						key={`${day}-${hour}`}
						assignment={assignment}
						isEditable={isEditable}
						compact={compact}
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
					{/* Header: compact one shows on mobile, full one on desktop */}
					<GridHeader compact />
					<GridHeader compact={false} />

					{/* Data rows: each hour renders a compact (mobile) and full (desktop) row */}
					{ALL_HOURS.map(hour => (
						<React.Fragment key={hour}>
							<GridRow
								hour={hour}
								compact
								timetable={timetable}
								viewMode={viewMode}
								entityId={entityId}
								isEditable={isEditable}
								resolveLecturerName={resolveLecturerName}
								resolveRoomLabel={resolveRoomLabel}
								resolveFacultyName={resolveFacultyName}
								onSlotClick={onSlotClick}
								onSlotDrop={onSlotDrop}
							/>
							<GridRow
								hour={hour}
								compact={false}
								timetable={timetable}
								viewMode={viewMode}
								entityId={entityId}
								isEditable={isEditable}
								resolveLecturerName={resolveLecturerName}
								resolveRoomLabel={resolveRoomLabel}
								resolveFacultyName={resolveFacultyName}
								onSlotClick={onSlotClick}
								onSlotDrop={onSlotDrop}
							/>
						</React.Fragment>
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
