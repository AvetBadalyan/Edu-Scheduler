/**
 * SchedulePage — generate, visualize and manually edit a conflict-free timetable.
 */
import { PageHeader } from '@/components/layout/PageHeader'
import { TimetableViewer } from '@/components/timetable/TimetableViewer'
import { Button } from '@/components/ui/button'
import { DecisionLog } from '@/components/visualization/DecisionLog'
import { VisualizationPlayer } from '@/components/visualization/VisualizationPlayer'
import { useProgressiveTimetable } from '@/hooks/useProgressiveTimetable'
import { useToast } from '@/hooks/useToast'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { runSchedulingAlgorithm } from '@/lib/algorithm/schedulingAlgorithm'
import { cn } from '@/lib/utils'
import { useEntityStore } from '@/stores/entityStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useVisualizationStore } from '@/stores/visualizationStore'
import type { ScheduleInput, ScheduleResult, TimeSlotRef } from '@/types'
import {
	BrainCircuit,
	CalendarCheck,
	CheckCircle2,
	Eye,
	GripVertical,
	Redo2,
	RotateCcw,
	Sparkles,
	Undo2,
	Zap
} from 'lucide-react'
import { useMemo, useState } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countAssignments(result: ScheduleResult): number {
	let n = 0
	for (const f of Object.values(result.schedule.faculties))
		for (const d of [1, 2, 3, 4, 5] as const)
			for (const h of [1, 2, 3, 4] as const) if (f.timetable[d][h] !== null) n++
	return n
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
	const { lecturers, rooms, faculties } = useEntityStore()
	const { loadSchedule, resetSchedule, moveClass } = useScheduleStore()
	const scheduleLecturers = useScheduleStore(s => s.lecturers)
	const { undo, redo, canUndo, canRedo } = useUndoRedo()
	const toast = useToast()

	const vizPlaybackState = useVisualizationStore(s => s.playbackState)
	const vizResult = useVisualizationStore(s => s.result)
	const resetVisualization = useVisualizationStore(s => s.reset)
	const progressiveTimetable = useProgressiveTimetable()

	const [result, setResult] = useState<ScheduleResult | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [showVisualizer, setShowVisualizer] = useState(false)

	const hasSchedule = Object.keys(scheduleLecturers).length > 0
	const canGenerate =
		lecturers.length > 0 && rooms.length > 0 && faculties.length > 0
	const isVizActive =
		showVisualizer &&
		(vizPlaybackState === 'playing' ||
			vizPlaybackState === 'paused' ||
			vizPlaybackState === 'complete')

	const scheduleInput: ScheduleInput = useMemo(
		() => ({ lecturers, rooms, faculties }),
		[lecturers, rooms, faculties]
	)

	const totalRequired = useMemo(
		() =>
			faculties.reduce(
				(sum, f) => sum + f.syllabus.reduce((s, e) => s + e.requiredHours, 0),
				0
			),
		[faculties]
	)

	const handleGenerate = () => {
		if (showVisualizer) {
			setShowVisualizer(false)
			resetVisualization()
		}
		setIsGenerating(true)
		setTimeout(() => {
			const outcome = runSchedulingAlgorithm(scheduleInput)
			loadSchedule(outcome.schedule)
			setResult(outcome)
			setIsGenerating(false)
			outcome.success
				? toast.success(`Scheduled ${totalRequired} classes with no conflicts.`)
				: toast.warning(
						`${outcome.unresolvedConstraints.length} class(es) could not be placed.`
					)
		}, 50)
	}

	const handleKeepResult = () => {
		if (!vizResult) return
		loadSchedule(vizResult.schedule)
		setResult(vizResult)
		setShowVisualizer(false)
		resetVisualization()
		toast.success('Schedule loaded from visualization.')
	}

	const handleReset = () => {
		resetSchedule()
		resetVisualization()
		setResult(null)
		setShowVisualizer(false)
		toast.info('Schedule cleared.')
	}

	const handleToggleVisualizer = () => {
		if (showVisualizer) {
			setShowVisualizer(false)
			resetVisualization()
		} else setShowVisualizer(true)
	}

	const handleSlotDrop = (from: TimeSlotRef, to: TimeSlotRef) => {
		const r = moveClass(from, to)
		if (!r.success) toast.error(r.error ?? 'Could not move class.')
	}

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title="Schedule"
				description="Generate a conflict-free timetable, then drag classes to fine-tune."
				actions={
					<div className="flex flex-wrap gap-2">
						{hasSchedule && !showVisualizer && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={undo}
									disabled={!canUndo}
									aria-label="Undo"
								>
									<Undo2 className="size-3.5" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={redo}
									disabled={!canRedo}
									aria-label="Redo"
								>
									<Redo2 className="size-3.5" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={handleReset}
								>
									<RotateCcw className="size-3.5" /> Reset
								</Button>
							</>
						)}
						<Button
							variant="outline"
							onClick={handleToggleVisualizer}
							disabled={!canGenerate}
							aria-pressed={showVisualizer}
						>
							<Eye className="size-4" />
							{showVisualizer ? 'Hide visualizer' : 'Visualize'}
						</Button>
						<Button
							onClick={handleGenerate}
							disabled={!canGenerate || isGenerating}
						>
							<Sparkles className="size-4" />
							{isGenerating ? 'Generating…' : 'Generate schedule'}
						</Button>
					</div>
				}
			/>

			{/* ── Not ready warning ───────────────────────────────────────────── */}
			{!canGenerate && (
				<div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
					<span className="mt-0.5 text-lg">⚠️</span>
					<div>
						<p className="text-sm font-semibold text-amber-900">
							Not ready to generate
						</p>
						<p className="text-xs text-amber-700 mt-0.5">
							You need at least one lecturer, one room, and one faculty.
							{lecturers.length === 0 && ' — Add lecturers'}
							{rooms.length === 0 && ' — Add rooms'}
							{faculties.length === 0 && ' — Add faculties'}
						</p>
					</div>
				</div>
			)}

			{/* ── Summary stat cards ──────────────────────────────────────────── */}
			{result && !showVisualizer && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up">
					<StatCard
						label="Classes placed"
						value={countAssignments(result)}
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

			{/* ── Visualizer mode ─────────────────────────────────────────────── */}
			{showVisualizer && canGenerate && (
				<div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
					<div className="flex flex-col gap-4">
						<VisualizationPlayer input={scheduleInput} />
						<DecisionLog />
						{vizPlaybackState === 'complete' && vizResult && (
							<Button
								onClick={handleKeepResult}
								className="w-full gap-2"
							>
								<CheckCircle2 className="size-4" />
								Use this schedule
							</Button>
						)}
					</div>

					<div className="flex flex-col gap-3">
						{isVizActive ? (
							<>
								<div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2.5 text-xs font-medium text-indigo-700">
									<span
										className={cn(
											'size-2 rounded-full',
											vizPlaybackState === 'complete'
												? 'bg-emerald-500'
												: 'bg-indigo-500 animate-pulse'
										)}
									/>
									{vizPlaybackState === 'complete'
										? 'Algorithm finished — click "Use this schedule" to apply.'
										: 'Watching algorithm assign classes…'}
								</div>
								<TimetableViewer
									overrideState={progressiveTimetable}
									isEditable={false}
								/>
							</>
						) : (
							<VizEmptyState />
						)}
					</div>
				</div>
			)}

			{/* ── Normal timetable / empty state ──────────────────────────────── */}
			{!showVisualizer && (
				<>
					{hasSchedule ? (
						<TimetableViewer
							isEditable
							onSlotDrop={handleSlotDrop}
						/>
					) : (
						<ScheduleEmptyState
							canGenerate={canGenerate}
							onGenerate={handleGenerate}
							onVisualize={handleToggleVisualizer}
						/>
					)}
				</>
			)}
		</div>
	)
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
	label,
	value,
	icon: Icon,
	gradient
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
			<Icon
				className="size-5 opacity-80 mb-2"
				aria-hidden
			/>
			<p className="text-2xl font-black tabular-nums">{value}</p>
			<p className="text-xs font-semibold opacity-80 mt-0.5">{label}</p>
		</div>
	)
}

