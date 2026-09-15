import { PageHeader } from '@/components/layout/PageHeader'
import { TimetableViewer } from '@/components/timetable/TimetableViewer'
import { Button } from '@/components/ui/button'
import { clearDemoSchedule, saveDemoSchedule } from '@/hooks/useSeedData'
import { useToast } from '@/hooks/useToast'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { runSchedulingAlgorithm } from '@/lib/algorithm/schedulingAlgorithm'
import { countTimetableSlots } from '@/lib/timetable'
import { cn } from '@/lib/utils'
import { selectIsDemoMode } from '@/store/authSlice'
import { pushEdit } from '@/store/editHistorySlice'
import { selectAllFaculties, selectAllLecturers, selectAllRooms } from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
	loadSchedule,
	moveClass,
	resetSchedule,
	saveScheduleThunk,
	selectHasSchedule,
} from '@/store/scheduleSlice'
import type { ClassAssignment, ScheduleInput, ScheduleResult, TimeSlotRef } from '@/types'
import {
	BrainCircuit,
	CalendarCheck,
	GripVertical,
	Loader2,
	Redo2,
	RotateCcw,
	Sparkles,
	Undo2,
	Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'

function StatCard({
	label,
	value,
	icon: Icon,
	gradient,
}: {
	label: string
	value: number
	icon: typeof CalendarCheck
	gradient: string
}) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-md',
				gradient
			)}
		>
			<div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/10" />
			<Icon className="size-5 opacity-80 mb-2" aria-hidden />
			<p className="text-2xl font-black tabular-nums">{value}</p>
			<p className="text-xs font-semibold opacity-80 mt-0.5">{label}</p>
		</div>
	)
}

