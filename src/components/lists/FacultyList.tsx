/**
 * FacultyList — rich faculty cards replacing the plain text rows.
 *
 * Each faculty gets a coloured gradient banner, a subject tag cloud
 * with colour-coded pills, a student count badge, sortable/searchable
 * controls and smooth hover animations.
 */
import { useAppSelector } from '@/store/hooks'
import { selectAllFaculties } from '@/store/entitySlice'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Faculty, FacultyId } from '@/types'
import { BookOpen, GraduationCap, Pencil, Search, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

// ─── Per-faculty gradient palette (cycles through 6) ─────────────────────────

const CARD_PALETTES = [
	{
		gradient: 'from-indigo-500 to-violet-600',
		light: 'bg-indigo-50',
		text: 'text-indigo-700',
		ring: 'hover:ring-indigo-200',
	},
	{
		gradient: 'from-emerald-500 to-teal-600',
		light: 'bg-emerald-50',
		text: 'text-emerald-700',
		ring: 'hover:ring-emerald-200',
	},
	{
		gradient: 'from-amber-500 to-orange-600',
		light: 'bg-amber-50',
		text: 'text-amber-700',
		ring: 'hover:ring-amber-200',
	},
	{
		gradient: 'from-rose-500 to-pink-600',
		light: 'bg-rose-50',
		text: 'text-rose-700',
		ring: 'hover:ring-rose-200',
	},
	{
		gradient: 'from-sky-500 to-blue-600',
		light: 'bg-sky-50',
		text: 'text-sky-700',
		ring: 'hover:ring-sky-200',
	},
	{
		gradient: 'from-fuchsia-500 to-purple-600',
		light: 'bg-fuchsia-50',
		text: 'text-fuchsia-700',
		ring: 'hover:ring-fuchsia-200',
	},
]

// Subject → colour mapping so the same subject always gets the same colour
const SUBJECT_COLORS: Record<string, string> = {
	JavaScript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	TypeScript: 'bg-blue-100 text-blue-800 border-blue-200',
	ReactJS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
	NodeJS: 'bg-green-100 text-green-800 border-green-200',
	Java: 'bg-orange-100 text-orange-800 border-orange-200',
	Python: 'bg-sky-100 text-sky-800 border-sky-200',
	CSS: 'bg-violet-100 text-violet-800 border-violet-200',
	HTML: 'bg-rose-100 text-rose-800 border-rose-200',
	'UI/UX': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
	'Project Management': 'bg-teal-100 text-teal-800 border-teal-200',
	Node: 'bg-green-100 text-green-800 border-green-200',
}
const DEFAULT_SUBJECT = 'bg-slate-100 text-slate-700 border-slate-200'

function subjectColor(s: string) {
	return SUBJECT_COLORS[s] ?? DEFAULT_SUBJECT
}

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortKey = 'name' | 'students' | 'subjects'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
	{ key: 'name', label: 'A – Z' },
	{ key: 'students', label: 'Students' },
	{ key: 'subjects', label: 'Subjects' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface FacultyListProps {
	onSelect?: (f: Faculty) => void
	onEdit?: (f: Faculty) => void
	onDelete?: (id: FacultyId) => void
	className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FacultyList({ onEdit, onDelete, className }: FacultyListProps) {
	const faculties = useAppSelector(selectAllFaculties)
	const [search, setSearch] = useState('')
	const [sort, setSort] = useState<SortKey>('name')

	const filtered = useMemo(() => {
		let r = [...faculties]
		if (search.trim()) {
			const q = search.toLowerCase()
			r = r.filter(
				f =>
					f.name.toLowerCase().includes(q) ||
					f.syllabus.some(e => e.subject.toLowerCase().includes(q))
			)
		}
		r.sort((a, b) => {
			if (sort === 'name') return a.name.localeCompare(b.name)
			if (sort === 'students') return b.students.length - a.students.length
			return b.syllabus.length - a.syllabus.length
		})
		return r
	}, [faculties, search, sort])

	const totalStudents = faculties.reduce((s, f) => s + f.students.length, 0)

	if (faculties.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
					🎓
				</div>
				<p className="text-base font-semibold text-gray-800">No faculties yet</p>
				<p className="text-sm text-gray-500 max-w-xs">
					Click "+ Add Faculty" to create your first bootcamp or course.
				</p>
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col gap-6', className)}>
			{/* ── Summary bar ────────────────────────────────────────────────── */}
			<div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
				{[
					{
						icon: GraduationCap,
						label: 'Faculties',
						value: faculties.length,
						color: 'from-indigo-500 to-violet-600',
					},
					{
						icon: Users,
						label: 'Total Students',
						value: totalStudents,
						color: 'from-emerald-500 to-teal-600',
					},
					{
						icon: BookOpen,
						label: 'Avg. Subjects',
						value: faculties.length
							? Math.round(faculties.reduce((s, f) => s + f.syllabus.length, 0) / faculties.length)
							: 0,
						color: 'from-amber-500 to-orange-600',
					},
				].map(({ icon: Icon, label, value, color }) => (
					<div
						key={label}
						className={cn(
							'flex flex-col gap-1 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-md',
							color
						)}
					>
						<Icon className="size-5 opacity-80" aria-hidden />
						<p className="text-2xl font-black tabular-nums">{value}</p>
						<p className="text-xs font-semibold opacity-80">{label}</p>
					</div>
				))}
			</div>

			{/* ── Controls ───────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
					<Input
						type="search"
						placeholder="Search faculties or subjects…"
						value={search}
						onChange={e => setSearch(e.target.value)}
						aria-label="Search faculties"
						className="pl-10 bg-white shadow-sm"
					/>
				</div>
				<div className="flex items-center gap-1.5" role="group" aria-label="Sort by">
					<span className="text-xs font-medium text-gray-500 mr-1">Sort:</span>
					{SORT_OPTIONS.map(o => (
						<button
							key={o.key}
							onClick={() => setSort(o.key)}
							className={cn(
								'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
								sort === o.key
									? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
									: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
							)}
							aria-pressed={sort === o.key}
						>
							{o.label}
						</button>
					))}
				</div>
			</div>

			{/* ── Count ──────────────────────────────────────────────────────── */}
			<p className="text-sm font-medium text-gray-500" aria-live="polite">
				<span className="text-2xl font-bold text-gray-900 mr-1.5">{filtered.length}</span>
				{filtered.length === 1 ? 'faculty' : 'faculties'}
			</p>

			{/* ── Cards grid ─────────────────────────────────────────────────── */}
			{filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
					<p className="text-base font-semibold text-gray-700">No results for "{search}"</p>
					<p className="text-sm text-gray-500">Try a different faculty name or subject.</p>
				</div>
			) : (
				<div
					className="grid gap-5"
					style={{
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
					}}
					role="list"
					aria-label="Faculties"
				>
					{filtered.map((faculty, i) => (
						<FacultyCard
							key={faculty.id}
							faculty={faculty}
							palette={CARD_PALETTES[i % CARD_PALETTES.length]}
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

// ─── FacultyCard ──────────────────────────────────────────────────────────────

interface FacultyCardProps {
	faculty: Faculty
	palette: (typeof CARD_PALETTES)[0]
	index: number
	onEdit?: (f: Faculty) => void
	onDelete?: (id: FacultyId) => void
}

function FacultyCard({ faculty, palette, index, onEdit, onDelete }: FacultyCardProps) {
	const delay = `${(index % 6) * 60}ms`
	const totalHours = faculty.syllabus.reduce((s, e) => s + e.requiredHours, 0)

	return (
		<article
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-2xl bg-white',
				'border border-gray-100 shadow-md ring-2 ring-transparent transition-all duration-300',
				'hover:-translate-y-1.5 hover:shadow-xl',
				palette.ring,
				'animate-fade-up'
			)}
			style={{ animationDelay: delay }}
			role="listitem"
		>
			{/* ── Gradient banner ─────────────────────────────────────────── */}
			<div className={cn('relative h-20 bg-gradient-to-br', palette.gradient)}>
				{/* Decorative shapes */}
				<div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/10" />
				<div className="absolute right-12 bottom-0 size-12 rounded-full bg-white/10" />

				{/* Faculty name inside the banner */}
				<div className="absolute inset-0 flex items-end p-4">
					<h3 className="text-lg font-black leading-tight text-white drop-shadow-sm">
						{faculty.name}
					</h3>
				</div>

				{/* Student badge — top right */}
				<div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
					<Users className="size-3" aria-hidden />
					{faculty.students.length}
				</div>
			</div>

			{/* ── Body ────────────────────────────────────────────────────── */}
			<div className="flex flex-1 flex-col gap-4 p-4">
				{/* Stats row */}
				<div className="flex gap-4 text-center">
					<div className={cn('flex-1 rounded-xl p-2', palette.light)}>
						<p className={cn('text-xl font-black', palette.text)}>{faculty.syllabus.length}</p>
						<p className="text-[10px] font-semibold text-gray-500">Subjects</p>
					</div>
					<div className={cn('flex-1 rounded-xl p-2', palette.light)}>
						<p className={cn('text-xl font-black', palette.text)}>{totalHours}</p>
						<p className="text-[10px] font-semibold text-gray-500">Total hrs</p>
					</div>
					<div className={cn('flex-1 rounded-xl p-2', palette.light)}>
						<p className={cn('text-xl font-black', palette.text)}>{faculty.students.length}</p>
						<p className="text-[10px] font-semibold text-gray-500">Students</p>
					</div>
				</div>

				{/* Subject pills */}
				<div className="flex flex-wrap gap-1.5">
					{faculty.syllabus.map(entry => (
						<span
							key={entry.subject}
							className={cn(
								'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold',
								subjectColor(entry.subject)
							)}
						>
							{entry.subject}
							<span className="ml-0.5 opacity-60">·{entry.requiredHours}h</span>
						</span>
					))}
				</div>

				{/* Actions */}
				<div className="mt-auto flex gap-2 pt-1">
					{onEdit && (
						<button
							onClick={() => onEdit(faculty)}
							className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
							aria-label={`Edit ${faculty.name}`}
						>
							<Pencil className="size-3" aria-hidden />
							Edit
						</button>
					)}
					{onDelete && (
						<button
							onClick={() => onDelete(faculty.id)}
							className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
							aria-label={`Delete ${faculty.name}`}
						>
							<Trash2 className="size-3.5" aria-hidden />
						</button>
					)}
				</div>
			</div>
		</article>
	)
}

export default FacultyList
