/**
 * useToast — toast notification system.
 *
 * Provides a simple toast queue backed by a Zustand store.
 * Requirements: 14.1
 */
import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: string
	message: string
	variant: ToastVariant
	duration?: number
}

interface ToastStore {
	toasts: Toast[]
	add: (toast: Omit<Toast, 'id'>) => string
	dismiss: (id: string) => void
	dismissAll: () => void
}

export const useToastStore = create<ToastStore>(set => ({
	toasts: [],

	add: toast => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
		const duration = toast.duration ?? 4000

		set(state => ({
			toasts: [...state.toasts, { ...toast, id }]
		}))

		// Auto-dismiss
		setTimeout(() => {
			set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
		}, duration)

		return id
	},

	dismiss: id =>
		set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
	dismissAll: () => set({ toasts: [] })
}))

/**
 * Hook to use the toast system from any component.
 */
export function useToast() {
	const { add, dismiss, dismissAll } = useToastStore()

	return {
		toast: (
			message: string,
			variant: ToastVariant = 'info',
			duration?: number
		) => add({ message, variant, duration }),
		success: (message: string) => add({ message, variant: 'success' }),
		error: (message: string) => add({ message, variant: 'error' }),
		warning: (message: string) => add({ message, variant: 'warning' }),
		info: (message: string) => add({ message, variant: 'info' }),
		dismiss,
		dismissAll
	}
}
