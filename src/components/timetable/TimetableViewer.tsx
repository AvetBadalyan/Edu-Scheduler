/**
 * TimetableViewer — view-mode tabs (lecturer / room / faculty) + entity
 * pill selector + timetable grid.
 */
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
	selectScheduleFaculties,
	selectScheduleLecturers,
	selectScheduleRooms,
} from '@/store/scheduleSlice'
import type { ClassAssignment, TimeSlot, TimeSlotRef } from '@/types'
import { useState } from 'react'
import { TimetableGrid } from './TimetableGrid'

type ViewMode = 'lecturer' | 'room' | 'faculty'

interface TimetableViewerProps {
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
	isEditable?: boolean
	className?: string
}

export function TimetableViewer({
	onSlotClick,
	onSlotDrop,
	isEditable = false,
	className,
}: TimetableViewerProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('lecturer')
	const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

	const storeLecturers = useAppSelector(selectScheduleLecturers)
	const storeRooms = useAppSelector(selectScheduleRooms)
	const storeFaculties = useAppSelector(selectScheduleFaculties)

	// Build the list of entities for the pill selector based on current tab
	const entities: Array<{ id: string; label: string }> = (() => {
		switch (viewMode) {
			case 'lecturer':
				return Object.values(storeLecturers).map(l => ({
					id: l.id,
					label: `${l.name} ${l.surname}`,
				}))
			case 'room':
				return Object.values(storeRooms).map(r => ({
					id: r.id,
					label: `Room ${r.number}`,
				}))
			case 'faculty':
				return Object.values(storeFaculties).map(f => ({
					id: f.id,
					label: f.name,
				}))
		}
	})()

	const activeEntityId = selectedEntityId ?? entities[0]?.id ?? null

	const timetable = (() => {
		if (!activeEntityId) return null
		switch (viewMode) {
			case 'lecturer':
				return storeLecturers[activeEntityId]?.timetable ?? null
			case 'room':
				return storeRooms[activeEntityId]?.timetable ?? null
			case 'faculty':
				return storeFaculties[activeEntityId]?.timetable ?? null
		}
	})()

	const handleViewChange = (mode: ViewMode) => {
		setViewMode(mode)
		setSelectedEntityId(null) // reset selection when switching tabs
	}

	const TAB_MODES: ViewMode[] = ['lecturer', 'room', 'faculty']

	return (
		<div className={cn('flex flex-col gap-4', className)}>
			{/* View-mode tabs */}
			<div
				className="flex gap-1 rounded-lg bg-gray-100 p-1"
				role="tablist"
				aria-label="Timetable view mode"
			>
				{TAB_MODES.map(mode => (
					<button
						key={mode}
						role="tab"
						aria-selected={viewMode === mode}
						onClick={() => handleViewChange(mode)}
						className={cn(
							'flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
							viewMode === mode
								? 'bg-white shadow-sm text-gray-900'
								: 'text-gray-500 hover:text-gray-800'
						)}
					>
						{mode}
					</button>
				))}
			</div>

			{/* Entity pill selector */}
			{entities.length > 0 ? (
				<div className="flex flex-wrap gap-2" role="group" aria-label={`Select ${viewMode}`}>
					{entities.map(entity => (
						<button
							key={entity.id}
							onClick={() => setSelectedEntityId(entity.id)}
							className={cn(
								'rounded-full border px-3 py-1 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
								activeEntityId === entity.id
									? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
									: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
							)}
						>
							{entity.label}
						</button>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-400 italic">No {viewMode}s added yet.</p>
			)}

			{/* Timetable grid */}
			{timetable && activeEntityId ? (
				<TimetableGrid
					timetable={timetable}
					viewMode={viewMode}
					entityId={activeEntityId}
					onSlotClick={onSlotClick}
					onSlotDrop={onSlotDrop}
					isEditable={isEditable}
				/>
			) : (
				<p className="text-sm text-gray-400 italic py-4 text-center">
					Select a {viewMode} above to view their timetable.
				</p>
			)}
		</div>
	)
}
