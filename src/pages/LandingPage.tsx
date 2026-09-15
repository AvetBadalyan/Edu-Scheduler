/**
 * LandingPage — public entry point for portfolio visitors.
 *
 * Two entry paths:
 *   1. "Try with Armenian Code Academy" — dispatches loginThunk with demo
 *      credentials and navigates to /dashboard (protected home).
 *   2. "Sign in / Sign up" — navigates to /login for real credentials.
 */
import { seedFaculties, seedLecturers, seedRooms } from '@/lib/seedData'
import { cn } from '@/lib/utils'
import { DEMO_CREDENTIALS, loginThunk, selectAuthLoading } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
	ArrowRight,
	BrainCircuit,
	CheckCircle2,
	ChevronRight,
	Clock,
	DoorOpen,
	GraduationCap,
	GripVertical,
	Play,
	RotateCcw,
	Sparkles,
	Users,
	Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

// ─── Feature highlight card ───────────────────────────────────────────────────

interface FeatureProps {
	icon: typeof BrainCircuit
	title: string
	description: string
	accent: string
	delay?: string
	badge?: string
}

function FeatureCard({ icon: Icon, title, description, accent, delay = '', badge }: FeatureProps) {
	return (
		<div
			className={cn(
				'group relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-up',
				delay
			)}
		>
			{badge && (
				<span className="absolute right-4 top-4 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
					{badge}
				</span>
			)}
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
				<p className="mt-1.5 text-sm leading-relaxed text-gray-500">{description}</p>
			</div>
		</div>
	)
}

// ─── Step chip (how it works section) ────────────────────────────────────────