// ─── ScheduleEmptyState ───────────────────────────────────────────────────────

function ScheduleEmptyState({
	canGenerate,
	onGenerate,
	onVisualize
}: {
	canGenerate: boolean
	onGenerate: () => void
	onVisualize: () => void
}) {
	return (
		<div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-fade-up">
			{/* Hero gradient banner */}
			<div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-8 py-12 text-center">
				<div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/5" />
				<div className="pointer-events-none absolute -right-6 bottom-0 size-28 rounded-full bg-white/5" />

				<div className="relative">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm animate-float">
						<BrainCircuit
							className="size-8 text-white"
							aria-hidden
						/>
					</div>
					<h2 className="text-2xl font-black text-white">No schedule yet</h2>
					<p className="mt-2 text-sm text-white/80 max-w-sm mx-auto">
						The constraint-satisfaction solver will place every subject into a
						conflict-free slot in seconds.
					</p>

					{canGenerate && (
						<div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
							<button
								onClick={onGenerate}
								className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
							>
								<Sparkles className="size-4" />
								Generate instantly
							</button>
							<button
								onClick={onVisualize}
								className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
							>
								<Eye className="size-4" />
								Watch it build
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Feature hints */}
			<div className="grid divide-x divide-gray-100 sm:grid-cols-3">
				{[
					{
						icon: BrainCircuit,
						title: 'Smart algorithm',
						desc: 'Backtracking solver handles complex constraints automatically.'
					},
					{
						icon: Eye,
						title: 'Step-by-step viz',
						desc: 'Watch every assignment and backtrack in real time.'
					},
					{
						icon: GripVertical,
						title: 'Drag to edit',
						desc: 'Fine-tune any slot with drag-and-drop after generation.'
					}
				].map(({ icon: Icon, title, desc }) => (
					<div
						key={title}
						className="flex flex-col items-center gap-2 p-5 text-center"
					>
						<div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
							<Icon
								className="size-5 text-indigo-600"
								aria-hidden
							/>
						</div>
						<p className="text-sm font-bold text-gray-900">{title}</p>
						<p className="text-xs text-gray-500">{desc}</p>
					</div>
				))}
			</div>
		</div>
	)
}

// ─── VizEmptyState ────────────────────────────────────────────────────────────

function VizEmptyState() {
	return (
		<div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 text-center px-8">
			<div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 animate-float">
				<Eye
					className="size-7 text-indigo-600"
					aria-hidden
				/>
			</div>
			<div>
				<p className="text-base font-bold text-gray-900">
					Watch the algorithm think
				</p>
				<p className="mt-1 text-sm text-gray-500 max-w-xs">
					The timetable starts empty. Cells appear as the algorithm assigns
					classes — and disappear when it backtracks.
				</p>
			</div>
			<p className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700">
				Click "Start Visualization" →
			</p>
		</div>
	)
}
