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
import { resetAppState } from './resetActions'

// ─── State ────────────────────────────────────────────────────────────────────

/** Status of the authenticated-mode initial data load. */
export type DataLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface AppState {
	currentUniversity: University | null
	dataLoadStatus: DataLoadStatus
}

const initialState: AppState = {
	currentUniversity: null,
	dataLoadStatus: 'idle',
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setCurrentUniversity(state, action: PayloadAction<University | null>) {
			state.currentUniversity = action.payload
		},
		setDataLoadStatus(state, action: PayloadAction<DataLoadStatus>) {
			state.dataLoadStatus = action.payload
		},
	},
	extraReducers: builder => {
		builder.addCase(resetAppState, () => initialState)
	},
})

export const { setCurrentUniversity, setDataLoadStatus } = appSlice.actions
export default appSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCurrentUniversity = (s: RootState) => s.app.currentUniversity
export const selectDataLoadStatus = (s: RootState) => s.app.dataLoadStatus