export default function SchedulePage() {
	const dispatch = useAppDispatch()
	const lecturers = useAppSelector(selectAllLecturers)
	const rooms = useAppSelector(selectAllRooms)
	const faculties = useAppSelector(selectAllFaculties)
	const hasSchedule = useAppSelector(selectHasSchedule)
	const isDemoMode = useAppSelector(selectIsDemoMode)
	const { undo, redo, canUndo, canRedo } = useUndoRedo()
	const toast = useToast()

	const [result, setResult] = useState<ScheduleResult | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)

	const canGenerate = lecturers.length > 0 && rooms.length > 0 && faculties.length > 0

	const scheduleInput: ScheduleInput = useMemo(
		() => ({ lecturers, rooms, faculties }),
		[lecturers, rooms, faculties]
	)

	const persist = (schedule?: Parameters<typeof saveDemoSchedule>[0]) => {
		if (isDemoMode) {
			// Demo mode — save to sessionStorage so reload restores it
			if (schedule) saveDemoSchedule(schedule)
			return
		}
		dispatch(saveScheduleThunk())
			.unwrap()
			.catch(() => toast.error('Schedule saved locally but could not sync.'))
	}

	const handleGenerate = () => {
		setIsGenerating(true)
		setTimeout(() => {
			const outcome = runSchedulingAlgorithm(scheduleInput)
			dispatch(loadSchedule(outcome.schedule))
			setResult(outcome)
			setIsGenerating(false)
			outcome.success
				? toast.success(
						`Scheduled ${countTimetableSlots(outcome.schedule.faculties)} classes with no conflicts.`
					)
				: toast.warning(`${outcome.unresolvedConstraints.length} class(es) could not be placed.`)
			persist(outcome.schedule)
		}, 50)
	}

	const handleReset = () => {
		dispatch(resetSchedule())
		setResult(null)
		if (isDemoMode) clearDemoSchedule()
		toast.info('Schedule cleared.')
	}

	const handleSlotDrop = (from: TimeSlotRef, to: TimeSlotRef) => {
		dispatch((dispatchInner, getState) => {
			const { rooms, lecturers, faculties } = getState().schedule
			const { day, hour, entityType, entityId } = from

			let before: ClassAssignment | null = null
			if (entityType === 'room') before = rooms[entityId]?.timetable[day][hour] ?? null
			else if (entityType === 'lecturer') before = lecturers[entityId]?.timetable[day][hour] ?? null
			else if (entityType === 'faculty') before = faculties[entityId]?.timetable[day][hour] ?? null

			const moveResult = dispatchInner(moveClass(from, to))
			if (!moveResult.success) {
				toast.error(moveResult.error ?? 'Could not move class.')
				return
			}

			if (before) {
				const after: ClassAssignment = {
					...before,
					timeSlot: { day: to.day, hour: to.hour },
				}
				dispatchInner(
					pushEdit({
						id: crypto.randomUUID(),
						timestamp: new Date(),
						type: 'move',
						before,
						after,
					})
				)
			}

			// Persist after move — read updated state
			const updated = getState().schedule
			persist(updated)
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Schedule"
				description="Generate a conflict-free timetable, then drag classes to fine-tune."
				actions={
					<div className="flex flex-wrap items-center gap-2">
						{/* Generate is first — primary action, always visible */}
						<Button onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
							{isGenerating ? (
								<>
									<Loader2 className="size-4 animate-spin" /> Generating…
								</>
							) : (
								<>
									<Sparkles className="size-4" /> Generate schedule
								</>
							)}
						</Button>
						{/* Secondary actions — only after a schedule exists */}
						{hasSchedule && (
							<>
								<Button variant="outline" onClick={handleReset}>
									<RotateCcw className="size-4" /> Reset
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={undo}
									disabled={!canUndo}
									aria-label="Undo last move"
									title="Undo (Ctrl+Z)"
								>
									<Undo2 className="size-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={redo}
									disabled={!canRedo}
									aria-label="Redo last move"
									title="Redo (Ctrl+Y)"
								>
									<Redo2 className="size-4" />
								</Button>
							</>
						)}
					</div>
				}
			/>

			{!canGenerate && (
				<div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
					<span className="mt-0.5 text-lg">⚠️</span>
					<div>
						<p className="text-sm font-semibold text-amber-900">Not ready to generate</p>
						<p className="text-xs text-amber-700 mt-0.5">
							Add at least one lecturer, one room, and one faculty.
						</p>
					</div>
				</div>
			)}

			{result && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up">
					<StatCard
						label="Classes placed"
						value={countTimetableSlots(result.schedule.faculties)}
						icon={CalendarCheck}
						gradient="from-indigo-600 to-violet-700"
					/>
					<StatCard
						label="Backtracks"
						value={result.backtracks}
						icon={RotateCcw}
						gradient="from-sky-600 to-blue-700"
					/>
					<StatCard
						label="Algorithm steps"
						value={result.totalSteps}
						icon={BrainCircuit}
						gradient="from-emerald-600 to-teal-700"
					/>
					<StatCard
						label="Unresolved"
						value={result.unresolvedConstraints.length}
						icon={Zap}
						gradient={
							result.unresolvedConstraints.length > 0
								? 'from-amber-600 to-orange-700'
								: 'from-emerald-600 to-teal-700'
						}
					/>
				</div>
			)}

			{hasSchedule ? (
				<TimetableViewer isEditable onSlotDrop={handleSlotDrop} />
			) : (
				<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-fade-up">
					<div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-8 py-12 text-center">
						<div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/5" />
						<div className="pointer-events-none absolute -right-6 bottom-0 size-28 rounded-full bg-white/5" />
						<div className="relative">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm animate-float">
								<BrainCircuit className="size-8 text-white" aria-hidden />
							</div>
							<h2 className="text-2xl font-black text-white">No schedule yet</h2>
							<p className="mt-2 text-sm text-white/80 max-w-sm mx-auto">
								The constraint-satisfaction solver will place every subject into a conflict-free
								slot in seconds.
							</p>
							{canGenerate && (
								<div className="mt-6 flex justify-center">
									<button
										onClick={handleGenerate}
										className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
									>
										<Sparkles className="size-4" />
										Generate schedule
									</button>
								</div>
							)}
						</div>
					</div>
					<div className="grid divide-x divide-gray-100 sm:grid-cols-2">
						{[
							{
								icon: BrainCircuit,
								title: 'Smart algorithm',
								desc: 'Backtracking solver handles complex constraints automatically.',
							},
							{
								icon: GripVertical,
								title: 'Drag to edit',
								desc: 'Fine-tune any slot with drag-and-drop after generation.',
							},
						].map(({ icon: Icon, title, desc }) => (
							<div key={title} className="flex flex-col items-center gap-2 p-5 text-center">
								<div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
									<Icon className="size-5 text-indigo-600" aria-hidden />
								</div>
								<p className="text-sm font-bold text-gray-900">{title}</p>
								<p className="text-xs text-gray-500">{desc}</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
