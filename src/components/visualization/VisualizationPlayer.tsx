/**
 * VisualizationPlayer — playback controls for algorithm visualization.
 * Lives inside the Schedule page next to the live timetable grid.
 */
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
	pause,
	play,
	resetVisualization,
	selectVizCurrentIndex,
	selectVizIsLoading,
	selectVizPlaybackSpeed,
	selectVizPlaybackState,
	selectVizResult,
	selectVizSteps,
	startVisualization,
	stepBackward,
	stepForward,
	updateSpeed
} from '@/store/visualizationSlice'
import type { ScheduleInput } from '@/types'
import {
	BrainCircuit,
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	RotateCcw
} from 'lucide-react'

interface VisualizationPlayerProps {
	input: ScheduleInput | null
	className?: string
}

const SPEEDS = [0.5, 1, 2, 4] as const

const STEP_COLORS = {
	evaluate: 'bg-gray-50 border-gray-200 text-gray-700',
	assign: 'bg-green-50 border-green-200 text-green-800',
	conflict: 'bg-red-50 border-red-200 text-red-800',
	backtrack: 'bg-amber-50 border-amber-200 text-amber-800',
	complete: 'bg-blue-50 border-blue-200 text-blue-800'
} as const

const STEP_ICONS = {
	evaluate: '🔍',
	assign: '✓',
	conflict: '✕',
	backtrack: '↩',
	complete: '🎉'
} as const

export function VisualizationPlayer({
	input,
	className
}: VisualizationPlayerProps) {
	const dispatch = useAppDispatch()
	const steps = useAppSelector(selectVizSteps)
	const currentStepIndex = useAppSelector(selectVizCurrentIndex)
	const playbackState = useAppSelector(selectVizPlaybackState)
	const playbackSpeed = useAppSelector(selectVizPlaybackSpeed)
	const isLoading = useAppSelector(selectVizIsLoading)
	const result = useAppSelector(selectVizResult)

	const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null
	const progress =
		steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0

	const assignmentsMade = result
		? Object.values(result.schedule.faculties).reduce((n, f) => {
				for (const d of [1, 2, 3, 4, 5] as const)
					for (const h of [1, 2, 3, 4] as const)
						if (f.timetable[d][h] !== null) n++
				return n
			}, 0)
		: 0

	const handleStart = () => {
		if (!input) return
		dispatch(startVisualization(input))
		// Short delay so the store is hydrated before playback starts
		// play auto-starts inside startVisualization thunk
	}

	return (
		<div
			className={cn(
				'flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md',
				className
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
						<BrainCircuit
							className="size-4"
							aria-hidden
						/>
					</div>
					<h3 className="text-sm font-bold text-gray-900">
						Algorithm Visualization
					</h3>
				</div>
				{playbackState !== 'idle' && (
					<button
						onClick={() => dispatch(resetVisualization())}
						className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-800"
						aria-label="Reset visualization"
					>
						<RotateCcw
							className="size-3"
							aria-hidden
						/>
						Reset
					</button>
				)}
			</div>

			{/* Idle: show start button */}
			{playbackState === 'idle' && (
				<Button
					onClick={handleStart}
					disabled={!input || isLoading}
					data-testid="play-visualization"
					className="w-full gap-2"
				>
					<Play
						className="size-4"
						aria-hidden
					/>
					{isLoading ? 'Preparing…' : 'Start Visualization'}
				</Button>
			)}

			{/* Progress bar */}
			{steps.length > 0 && (
				<div>
					<div className="mb-1 flex justify-between text-[11px] text-gray-500">
						<span>
							Step {Math.max(0, currentStepIndex + 1)}&thinsp;/&thinsp;
							{steps.length}
						</span>
						<span data-testid="assignment-count">{assignmentsMade} placed</span>
					</div>
					<div
						className="h-1.5 overflow-hidden rounded-full bg-gray-100"
						role="progressbar"
						aria-valuenow={progress}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div
							className={cn(
								'h-1.5 rounded-full transition-all duration-300',
								playbackState === 'complete' ? 'bg-green-500' : 'bg-blue-500'
							)}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Current step chip */}
			{currentStep && (
				<div
					className={cn(
						'rounded-lg border px-3 py-2 text-xs leading-snug',
						STEP_COLORS[currentStep.type]
					)}
					aria-live="polite"
					aria-atomic="true"
				>
					<span className="mr-1.5">{STEP_ICONS[currentStep.type]}</span>
					<span className="font-semibold uppercase tracking-wider opacity-60 mr-1.5">
						{currentStep.type}
					</span>
					{currentStep.description}
				</div>
			)}

			{/* Controls */}
			{steps.length > 0 && (
				<div className="flex items-center justify-between gap-2">
					{/* Transport */}
					<div className="flex items-center gap-1">
						<Button
							size="sm"
							variant="outline"
							onClick={() => dispatch(stepBackward())}
							disabled={currentStepIndex <= 0}
							aria-label="Step backward"
							className="size-8 p-0"
						>
							<ChevronLeft
								className="size-4"
								aria-hidden
							/>
						</Button>

						{playbackState === 'playing' ? (
							<Button
								size="sm"
								onClick={() => dispatch(pause())}
								aria-label="Pause"
								className="gap-1.5"
							>
								<Pause
									className="size-3.5"
									aria-hidden
								/>
								Pause
							</Button>
						) : (
							<Button
								size="sm"
								onClick={() => dispatch(play())}
								disabled={playbackState === 'complete'}
								aria-label="Play"
								className="gap-1.5"
							>
								<Play
									className="size-3.5"
									aria-hidden
								/>
								Play
							</Button>
						)}

						<Button
							size="sm"
							variant="outline"
							onClick={() => dispatch(stepForward())}
							disabled={currentStepIndex >= steps.length - 1}
							aria-label="Step forward"
							className="size-8 p-0"
						>
							<ChevronRight
								className="size-4"
								aria-hidden
							/>
						</Button>
					</div>

					{/* Speed */}
					<div
						className="flex gap-1"
						role="group"
						aria-label="Playback speed"
					>
						{SPEEDS.map(s => (
							<button
								key={s}
								onClick={() => dispatch(updateSpeed(s))}
								className={cn(
									'rounded border px-2 py-0.5 text-[11px] font-medium transition-colors',
									playbackSpeed === s
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
								)}
								aria-pressed={playbackSpeed === s}
								aria-label={`${s}× speed`}
							>
								{s}×
							</button>
						))}
					</div>
				</div>
			)}

			{/* Completion banner */}
			{playbackState === 'complete' && result && (
				<div
					className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-800"
					data-testid="visualization-complete"
				>
					<p className="font-semibold">Schedule complete!</p>
					<p className="mt-0.5 text-green-700">
						{assignmentsMade} classes assigned · {result.backtracks} backtracks
						·{' '}
						{result.unresolvedConstraints.length === 0
							? 'All constraints satisfied ✓'
							: `${result.unresolvedConstraints.length} unresolved`}
					</p>
				</div>
			)}
		</div>
	)
}

export default VisualizationPlayer
