/**
 * useToast — convenience hook wrapping the Redux toast slice.
 */
import { useAppDispatch } from '@/store/hooks'
import { addToast } from '@/store/toastSlice'

export function useToast() {
	const dispatch = useAppDispatch()

	return {
		success: (message: string) => dispatch(addToast(message, 'success')),
		error: (message: string) => dispatch(addToast(message, 'error')),
		warning: (message: string) => dispatch(addToast(message, 'warning')),
		info: (message: string) => dispatch(addToast(message, 'info')),
	}
}
