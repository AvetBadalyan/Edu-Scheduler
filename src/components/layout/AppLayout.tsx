/**
 * AppLayout — application shell.
 * Dark sidebar with gradient brand, glowing active nav items.
 * Mobile: collapsible drawer.
 */
import { SkipLink } from '@/components/accessibility/SkipLink'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { selectDataLoadStatus } from '@/store/appSlice'
import { logoutThunk, selectIsDemoMode, selectUser } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
	BrainCircuit,
	CalendarDays,
	DoorOpen,
	FlaskConical,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Menu,
	Users,
	X,
} from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

interface NavItem {
	to: string
	label: string
	icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
	{ to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
	{ to: ROUTES.lecturers, label: 'Lecturers', icon: Users },
	{ to: ROUTES.rooms, label: 'Rooms', icon: DoorOpen },
	{ to: ROUTES.faculties, label: 'Faculties', icon: GraduationCap },
	{ to: ROUTES.schedule, label: 'Schedule', icon: CalendarDays },
]

// Shown only in the content area while a lazy page chunk loads
function PageFallback() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center gap-3">
			<div className="size-5 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
			<span className="text-sm text-gray-500">Loading…</span>
		</div>
	)
}

// Covers the content area during the authenticated-mode initial data load,
// and offers a retry if that load failed.
function DataLoadGate({ status }: { status: 'loading' | 'error' }) {
	if (status === 'loading') {
		return (
			<div
				className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center"
				role="status"
				aria-live="polite"
			>
				<div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
				<p className="text-sm text-gray-500">Loading your workspace…</p>
			</div>
		)
	}
	return (
		<div
			className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center"
			role="alert"
		>
			<div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
				⚠️
			</div>
			<div>
				<h2 className="text-base font-semibold text-gray-900">Couldn't load your data</h2>
				<p className="mt-1 text-sm text-gray-500 max-w-sm">
					Something went wrong reaching the server. Check your connection and try again.
				</p>
			</div>
			<Button onClick={() => window.location.reload()}>Try again</Button>
		</div>
	)
}

