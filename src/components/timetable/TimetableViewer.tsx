/**
 * TimetableViewer — view-mode tabs + entity selector + live timetable grid.
 *
 * In normal mode reads from scheduleStore.
 * In visualization mode uses `overrideState` (progressive timetable) and
 * auto-follows the entity the algorithm is currently working on, so you
 * always see the active action without having to click anything.
 * Clicking a pill manually pins the view on that entity.
 */
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
	selectScheduleRooms,
	selectScheduleLecturers,
	selectScheduleFaculties,
} from '@/store/scheduleSlice'
import {
	selectVizHighlightedElements,
	selectVizPlaybackState,
	selectVizCurrentStep,
} from '@/store/visualizationSlice'
import type { ClassAssignment, ScheduleState, TimeSlot, TimeSlotRef } from '@/types'
import { useState } from 'react'
import { TimetableGrid } from './TimetableGrid'

type ViewMode = 'lecturer' | 'room' | 'faculty'

interface TimetableViewerProps {
	onSlotClick?: (slot: TimeSlot, assignment: ClassAssignment | null) => void
	onSlotDrop?: (from: TimeSlotRef, to: TimeSlotRef) => void
	isEditable?: boolean
	className?: string
	/** Progressive timetable from useProgressiveTimetable() during visualization */
	overrideState?: ScheduleState | null
}

export function TimetableViewer({
	onSlotClick,
	onSlotDrop,
	isEditable = false,
	className,
	overrideState,
}: TimetableViewerProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('lecturer')
	// null = auto-follow; a string = user has pinned this entity
	const [pinnedEntityId, setPinnedEntityId] = useState<string | null>(null)

	const storeLecturers = useAppSelector(selectScheduleLecturers)
	const storeRooms = useAppSelector(selectScheduleRooms)
	const storeFaculties = useAppSelector(selectScheduleFaculties)

	const srcLecturers = overrideState?.lecturers ?? storeLecturers
	const srcRooms = overrideState?.rooms ?? storeRooms
	const srcFaculties = overrideState?.faculties ?? storeFaculties

	// Visualization state
	const highlightedElements = useAppSelector(selectVizHighlightedElements)
	const playbackState = useAppSelector(selectVizPlaybackState)
	const currentStep = useAppSelector(selectVizCurrentStep)

	const isVizActive =
		overrideState !== undefined && (playbackState === 'playing' || playbackState === 'paused')

	// Auto-follow: derive active entity from current step when unpinned
	const autoEntityId: string | null = (() => {
		if (!isVizActive || pinnedEntityId) return null
		if (!currentStep) return null
		if (viewMode === 'lecturer') return currentStep.currentLecturer ?? null
		if (viewMode === 'room') return currentStep.currentRoom ?? null
		if (viewMode === 'faculty') return currentStep.currentFaculty ?? null
		return null
	})()

	const highlightedSlots: TimeSlot[] = highlightedElements
		.filter(el => el.type === 'slot' && el.slot && el.style !== 'conflict')
		.map(el => el.slot!)
	const conflictSlots: TimeSlot[] = highlightedElements
		.filter(el => el.type === 'slot' && el.slot && el.style === 'conflict')
		.map(el => el.slot!)
	const activeSlot: TimeSlot | null = currentStep?.currentSlot ?? null

	// Entity list for the pill selector
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

	// Which entity is visually selected — auto or pinned or default first
	const activeEntityId = autoEntityId ?? pinnedEntityId ?? entities[0]?.id ?? null

	const timetable = (() => {
		if (!activeEntityId) return null
		switch (viewMode) {
			case 'lecturer':
				return srcLecturers[activeEntityId]?.timetable ?? null
			case 'room':
				return srcRooms[activeEntityId]?.timetable ?? null
			case 'faculty':
				return srcFaculties[activeEntityId]?.timetable ?? null
		}
	})()

	const handleViewChange = (mode: ViewMode) => {
		setViewMode(mode)
		setPinnedEntityId(null) // unpin on tab change so auto-follow re-engages
	}

	const handlePinEntity = (id: string) => {
		// If the user clicks the already-active auto entity, unpin (re-enable follow)
		if (!pinnedEntityId && id === autoEntityId) {
			setPinnedEntityId(id) // pin it so clicks toggle off on next click
		} else if (pinnedEntityId === id) {
			setPinnedEntityId(null) // unpin = re-enable auto-follow
		} else {
			setPinnedEntityId(id)
		}
	}

	const TAB_MODES: ViewMode[] = ['lecturer', 'room', 'faculty']

	return (
		<div className={cn('flex flex-col gap-4', className)}>
			{/* Auto-follow indicator */}
			{isVizActive && !pinnedEntityId && (
				<p className="text-[11px] text-blue-600 flex items-center gap-1">
					<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
					Auto-following active entity — click a pill to pin
				</p>
			)}
			{isVizActive && pinnedEntityId && (
				<p className="text-[11px] text-gray-500 flex items-center gap-1">
					<span>📌 Pinned.</span>
					<button
						onClick={() => setPinnedEntityId(null)}
						className="underline underline-offset-2 hover:text-gray-700"
					>
						Resume auto-follow
					</button>
				</p>
			)}

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
					{entities.map(entity => {
						const isActive = activeEntityId === entity.id
						const isAutoActive = !pinnedEntityId && entity.id === autoEntityId
						return (
							<button
								key={entity.id}
								onClick={() => handlePinEntity(entity.id)}
								className={cn(
									'rounded-full border px-3 py-1 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
									isActive && !isAutoActive && 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm',
									isAutoActive &&
										'border-blue-500 bg-blue-700 text-white shadow-sm ring-2 ring-blue-300',
									!isActive &&
										'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
								)}
								aria-pressed={isActive}
								title={isAutoActive ? 'Currently being worked on by the algorithm' : undefined}
							>
								{entity.label}
							</button>
						)
					})}
				</div>
			) : (
				<p className="text-sm text-gray-600">No {viewMode}s available yet.</p>
			)}

			{/* Grid */}
			{timetable && activeEntityId ? (
				<TimetableGrid
					timetable={timetable}
					viewMode={viewMode}
					entityId={activeEntityId}
					onSlotClick={onSlotClick}
					onSlotDrop={onSlotDrop}
					highlightedSlots={highlightedSlots}
					conflictSlots={conflictSlots}
					activeSlot={activeSlot}
					isEditable={isEditable}
				/>
			) : (
				<div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
					Select a {viewMode} to view its timetable
				</div>
			)}
		</div>
	)
}

export default TimetableViewer
