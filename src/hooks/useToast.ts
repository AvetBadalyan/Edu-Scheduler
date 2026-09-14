/**
 * useToast — convenience hook wrapping the Redux toast slice.
 */
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
	addToast,
	dismissAll,
	dismissToast,
	selectToasts,
	type ToastVariant
} from '@/store/toastSlice'

export type { ToastVariant }

export function useToast() {
	const dispatch = useAppDispatch()
	const toasts = useAppSelector(selectToasts)

	return {
		toasts,
		toast: (
			message: string,
			variant: ToastVariant = 'info',
			duration?: number
		) => dispatch(addToast(message, variant, duration)),
		success: (message: string) => dispatch(addToast(message, 'success')),
		error: (message: string) => dispatch(addToast(message, 'error')),
		warning: (message: string) => dispatch(addToast(message, 'warning')),
		info: (message: string) => dispatch(addToast(message, 'info')),
		dismiss: (id: string) => dispatch(dismissToast(id)),
		dismissAll: () => dispatch(dismissAll())
	}
}