export function AppLayout() {
	const [mobileOpen, setMobileOpen] = useState(false)
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const user = useAppSelector(selectUser)
	const isDemoMode = useAppSelector(selectIsDemoMode)
	const dataLoadStatus = useAppSelector(selectDataLoadStatus)
	const sidebarRef = useRef<HTMLElement>(null)

	// In authenticated mode the workspace data loads asynchronously. Show a
	// loading / error gate so pages don't flash a false "empty" state or strand
	// the user on an empty workspace after a fetch failure.
	const showDataGate = !isDemoMode && (dataLoadStatus === 'loading' || dataLoadStatus === 'error')

	const menuButtonRef = useRef<HTMLButtonElement>(null)

	const closeMobileMenu = () => setMobileOpen(false)

	// While the mobile drawer is open, treat it as a modal dialog:
	//   • trap Tab focus inside the drawer
	//   • close on Escape
	//   • lock body scroll so the page behind doesn't move
	//   • restore focus to the menu toggle when it closes
	useEffect(() => {
		if (!mobileOpen) return

		const drawer = sidebarRef.current
		const menuButton = menuButtonRef.current
		drawer?.focus()

		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setMobileOpen(false)
				return
			}
			if (e.key !== 'Tab' || !drawer) return
			// Keep focus within the drawer.
			const focusable = drawer.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
			)
			if (focusable.length === 0) return
			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			const active = document.activeElement
			if (e.shiftKey && (active === first || active === drawer)) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && active === last) {
				e.preventDefault()
				first.focus()
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			document.body.style.overflow = prevOverflow
			// Return focus to the control that opened the drawer.
			menuButton?.focus()
		}
	}, [mobileOpen])

	return (
		<div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
			<SkipLink />

			{/* Mobile top bar */}
			<header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden shadow-sm">
				<Brand />
				<Button
					ref={menuButtonRef}
					variant="ghost"
					size="icon"
					onClick={() => setMobileOpen(o => !o)}
					aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileOpen}
					aria-controls="app-navigation"
				>
					{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
				</Button>
			</header>

			{/* Sidebar */}
			<aside
				ref={sidebarRef}
				id="app-navigation"
				tabIndex={mobileOpen ? -1 : undefined}
				role={mobileOpen ? 'dialog' : undefined}
				aria-modal={mobileOpen ? true : undefined}
				aria-label={mobileOpen ? 'Navigation menu' : undefined}
				className={cn(
					// Dark gradient sidebar
					'flex flex-col h-screen sticky top-0 overflow-hidden',
					'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',
					// Mobile
					mobileOpen ? 'flex fixed inset-0 z-50 w-64' : 'hidden lg:flex'
				)}
			>
				{/* Brand */}
				<div className="px-5 py-6 border-b border-white/10">
					<Brand />
				</div>

				{/* Nav */}
				<nav aria-label="Primary" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
					{NAV_ITEMS.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							onClick={closeMobileMenu}
							end={to === ROUTES.dashboard}
							className={({ isActive }) =>
								cn(
									'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
									isActive
										? [
												'bg-gradient-to-r from-indigo-500/20 to-violet-500/10',
												'text-white',
												'shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]',
												'nav-active-bar',
											]
										: 'text-slate-400 hover:text-white hover:bg-white/5'
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={cn(
											'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
											isActive
												? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
												: 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
										)}
									>
										<Icon className="size-4" aria-hidden />
									</span>
									<span>{label}</span>
									{isActive && <span className="ml-auto size-1.5 rounded-full bg-indigo-400" />}
								</>
							)}
						</NavLink>
					))}
				</nav>

				{/* Footer */}
				<div className="border-t border-white/10 p-4 space-y-3">
					{/* Mode badge */}
					{isDemoMode && (
						<div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
							<FlaskConical className="size-3.5 shrink-0 text-amber-400" aria-hidden />
							<span className="text-xs font-semibold text-amber-400 tracking-wide">Demo Mode</span>
						</div>
					)}

					{/* User info */}
					<div className="flex items-center gap-3 px-1">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 text-white text-xs font-bold">
							{user?.name?.[0]?.toUpperCase() ?? 'U'}
						</div>
						<div className="min-w-0">
							<p className="truncate text-xs font-medium text-white">
								{user?.name ?? 'Demo Admin'}
							</p>
							<p className="truncate text-xs text-slate-500">
								{isDemoMode ? 'Demo session' : (user?.email ?? 'Administrator')}
							</p>
						</div>
					</div>

					{/* Exit Demo / Sign out */}
					{isDemoMode ? (
						<button
							onClick={async () => {
								await dispatch(logoutThunk())
								navigate(ROUTES.login)
							}}
							className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-400/80 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
						>
							<LogOut className="size-3.5" aria-hidden />
							Exit Demo
						</button>
					) : (
						<button
							onClick={() => {
								dispatch(logoutThunk()).then(() => navigate(ROUTES.landing))
							}}
							className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
						>
							<LogOut className="size-3.5" aria-hidden />
							Sign out
						</button>
					)}
				</div>
			</aside>

			{/* Backdrop for mobile */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setMobileOpen(false)}
					aria-hidden
				/>
			)}

			{/* Main — Suspense wraps only the page content, never the sidebar */}
			<main id="main-content" className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					{showDataGate ? (
						<DataLoadGate status={dataLoadStatus} />
					) : (
						<Suspense fallback={<PageFallback />}>
							<Outlet />
						</Suspense>
					)}
				</div>
			</main>
		</div>
	)
}

function Brand() {
	return (
		<div className="flex items-center gap-3">
			<div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
				<BrainCircuit className="size-5 text-white" aria-hidden />
			</div>
			<div className="leading-tight">
				<span className="block text-sm font-bold text-white tracking-tight">EduScheduler</span>
				<span className="block text-xs text-slate-400 font-medium tracking-widest uppercase">
					Manager
				</span>
			</div>
		</div>
	)
}
