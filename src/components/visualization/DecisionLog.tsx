/**
 * DecisionLog — scrollable log of algorithm decisions during visualization.
 *
 * Auto-scrolls to the current step. Color-codes by decision type.
 * Requirements: 4.7
 */
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectVizDecisionLog, selectVizCurrentIndex } from '@/store/visualizationSlice'
import type { AlgorithmStep } from '@/types'
import { useEffect, useRef } from 'react'

const TYPE_STYLES: Record<AlgorithmStep['type'], string> = {
	evaluate: 'text-gray-600',
	assign: 'text-green-700 font-medium',
	conflict: 'text-red-700 font-medium',
	backtrack: 'text-amber-700 font-medium',
	complete: 'text-blue-700 font-semibold',
}

const TYPE_ICONS: Record<AlgorithmStep['type'], string> = {
	evaluate: '🔍',
	assign: '✓',
	conflict: '✗',
	backtrack: '↩',
	complete: '🎉',
}

export function DecisionLog({ className }: { className?: string }) {
	const decisionLog = useAppSelector(selectVizDecisionLog)
	const currentStepIndex = useAppSelector(selectVizCurrentIndex)
	const currentRef = useRef<HTMLLIElement | null>(null)

	// Auto-scroll to current step
	useEffect(() => {
		currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
	}, [currentStepIndex])

	if (decisionLog.length === 0) {
		return (
			<div
				className={cn(
					'flex items-center justify-center h-24 text-xs text-gray-500 border border-gray-100 rounded-2xl bg-white',
					className
				)}
			>
				Decision log will appear when visualization starts
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Decision Log</h4>
			<ol
				className="max-h-72 overflow-y-auto divide-y rounded-2xl border border-gray-100 bg-gray-50/50 text-xs"
				aria-label="Algorithm decision log"
				aria-live="polite"
			>
				{decisionLog.map((entry, i) => (
					<li
						key={i}
						ref={i === currentStepIndex ? currentRef : null}
						className={cn(
							'flex items-start gap-2 px-3 py-1.5 transition-colors',
							i === currentStepIndex && 'bg-blue-50',
							i < currentStepIndex && 'opacity-60',
							TYPE_STYLES[entry.type]
						)}
						aria-current={i === currentStepIndex ? 'step' : undefined}
					>
						<span className="mt-0.5 w-4 shrink-0 text-center text-[10px]" aria-hidden>
							{TYPE_ICONS[entry.type]}
						</span>
						<span className="flex-1 leading-snug">
							<span className="mr-1.5 text-gray-500">#{entry.stepNumber}</span>
							{entry.description}
						</span>
					</li>
				))}
			</ol>
		</div>
	)
}

export default DecisionLog
