/**
 * toastSlice — notification queue.
 * Auto-dismiss is handled by a thunk so the reducer stays pure.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './index'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
	id: string
	message: string
	variant: ToastVariant
}

const toastSlice = createSlice({
	name: 'toast',
	initialState: { toasts: [] as ToastItem[] },
	reducers: {
		_addToast(state, action: PayloadAction<ToastItem>) {
			state.toasts.push(action.payload)
		},
		dismissToast(state, action: PayloadAction<string>) {
			state.toasts = state.toasts.filter(t => t.id !== action.payload)
		},
	},
})

export const { dismissToast } = toastSlice.actions
export default toastSlice.reducer

// ─── Thunk — add with auto-dismiss ───────────────────────────────────────────

export function addToast(message: string, variant: ToastVariant = 'info', duration = 4000) {
	return (dispatch: AppDispatch) => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
		dispatch(toastSlice.actions._addToast({ id, message, variant }))
		setTimeout(() => dispatch(dismissToast(id)), duration)
	}
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectToasts = (s: RootState) => s.toast.toasts
