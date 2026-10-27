/**
 * editHistorySlice — undo/redo stack for manual schedule edits.
 * Max 50 entries. Trimmed when pushing new edits after an undo.
 */
import type { ScheduleEdit } from '@/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { resetAppState } from './resetActions'

const MAX_HISTORY_SIZE = 50

interface EditHistoryState {
	history: ScheduleEdit[]
	currentIndex: number
}

const initialEditHistory: EditHistoryState = { history: [], currentIndex: -1 }

const editHistorySlice = createSlice({
	name: 'editHistory',
	initialState: initialEditHistory,
	reducers: {
		/** Drops the whole undo/redo stack (on new/loaded/cleared schedules). */
		clearHistory(state) {
			state.history = []
			state.currentIndex = -1
		},
		pushEdit(state, action: PayloadAction<ScheduleEdit>) {
			// Discard any redo branch
			const trimmed = state.history.slice(0, state.currentIndex + 1)
			trimmed.push(action.payload)
			// Enforce max size
			if (trimmed.length > MAX_HISTORY_SIZE) {
				trimmed.splice(0, trimmed.length - MAX_HISTORY_SIZE)
			}
			state.history = trimmed
			state.currentIndex = trimmed.length - 1
		},
		// Returns the edit that was undone via a separate selector call
		undo(state) {
			if (state.currentIndex >= 0) {
				state.currentIndex -= 1
			}
		},
		redo(state) {
			if (state.currentIndex < state.history.length - 1) {
				state.currentIndex += 1
			}
		},
	},
	extraReducers: builder => {
		builder.addCase(resetAppState, () => initialEditHistory)
	},
})

export const { clearHistory, pushEdit, undo, redo } = editHistorySlice.actions
export default editHistorySlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentEdit = (s: RootState): ScheduleEdit | null =>
	s.editHistory.currentIndex >= 0 ? s.editHistory.history[s.editHistory.currentIndex] : null

export const selectNextEdit = (s: RootState): ScheduleEdit | null => {
	const next = s.editHistory.currentIndex + 1
	return next < s.editHistory.history.length ? s.editHistory.history[next] : null
}

export const selectCanUndo = (s: RootState) => s.editHistory.currentIndex >= 0
export const selectCanRedo = (s: RootState) =>
	s.editHistory.currentIndex < s.editHistory.history.length - 1
