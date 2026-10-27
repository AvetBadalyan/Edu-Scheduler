/**
 * useToast — convenience hook wrapping the Redux toast slice.
 */
import { useAppDispatch } from '@/store/hooks'
import { addToast } from '@/store/toastSlice'
import { useMemo } from 'react'

export function useToast() {
	const dispatch = useAppDispatch()

	// Memoize so the returned object keeps a stable identity across renders.
	// Consumers list `toast` in effect dependency arrays; an unstable reference
	// would otherwise re-run those effects on every render.
	return useMemo(
		() => ({
			success: (message: string) => dispatch(addToast(message, 'success')),
			error: (message: string) => dispatch(addToast(message, 'error')),
			warning: (message: string) => dispatch(addToast(message, 'warning')),
			info: (message: string) => dispatch(addToast(message, 'info')),
		}),
		[dispatch]
	)
}
