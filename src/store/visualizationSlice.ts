/**
 * visualizationSlice — algorithm step playback state.
 *
 * NOTE: setInterval IDs are non-serializable and must NOT live in Redux state.
 * The interval is managed entirely inside the `startPlayback` thunk and a
 * module-level variable. All other state (steps, index, speed, highlights)
 * is plain-serializable Redux state.
 */
import { collectSteps } from '@/lib/algorithm/schedulingAlgorithm'
import type {
	AlgorithmStep,
	DecisionLogEntry,
	HighlightedElement,
	PlaybackState,
	ScheduleInput,
	ScheduleResult
} from '@/types'
import {
	createAsyncThunk,
	createSlice,
	type PayloadAction
} from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './index'

// ─── State ────────────────────────────────────────────────────────────────────

interface VisualizationState {
	steps: AlgorithmStep[]
	currentStepIndex: number
	playbackState: PlaybackState
	playbackSpeed: number
	highlightedElements: HighlightedElement[]
	decisionLog: DecisionLogEntry[]
	result: ScheduleResult | null
	isLoading: boolean
}

const initialState: VisualizationState = {
	steps: [],
	currentStepIndex: -1,
	playbackState: 'idle',
	playbackSpeed: 1,
	highlightedElements: [],
	decisionLog: [],
	result: null,
	isLoading: false
}

// ─── Interval management (outside Redux — non-serializable) ───────────────────

let _intervalId: ReturnType<typeof setInterval> | null = null

