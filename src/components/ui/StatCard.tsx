import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
	label: string
	value: number
	icon: LucideIcon
	/** Tailwind gradient classes, e.g. "bg-gradient-to-br from-indigo-700 to-violet-700". */
	gradient: string
	className?: string
}

/**
 * A gradient stat tile: icon + big number + label on a coloured card.
 * Used on the Dashboard (wrapped in a Link) and the Schedule results row.
 */
export function StatCard({ label, value, icon: Icon, gradient, className }: StatCardProps) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl p-4 text-white shadow-md',
				gradient,
				className
			)}
		>
			<div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/10" />
			<Icon className="mb-2 size-5 opacity-80" aria-hidden />
			<p className="text-2xl font-black tabular-nums">{value}</p>
			<p className="mt-0.5 text-xs font-semibold opacity-80">{label}</p>
		</div>
	)
}
