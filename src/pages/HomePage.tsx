import { ROUTES } from '@/lib/routes'
import { countTimetableSlots } from '@/lib/timetable'
import { cn } from '@/lib/utils'
import { selectIsDemoMode, selectUser } from '@/store/authSlice'
import { selectAllFaculties, selectAllLecturers, selectAllRooms } from '@/store/entitySlice'
import { useAppSelector } from '@/store/hooks'
import { selectHasSchedule, selectScheduleFaculties } from '@/store/scheduleSlice'
import {
	ArrowRight,
	BrainCircuit,
	DoorOpen,
	GraduationCap,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// A stat tile that links to its section. (Distinct from the static StatCard in
// components/ui — this one is a navigational Link with a hover arrow.)
function StatLinkCard({
	label,
	value,
	icon: Icon,
	to,
	gradient,
	delay = '',
}: {
	label: string
	value: number
	icon: typeof Users
	to: string
	gradient: string
	delay?: string
}) {
	return (
		<Link
			to={to}
			className={cn(
				'group relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-up',
				delay,
				gradient
			)}
			aria-label={`${value} ${label}`}
		>
			<div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10" />
			<div className="pointer-events-none absolute -right-2 -bottom-4 size-14 rounded-full bg-white/5" />
			<div className="relative flex items-start justify-between">
				<div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
					<Icon className="size-5 text-white" aria-hidden />
				</div>
				<ArrowRight className="size-4 text-white/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
			</div>
			<div className="relative mt-4">
				<p className="text-3xl font-black tabular-nums text-white tracking-tight">{value}</p>
				<p className="mt-0.5 text-sm font-semibold text-white">{label}</p>
			</div>
		</Link>
	)
}

function FeatureCard({
	icon: Icon,
	title,
	description,
	cta,
	to,
	accent,
	delay = '',
}: {
	icon: typeof BrainCircuit
	title: string
	description: string
	cta: string
	to: string
	accent: string
	delay?: string
}) {
	return (
		<Link
			to={to}
			className={cn(
				'group flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-up',
				delay
			)}
		>
			<div
				className={cn(
					'flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110',
					accent
				)}
			>
				<Icon className="size-6 text-white" aria-hidden />
			</div>
			<div>
				<h3 className="text-base font-semibold text-gray-900">{title}</h3>
				<p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
			</div>
			<div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-indigo-700 underline underline-offset-2 decoration-indigo-300 group-hover:gap-2.5 transition-all duration-200">
				{cta}
				<ArrowRight className="size-4" aria-hidden />
			</div>
		</Link>
	)
}

function TipChip({ text }: { text: string }) {
	return (
		<div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
			<Zap className="size-3" aria-hidden />
			{text}
		</div>
	)
}

export default function HomePage() {
	const lecturers = useAppSelector(selectAllLecturers)
	const rooms = useAppSelector(selectAllRooms)
	const faculties = useAppSelector(selectAllFaculties)
	const user = useAppSelector(selectUser)
	const isDemoMode = useAppSelector(selectIsDemoMode)
	const hasSchedule = useAppSelector(selectHasSchedule)
	const scheduleFaculties = useAppSelector(selectScheduleFaculties)

	const firstName = user?.name?.split(' ')[0] ?? 'there'
	const totalStudents = faculties.reduce((s, f) => s + f.students.length, 0)

	const scheduledClasses = hasSchedule ? countTimetableSlots(scheduleFaculties) : 0

	return (
		<div className="space-y-8">
			<div className="animate-fade-up">
				<div className="flex items-center gap-2 mb-2">
					<TipChip text="University Schedule Manager" />
					{hasSchedule && <TipChip text={`${scheduledClasses} classes scheduled`} />}
				</div>
				<h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
					Welcome back, <span className="gradient-text">{firstName}</span> 👋
				</h1>
				<p className="mt-2 text-base text-gray-500 max-w-lg">
					Here's your university at a glance. Manage staff, rooms, and faculties — then let the
					algorithm build a conflict-free timetable in seconds.
				</p>
			</div>

			<section aria-label="Summary statistics">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<StatLinkCard
						label="Lecturers"
						value={lecturers.length}
						icon={Users}
						to={ROUTES.lecturers}
						gradient="bg-gradient-to-br from-indigo-700 to-violet-700"
					/>
					<StatLinkCard
						label="Rooms"
						value={rooms.length}
						icon={DoorOpen}
						to={ROUTES.rooms}
						gradient="bg-gradient-to-br from-emerald-700 to-teal-700"
						delay="delay-75"
					/>
					<StatLinkCard
						label="Faculties"
						value={faculties.length}
						icon={GraduationCap}
						to={ROUTES.faculties}
						gradient="bg-gradient-to-br from-amber-700 to-orange-700"
						delay="delay-150"
					/>
					<StatLinkCard
						label="Students"
						value={totalStudents}
						icon={GraduationCap}
						to={ROUTES.faculties}
						gradient="bg-gradient-to-br from-rose-700 to-pink-700"
						delay="delay-225"
					/>
				</div>
			</section>

			{!isDemoMode && lecturers.length === 0 && rooms.length === 0 && faculties.length === 0 && (
				<div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
					<GraduationCap className="mx-auto size-10 text-gray-300 mb-4" aria-hidden />
					<h2 className="text-base font-semibold text-gray-700">Your university is empty</h2>
					<p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">
						Start by adding lecturers, rooms, and faculties — then generate your first conflict-free
						timetable.
					</p>
					<div className="mt-6 flex justify-center gap-3">
						<Link
							to={ROUTES.lecturers}
							className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
						>
							Add lecturers
						</Link>
						<Link
							to={ROUTES.rooms}
							className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Add rooms
						</Link>
					</div>
				</div>
			)}

			<div className="flex items-center gap-4 animate-fade-up delay-225">
				<div className="h-px flex-1 bg-gray-200" />
				<span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
					What you can do
				</span>
				<div className="h-px flex-1 bg-gray-200" />
			</div>

			<section aria-label="Features" className="grid gap-4 sm:grid-cols-3">
				<FeatureCard
					icon={BrainCircuit}
					title="Smart Scheduling Engine"
					description="Constraint-satisfaction solver with backtracking — places every subject in a conflict-free slot while respecting room capacity and lecturer availability."
					cta="Generate schedule"
					to={ROUTES.schedule}
					accent="bg-gradient-to-br from-indigo-500 to-violet-600"
				/>
				<FeatureCard
					icon={Sparkles}
					title="Instant, Conflict-free Results"
					description="The solver places every subject in seconds while respecting every constraint, then reports classes placed, backtracks, and any slots it couldn't fill."
					cta="See it in action"
					to={ROUTES.schedule}
					accent="bg-gradient-to-br from-violet-500 to-purple-600"
					delay="delay-75"
				/>
				<FeatureCard
					icon={TrendingUp}
					title="Drag-and-drop Editing"
					description="Fine-tune any generated schedule by dragging classes between slots. Constraint validation runs on every move. Full undo/redo history."
					cta="Open schedule"
					to={ROUTES.schedule}
					accent="bg-gradient-to-br from-blue-500 to-cyan-600"
					delay="delay-150"
				/>
			</section>

			{!hasSchedule && lecturers.length > 0 && rooms.length > 0 && faculties.length > 0 && (
				<Link
					to={ROUTES.schedule}
					className={cn(
						'group flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 shadow-lg shadow-indigo-700/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-up delay-300 sm:flex-row sm:items-center sm:justify-between'
					)}
					aria-label="Go to schedule and generate timetable"
				>
					<div className="flex items-center gap-4">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 animate-float">
							<BrainCircuit className="size-6 text-white" aria-hidden />
						</div>
						<div>
							<p className="text-base font-bold text-white">Your data is ready</p>
							<p className="text-sm text-white/70">
								{lecturers.length} lecturers · {rooms.length} rooms · {faculties.length} faculties
							</p>
						</div>
					</div>
					<div className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-white/25 sm:w-auto w-full">
						Build schedule
						<ArrowRight
							className="size-4 transition-transform group-hover:translate-x-1"
							aria-hidden
						/>
					</div>
				</Link>
			)}
		</div>
	)
}
