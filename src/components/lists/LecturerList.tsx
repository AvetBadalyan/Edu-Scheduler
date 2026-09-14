/**
 * LecturerList — portfolio-grade lecturer grid.
 *
 * Each card shows a large photo, specialty badges with tech-brand colours,
 * a coloured glow on hover, and smooth reveal animations.
 */
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectAllLecturers } from '@/store/entitySlice'
import type { Lecturer, LecturerId } from '@/types'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

// ─── Tech-brand colours per specialty ────────────────────────────────────────

const TECH_COLORS: Record<string, { bg: string; text: string; glow: string; dot: string }> = {
	JavaScript: {
		bg: 'bg-yellow-400/15',
		text: 'text-yellow-700',
		glow: 'shadow-yellow-400/30',
		dot: 'bg-yellow-400',
	},
	TypeScript: {
		bg: 'bg-blue-500/15',
		text: 'text-blue-700',
		glow: 'shadow-blue-500/30',
		dot: 'bg-blue-500',
	},
	ReactJS: {
		bg: 'bg-cyan-400/15',
		text: 'text-cyan-700',
		glow: 'shadow-cyan-400/30',
		dot: 'bg-cyan-400',
	},
	NodeJS: {
		bg: 'bg-green-500/15',
		text: 'text-green-700',
		glow: 'shadow-green-500/30',
		dot: 'bg-green-500',
	},
	Java: {
		bg: 'bg-orange-500/15',
		text: 'text-orange-700',
		glow: 'shadow-orange-500/30',
		dot: 'bg-orange-500',
	},
	Python: {
		bg: 'bg-sky-500/15',
		text: 'text-sky-700',
		glow: 'shadow-sky-500/30',
		dot: 'bg-sky-500',
	},
	CSS: {
		bg: 'bg-violet-500/15',
		text: 'text-violet-700',
		glow: 'shadow-violet-500/30',
		dot: 'bg-violet-500',
	},
	HTML: {
		bg: 'bg-rose-500/15',
		text: 'text-rose-700',
		glow: 'shadow-rose-500/30',
		dot: 'bg-rose-500',
	},
	'UI/UX': {
		bg: 'bg-fuchsia-500/15',
		text: 'text-fuchsia-700',
		glow: 'shadow-fuchsia-500/30',
		dot: 'bg-fuchsia-500',
	},
	'Project Management': {
		bg: 'bg-teal-500/15',
		text: 'text-teal-700',
		glow: 'shadow-teal-500/30',
		dot: 'bg-teal-500',
	},
}

const DEFAULT_TECH = {
	bg: 'bg-slate-400/15',
	text: 'text-slate-700',
	glow: 'shadow-slate-400/30',
	dot: 'bg-slate-400',
}

// Primary specialty → card accent gradient
const ACCENT_GRADIENTS: Record<string, string> = {
	JavaScript: 'from-yellow-400 to-amber-500',
	TypeScript: 'from-blue-500 to-indigo-600',
	ReactJS: 'from-cyan-400 to-blue-500',
	NodeJS: 'from-green-500 to-emerald-600',
	Java: 'from-orange-500 to-red-600',
	Python: 'from-sky-400 to-blue-600',
	CSS: 'from-violet-500 to-purple-600',
	HTML: 'from-rose-500 to-orange-600',
	'UI/UX': 'from-fuchsia-500 to-pink-600',
	'Project Management': 'from-teal-500 to-cyan-600',
}

const DEFAULT_GRADIENT = 'from-slate-500 to-slate-600'

interface LecturerListProps {
	onSelect?: (l: Lecturer) => void
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
							colors={TECH_COLORS[s] ?? DEFAULT_TECH}
						/>
					))}
				</div>
			)}

			{/* ── Count ────────────────────────────────────────────────────── */}
			<p className="text-sm font-medium text-gray-500" aria-live="polite">
				<span className="text-2xl font-bold text-gray-900 mr-1.5">{filtered.length}</span>
				lecturer{filtered.length !== 1 ? 's' : ''}
				{filterSpecialty && <span className="text-indigo-600 ml-1.5">· {filterSpecialty}</span>}
			</p>

			{/* ── Grid ─────────────────────────────────────────────────────── */}
			{filtered.length === 0 ? (
				<EmptyState search={search} />
			) : (
				<div
					className="grid gap-5"
					style={{
						gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
					}}
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
	const accent = ACCENT_GRADIENTS[primary] ?? DEFAULT_GRADIENT
	const tech = TECH_COLORS[primary] ?? DEFAULT_TECH
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
						const c = TECH_COLORS[s] ?? DEFAULT_TECH
						return (
							<span
								key={s}
								className={cn(
									'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide',
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

export default LecturerList