function StepChip({ number, text }: { number: number; text: string }) {
	return (
		<div className="flex items-center gap-3">
			<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-sm font-bold text-white">
				{number}
			</span>
			<span className="text-sm font-medium text-white/90">{text}</span>
		</div>
	)
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: typeof Users
	label: string
	value: string
	color: string
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
			<span className={cn('flex size-9 items-center justify-center rounded-lg', color)}>
				<Icon className="size-4 text-white" aria-hidden />
			</span>
			<div>
				<p className="text-xs text-gray-500">{label}</p>
				<p className="text-sm font-bold text-gray-900">{value}</p>
			</div>
		</div>
	)
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const isBusy = useAppSelector(selectAuthLoading)

	async function handleDemoClick() {
		const result = await dispatch(loginThunk(DEMO_CREDENTIALS))
		if (loginThunk.fulfilled.match(result)) {
			navigate('/dashboard', { replace: true })
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
			{/* ── Nav bar ─────────────────────────────────────────────────────── */}
			<header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-2.5">
						<span className="flex size-8 items-center justify-center rounded-lg bg-indigo-700 text-white">
							<BrainCircuit className="size-4" aria-hidden />
						</span>
						<span className="text-sm font-bold text-gray-900 tracking-tight">EduScheduler</span>
					</div>
					<nav aria-label="Site navigation" className="flex items-center gap-2">
						<Link
							to="/login"
							className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-700"
						>
							Sign in
						</Link>
						<button
							onClick={handleDemoClick}
							disabled={isBusy}
							className="rounded-lg bg-indigo-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-60"
						>
							Try demo
						</button>
					</nav>
				</div>
			</header>

			<main id="main-content">
				{/* ── Hero ──────────────────────────────────────────────────────── */}
				<section
					aria-labelledby="hero-heading"
					className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 text-center"
				>
					{/* eyebrow */}
					<div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
						<Zap className="size-3.5" aria-hidden />
						Constraint-satisfaction scheduling with drag-and-drop editing
					</div>

					<h1
						id="hero-heading"
						className="animate-fade-up delay-75 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
					>
						University schedules, <span className="gradient-text">solved automatically</span>
					</h1>

					<p className="animate-fade-up delay-150 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
						Add your lecturers, rooms, and faculties. The backtracking CSP solver finds a
						conflict-free timetable in seconds — then drag any class to fine-tune it.
					</p>

					{/* CTA buttons */}
					<div className="animate-fade-up delay-225 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<button
							onClick={handleDemoClick}
							disabled={isBusy}
							aria-label="Try the demo with Armenian Code Academy data"
							className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-700/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-700/40 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
						>
							<span
								className={cn(
									'flex size-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:scale-110',
									{ 'animate-float': !isBusy }
								)}
							>
								{isBusy ? (
									<span
										className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent"
										aria-hidden
									/>
								) : (
									<Play className="size-3 fill-white text-white" aria-hidden />
								)}
							</span>
							{isBusy ? 'Loading demo…' : 'Try with Armenian Code Academy'}
							{!isBusy && (
								<ChevronRight
									className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
									aria-hidden
								/>
							)}
						</button>

						<Link
							to="/login"
							className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md"
						>
							Sign up / Sign in
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</div>

					{/* trust line */}
					<p className="animate-fade-up delay-300 mt-5 text-xs text-gray-400">
						No sign-up required for the demo · Data never leaves your browser
					</p>

					{/* demo data stats */}
					<div className="animate-fade-up delay-300 mt-10 flex flex-wrap justify-center gap-3">
						<StatPill
							icon={Users}
							label="Lecturers"
							value={`${seedLecturers.length} lecturers`}
							color="bg-indigo-600"
						/>
						<StatPill
							icon={DoorOpen}
							label="Classrooms"
							value={`${seedRooms.length} rooms`}
							color="bg-emerald-600"
						/>
						<StatPill
							icon={GraduationCap}
							label="Faculties"
							value={`${seedFaculties.length} departments`}
							color="bg-amber-600"
						/>
					</div>
				</section>

				{/* ── Simulated timetable preview ──────────────────────────────── */}
				<section aria-label="Timetable preview" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
					<div className="relative rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-800 p-1 shadow-2xl shadow-indigo-900/40">
						<div className="rounded-[calc(1.5rem-1px)] bg-gray-950/90 p-4 sm:p-6">
							{/* window chrome */}
							<div className="mb-4 flex items-center gap-2">
								<span className="size-3 rounded-full bg-red-500/70" />
								<span className="size-3 rounded-full bg-amber-500/70" />
								<span className="size-3 rounded-full bg-green-500/70" />
								<span className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-white/30">
									EduScheduler — Generated Timetable
								</span>
							</div>

							{/* mini timetable */}
							<div className="overflow-x-auto">
								<table className="w-full text-xs">
									<thead>
										<tr>
											<th className="w-16 py-2 text-left text-white/40 font-medium pl-2">Hour</th>
											{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
												<th key={d} className="py-2 text-center font-medium text-white/50">
													{d}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{[
											{
												hour: '09:00',
												cells: ['JavaScript', '', 'Python', 'React', ''],
											},
											{
												hour: '10:00',
												cells: ['', 'Algorithms', 'React', '', 'JavaScript'],
											},
											{
												hour: '11:00',
												cells: ['Python', 'JavaScript', '', 'Algorithms', 'Python'],
											},
											{
												hour: '12:00',
												cells: ['React', '', 'JavaScript', '', 'Algorithms'],
											},
										].map(({ hour, cells }, ri) => (
											<tr key={hour}>
												<td className="py-1.5 pl-2 text-white/30 font-mono">{hour}</td>
												{cells.map((c, ci) => (
													<td key={ci} className="px-1 py-1.5">
														{c ? (
															<div
																className={cn(
																	'rounded-lg px-2 py-1.5 text-center font-medium',
																	(ri + ci) % 3 === 0
																		? 'bg-indigo-500/20 text-indigo-300'
																		: (ri + ci) % 3 === 1
																			? 'bg-violet-500/20 text-violet-300'
																			: 'bg-cyan-500/20 text-cyan-300'
																)}
															>
																{c}
															</div>
														) : (
															<div className="rounded-lg border border-white/5 px-2 py-1.5 text-center text-white/10">
																—
															</div>
														)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* playback controls mock */}
							<div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5">
								<RotateCcw className="size-4 text-white/30" aria-hidden />
								<button
									aria-label="Generate schedule"
									className="flex size-7 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
									onClick={handleDemoClick}
								>
									<Play className="size-3.5 fill-white text-white ml-0.5" aria-hidden />
								</button>
								<div className="flex-1 rounded-full bg-white/10 h-1.5 overflow-hidden">
									<div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
								</div>
								<span className="text-xs font-mono text-white/40">48 classes · 0 conflicts</span>
							</div>
						</div>
					</div>
				</section>

				{/* ── Feature highlights ───────────────────────────────────────── */}
				<section
					aria-labelledby="features-heading"
					className="mx-auto max-w-6xl px-4 pb-20 sm:px-6"
				>
					<div className="mb-10 text-center animate-fade-up">
						<h2
							id="features-heading"
							className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl"
						>
							Built to impress, designed to work
						</h2>
						<p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto">
							Every feature was designed to showcase real engineering depth — not just a pretty UI.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							icon={BrainCircuit}
							title="Backtracking CSP Solver"
							description="A full constraint-satisfaction algorithm with most-constrained-first heuristics, even-distribution sorting, and up to 10 000 backtracks."
							accent="bg-gradient-to-br from-indigo-500 to-violet-600"
							badge="Core algorithm"
						/>
						<FeatureCard
							icon={Sparkles}
							title="Transparent Results"
							description="Every run reports classes placed, backtracks taken, and any constraints it couldn't satisfy — so you always know how the schedule was built."
							accent="bg-gradient-to-br from-violet-500 to-purple-600"
							delay="delay-75"
							badge="At a glance"
						/>
						<FeatureCard
							icon={GripVertical}
							title="Drag-and-Drop Editing"
							description="Fine-tune any generated schedule by dragging classes between slots. Constraint validation runs on every drop."
							accent="bg-gradient-to-br from-blue-500 to-cyan-600"
							delay="delay-150"
						/>
						<FeatureCard
							icon={RotateCcw}
							title="Undo / Redo History"
							description="Full edit history with up to 50 entries. Keyboard shortcuts (Ctrl+Z / Ctrl+Y) and toolbar buttons."
							accent="bg-gradient-to-br from-emerald-500 to-teal-600"
							delay="delay-75"
						/>
						<FeatureCard
							icon={Clock}
							title="Real-time Constraint Checking"
							description="Every slot move is validated against three timetables simultaneously: lecturer, room, and faculty."
							accent="bg-gradient-to-br from-amber-500 to-orange-600"
							delay="delay-150"
						/>
						<FeatureCard
							icon={CheckCircle2}
							title="Clean Architecture"
							description="React 19, TypeScript strict mode, Redux Toolkit with entity adapters, and well-documented code throughout."
							accent="bg-gradient-to-br from-rose-500 to-pink-600"
							delay="delay-225"
						/>
					</div>
				</section>

				{/* ── How it works ─────────────────────────────────────────────── */}
				<section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
					<div className="grid gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-800 to-indigo-900 p-8 shadow-2xl shadow-indigo-900/40 sm:p-12 lg:grid-cols-2 lg:items-center">
						<div>
							<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
								<Zap className="size-3" aria-hidden />
								Demo walkthrough
							</div>
							<h2
								id="how-heading"
								className="text-2xl font-black tracking-tight text-white sm:text-3xl"
							>
								From zero to schedule in 30 seconds
							</h2>
							<p className="mt-3 text-sm leading-relaxed text-white/70">
								The Armenian Code Academy demo ships with real curriculum data — lecturers, rooms,
								and faculty syllabuses already configured. Just click and watch.
							</p>
							<button
								onClick={handleDemoClick}
								disabled={isBusy}
								className="mt-8 group inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-all duration-200 hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
							>
								{isBusy ? (
									'Loading…'
								) : (
									<>
										Try it now{' '}
										<ArrowRight
											className="size-4 transition-transform group-hover:translate-x-0.5"
											aria-hidden
										/>
									</>
								)}
							</button>
						</div>

						<div className="flex flex-col gap-3">
							<StepChip
								number={1}
								text="Land on the dashboard with 12 lecturers, 8 rooms and 4 faculties pre-loaded"
							/>
							<div className="ml-4 w-0.5 h-3 bg-white/20 rounded-full" />
							<StepChip
								number={2}
								text='Click "Generate schedule" — the CSP solver builds a conflict-free timetable in seconds'
							/>
							<div className="ml-4 w-0.5 h-3 bg-white/20 rounded-full" />
							<StepChip
								number={3}
								text="Review the result stats — classes placed, backtracks taken, and any unresolved slots"
							/>
							<div className="ml-4 w-0.5 h-3 bg-white/20 rounded-full" />
							<StepChip
								number={4}
								text="Drag a class to a different slot and see constraint validation fire instantly"
							/>
							<div className="ml-4 w-0.5 h-3 bg-white/20 rounded-full" />
							<StepChip
								number={5}
								text="Press Ctrl+Z to undo the move and restore the original placement"
							/>
						</div>
					</div>
				</section>
			</main>

			{/* ── Footer ───────────────────────────────────────────────────────── */}
			<footer className="border-t border-gray-100 bg-white py-8">
				<div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
					<div className="flex items-center gap-2">
						<span className="flex size-6 items-center justify-center rounded-md bg-indigo-700">
							<BrainCircuit className="size-3.5 text-white" aria-hidden />
						</span>
						<span className="text-sm font-bold text-gray-900">EduScheduler</span>
					</div>
					<p className="text-xs text-gray-400">
						Portfolio project · React 19, TypeScript, Tailwind CSS, Redux Toolkit, Vite
					</p>
					<Link
						to="/login"
						className="text-xs font-medium text-indigo-700 hover:underline underline-offset-2"
					>
						Sign in →
					</Link>
				</div>
			</footer>
		</div>
	)
}
