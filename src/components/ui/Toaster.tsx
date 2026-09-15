import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { dismissToast, selectToasts } from '@/store/toastSlice'

const VARIANT_STYLES = {
	success: 'bg-green-50 border-green-300 text-green-800',
	error: 'bg-red-50 border-red-300 text-red-800',
	warning: 'bg-amber-50 border-amber-300 text-amber-800',
	info: 'bg-blue-50 border-blue-300 text-blue-800',
}
const VARIANT_ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

export function Toaster() {
	const dispatch = useAppDispatch()
	const toasts = useAppSelector(selectToasts)

	return (
		<div
			className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full"
			role="region"
			aria-label="Notifications"
			aria-live="polite"
		>
			{toasts.map(toast => (
				<div
					key={toast.id}
					className={cn(
						'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
						VARIANT_STYLES[toast.variant]
					)}
					role="alert"
				>
					<span className="text-sm font-medium" aria-hidden>
						{VARIANT_ICONS[toast.variant]}
					</span>
					<p className="text-sm flex-1">{toast.message}</p>
					<button
						onClick={() => dispatch(dismissToast(toast.id))}
						className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-1"
						aria-label="Dismiss notification"
					>
						✕
					</button>
				</div>
			))}
		</div>
	)
}