function clearPlaybackInterval() {
	if (_intervalId !== null) {
		clearInterval(_intervalId)
		_intervalId = null
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractHighlights(step: AlgorithmStep): HighlightedElement[] {
	const els: HighlightedElement[] = []
	if (step.currentLecturer)
		els.push({
			type: 'lecturer',
			id: step.currentLecturer,
			style:
				step.type === 'conflict'
					? 'conflict'
					: step.type === 'assign'
						? 'success'
						: 'active'
		})
	if (step.currentRoom)
		els.push({
			type: 'room',
			id: step.currentRoom,
			style:
				step.type === 'conflict'
					? 'conflict'
					: step.type === 'assign'
						? 'success'
						: 'active'
		})
	if (step.currentFaculty)
		els.push({ type: 'faculty', id: step.currentFaculty, style: 'active' })
	if (step.currentSlot)
		els.push({
			type: 'slot',
			id: `${step.currentSlot.day}-${step.currentSlot.hour}`,
			slot: step.currentSlot,
			style:
				step.type === 'conflict'
					? 'conflict'
					: step.type === 'assign'
						? 'success'
						: 'active'
		})
	return els
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const visualizationSlice = createSlice({
	name: 'visualization',
	initialState,
	reducers: {
		_setSteps(
			state,
			action: PayloadAction<{ steps: AlgorithmStep[]; result: ScheduleResult }>
		) {
			const log: DecisionLogEntry[] = action.payload.steps.map(s => ({
				stepNumber: s.stepNumber,
				description: s.description,
				type: s.type
			}))
			state.steps = action.payload.steps
			state.result = action.payload.result
			state.decisionLog = log
			state.currentStepIndex = -1
			state.playbackState = 'idle'
			state.highlightedElements = []
			state.isLoading = false
		},

		_tick(state) {
			const nextIndex = state.currentStepIndex + 1
			if (nextIndex >= state.steps.length) {
				state.playbackState = 'complete'
				return
			}
			state.currentStepIndex = nextIndex
			state.highlightedElements = extractHighlights(state.steps[nextIndex])
		},

		pause(state) {
			clearPlaybackInterval()
			state.playbackState = 'paused'
		},

		stepForward(state) {
			if (state.currentStepIndex >= state.steps.length - 1) return
			const next = state.currentStepIndex + 1
			state.currentStepIndex = next
			state.highlightedElements = extractHighlights(state.steps[next])
			state.playbackState =
				next === state.steps.length - 1 ? 'complete' : 'paused'
		},

		stepBackward(state) {
			if (state.currentStepIndex <= 0) return
			const prev = state.currentStepIndex - 1
			state.currentStepIndex = prev
			state.highlightedElements = extractHighlights(state.steps[prev])
			state.playbackState = 'paused'
		},

		setSpeed(state, action: PayloadAction<number>) {
			state.playbackSpeed = action.payload
		},

		jumpToStep(state, action: PayloadAction<number>) {
			clearPlaybackInterval()
			const i = action.payload
			if (i < 0 || i >= state.steps.length) return
			state.currentStepIndex = i
			state.highlightedElements = extractHighlights(state.steps[i])
			state.playbackState = i === state.steps.length - 1 ? 'complete' : 'paused'
		},

		reset() {
			clearPlaybackInterval()
			return initialState
		},

		setLoading(state, action: PayloadAction<boolean>) {
			state.isLoading = action.payload
		},

		setPlaybackState(state, action: PayloadAction<PlaybackState>) {
			state.playbackState = action.payload
		}
	}
})

export const {
	pause,
	stepForward,
	stepBackward,
	setSpeed,
	jumpToStep,
	reset: resetVisualization,
	_setSteps,
	_tick,
	setLoading,
	setPlaybackState
} = visualizationSlice.actions

export default visualizationSlice.reducer

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Run algorithm synchronously, store all steps, then auto-play. */
export const startVisualization = createAsyncThunk<
	void,
	ScheduleInput,
	{ dispatch: AppDispatch; state: RootState }
>('visualization/start', (input, { dispatch }) => {
	dispatch(setLoading(true))
	const { steps, result } = collectSteps(input)
	dispatch(_setSteps({ steps, result }))

	// Auto-start playback
	setTimeout(() => dispatch(play()), 120)
})

/** Start/resume the interval-based playback. */
export function play() {
	return (dispatch: AppDispatch, getState: () => RootState) => {
		const { steps, currentStepIndex, playbackState } = getState().visualization
		if (playbackState === 'complete' || steps.length === 0) return

		// If at the end, restart from beginning
		const startIdx =
			currentStepIndex === steps.length - 1 ? -1 : currentStepIndex
		if (startIdx !== currentStepIndex) {
			dispatch(visualizationSlice.actions._tick()) // harmless if already reset
		}

		dispatch(setPlaybackState('playing'))

		clearPlaybackInterval()
		_intervalId = setInterval(() => {
			const s = getState().visualization
			if (s.currentStepIndex + 1 >= s.steps.length) {
				clearPlaybackInterval()
				dispatch(setPlaybackState('complete'))
			} else {
				dispatch(_tick())
			}
		}, 800 / getState().visualization.playbackSpeed)
	}
}

/** Update speed and restart interval if currently playing. */
export function updateSpeed(speed: number) {
	return (dispatch: AppDispatch, getState: () => RootState) => {
		dispatch(setSpeed(speed))
		if (getState().visualization.playbackState === 'playing') {
			clearPlaybackInterval()
			_intervalId = setInterval(() => {
				const s = getState().visualization
				if (s.currentStepIndex + 1 >= s.steps.length) {
					clearPlaybackInterval()
					dispatch(setPlaybackState('complete'))
				} else {
					dispatch(_tick())
				}
			}, 800 / speed)
		}
	}
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectVizSteps = (s: RootState) => s.visualization.steps
export const selectVizCurrentIndex = (s: RootState) =>
	s.visualization.currentStepIndex
export const selectVizPlaybackState = (s: RootState) =>
	s.visualization.playbackState
export const selectVizPlaybackSpeed = (s: RootState) =>
	s.visualization.playbackSpeed
export const selectVizHighlightedElements = (s: RootState) =>
	s.visualization.highlightedElements
export const selectVizDecisionLog = (s: RootState) =>
	s.visualization.decisionLog
export const selectVizResult = (s: RootState) => s.visualization.result
export const selectVizIsLoading = (s: RootState) => s.visualization.isLoading
export const selectVizCurrentStep = (s: RootState) =>
	s.visualization.currentStepIndex >= 0
		? s.visualization.steps[s.visualization.currentStepIndex]
		: null
