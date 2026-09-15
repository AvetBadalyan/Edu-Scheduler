/**
 * LecturerList — portfolio-grade lecturer grid.
 *
 * Each card shows a large photo, specialty badges with tech-brand colours,
 * a coloured glow on hover, and smooth reveal animations.
 */
import { Input } from '@/components/ui/input'
import { accentGradient, techColor } from '@/lib/ui/subjectColors'
import { cn } from '@/lib/utils'
import { selectAllLecturers } from '@/store/entitySlice'
import { useAppSelector } from '@/store/hooks'
import type { Lecturer, LecturerId } from '@/types'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

interface LecturerListProps {
	onEdit?: (l: Lecturer) => void
	onDelete?: (id: LecturerId) => void
	className?: string
}

export function LecturerList({ onEdit, onDelete, className }: LecturerListProps) {
	const lecturers = useAppSelector(selectAllLecturers)
	const [search, setSearch] = useState('')
	const [filterSpecialty, setFilterSpecialty] = useState<string | null>(null)

	const allSpecialties = useMemo(
		() => [...new Set(lecturers.flatMap(l => l.specialties))].sort(),
		[lecturers]
	)

	const filtered = useMemo(() => {
		let r = lecturers
		if (search.trim()) {
			const q = search.toLowerCase()
			r = r.filter(
				l =>
					l.name.toLowerCase().includes(q) ||
					l.surname.toLowerCase().includes(q) ||
					l.specialties.some(s => s.toLowerCase().includes(q))
			)
		}
		if (filterSpecialty) r = r.filter(l => l.specialties.includes(filterSpecialty))
		return r
	}, [lecturers, search, filterSpecialty])

	return (
		<div className={cn('flex flex-col gap-5', className)}>
			{/* ── Search bar ──────────────────────────────────────────────── */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
				<Input
					type="search"
					placeholder="Search lecturers, specialties…"
					value={search}
					onChange={e => setSearch(e.target.value)}
					aria-label="Search lecturers"
					className="pl-10 bg-white shadow-sm"
				/>
			</div>

			{/* ── Filter chips ─────────────────────────────────────────────── */}
			{allSpecialties.length > 0 && (
				<div className="flex flex-wrap gap-2" role="group" aria-label="Filter by specialty">
					<SpecialtyChip
						label="All"
						active={filterSpecialty === null}
						onClick={() => setFilterSpecialty(null)}
						colors={{
							bg: 'bg-slate-100',
							text: 'text-slate-700',
							dot: 'bg-slate-400',
						}}
					/>
					{allSpecialties.map(s => (
						<SpecialtyChip
							key={s}
							label={s}
							active={filterSpecialty === s}
							onClick={() => setFilterSpecialty(s === filterSpecialty ? null : s)}
							colors={techColor(s)}
						/>
					))}
				</div>
			)}

			{/* ── Count ────────────────────────────────────────────────────── */}
			<p className="text-sm font-medium text-gray-500" aria-live="polite">
				<span className="text-xl font-bold text-gray-900 mr-1.5 sm:text-2xl">
					{filtered.length}
				</span>
				lecturer{filtered.length !== 1 ? 's' : ''}
				{filterSpecialty && <span className="text-indigo-600 ml-1.5">· {filterSpecialty}</span>}
			</p>

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			{filtered.length === 0 ? (
				<EmptyState search={search} />
			) : (
				<div
					className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					role="list"
					aria-label="Lecturers"
				>
					{filtered.map((lecturer, i) => (
						<LecturerCard
							key={lecturer.id}
							lecturer={lecturer}
							index={i}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// ─── SpecialtyChip ────────────────────────────────────────────────────────────

function SpecialtyChip({
	label,
	active,
	onClick,
	colors,
}: {
	label: string
	active: boolean
	onClick: () => void
	colors: { bg: string; text: string; dot: string }
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
				active
					? `${colors.bg} ${colors.text} border-current shadow-sm scale-105`
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
			)}
			aria-pressed={active}
		>
			{active && <span className={cn('size-1.5 rounded-full', colors.dot)} />}
			{label}
		</button>
	)
}

// ─── LecturerCard ─────────────────────────────────────────────────────────────

interface LecturerCardProps {
	lecturer: Lecturer
	index: number
	onEdit?: (l: Lecturer) => void
	onDelete?: (id: LecturerId) => void
}

function LecturerCard({ lecturer, index, onEdit, onDelete }: LecturerCardProps) {
	const primary = lecturer.specialties[0] ?? ''
	const accent = accentGradient(primary)
	const tech = techColor(primary)
	const delay = `${(index % 8) * 50}ms`

	return (
		<article
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-2xl bg-white',
				'shadow-md transition-all duration-300',
				`hover:shadow-xl hover:-translate-y-1.5 hover:shadow-${tech.dot.replace('bg-', '')}/20`,
				'animate-fade-up border border-gray-100'
			)}
			style={{ animationDelay: delay }}
			role="listitem"
		>
			{/* ── Coloured top accent bar ──────────────────────────────── */}
			<div className={cn('h-1 w-full bg-gradient-to-r', accent)} />

			{/* ── Photo ────────────────────────────────────────────────── */}
			<div className="relative aspect-square w-full overflow-hidden bg-gray-100">
				{lecturer.imageUrl ? (
					<img
						src={lecturer.imageUrl}
						alt={`${lecturer.name} ${lecturer.surname}`}
						className="h-full w-full object-cover object-[center_15%] transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
					/>
				) : (
					<div
						className={cn(
							'flex h-full w-full items-center justify-center',
							`bg-gradient-to-br ${accent}`
						)}
					>
						<span className="select-none text-5xl font-black text-white/90 drop-shadow-lg">
							{lecturer.name[0]}
							{lecturer.surname[0]}
						</span>
					</div>
				)}

				{/* Overlay on hover */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				{/* Hover actions — float up from bottom */}
				<div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
					{onEdit && (
						<button
							onClick={() => onEdit(lecturer)}
							className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-800 shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
							aria-label={`Edit ${lecturer.name} ${lecturer.surname}`}
						>
							<Pencil className="size-3" aria-hidden />
							Edit
						</button>
					)}
					{onDelete && (
						<button
							onClick={() => onDelete(lecturer.id)}
							className="flex items-center gap-1.5 rounded-full bg-red-500/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
							aria-label={`Delete ${lecturer.name} ${lecturer.surname}`}
						>
							<Trash2 className="size-3" aria-hidden />
							Remove
						</button>
					)}
				</div>
			</div>

			{/* ── Info ─────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-3 p-4">
				<div>
					<p className="text-base font-bold leading-tight text-gray-900">
						{lecturer.name} {lecturer.surname}
					</p>
				</div>

				{/* Specialty badges with tech colours */}
				<div className="flex flex-wrap gap-1.5">
					{lecturer.specialties.map(s => {
						const c = techColor(s)
						return (
							<span
								key={s}
								className={cn(
									'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide',
									c.bg,
									c.text
								)}
							>
								<span className={cn('size-1.5 rounded-full', c.dot)} aria-hidden />
								{s}
							</span>
						)
					})}
				</div>
			</div>
		</article>
	)
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
				🔍
			</div>
			<p className="text-base font-semibold text-gray-800">
				{search ? `No results for "${search}"` : 'No lecturers yet'}
			</p>
			<p className="text-sm text-gray-500 max-w-xs">
				{search
					? 'Try a different name or specialty.'
					: 'Click "+ Add Lecturer" to add your first lecturer.'}
			</p>
		</div>
	)
}
