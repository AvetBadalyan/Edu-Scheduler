/**
 * appSlice — application-level state.
 *
 * Holds the current university context. In demo mode this is pre-populated
 * with the seed university; in authenticated mode it is set after the user
 * authenticates and their university is fetched from the API.
 */
import type { University } from '@/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
	currentUniversity: University | null
}

const initialState: AppState = {
	currentUniversity: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setCurrentUniversity(state, action: PayloadAction<University | null>) {
			state.currentUniversity = action.payload
		},
	},
})

export const { setCurrentUniversity } = appSlice.actions
export default appSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentUniversity = (s: RootState) => s.app.currentUniversity
