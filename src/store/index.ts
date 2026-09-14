/**
 * Redux store — single source of truth.
 *
 * Slices:
 *   auth        — session, login/logout
 *   entities    — lecturers, rooms, faculties (normalized)
 *   schedule    — timetable assignment state
 *   editHistory — undo/redo stack
 *   visualization — algorithm playback
 *   toast       — notification queue
 */
import { configureStore } from '@reduxjs/toolkit'
import authReducer          from './authSlice'
import entityReducer        from './entitySlice'
import scheduleReducer      from './scheduleSlice'
import editHistoryReducer   from './editHistorySlice'
import visualizationReducer from './visualizationSlice'
import toastReducer         from './toastSlice'

export const store = configureStore({
	reducer: {
		auth:          authReducer,
		entities:      entityReducer,
		schedule:      scheduleReducer,
		editHistory:   editHistoryReducer,
		visualization: visualizationReducer,
		toast:         toastReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			// Dates (createdAt, updatedAt) are non-serializable but we accept that
			// for the demo. When the backend is wired in they become ISO strings.
			serializableCheck: {
				ignoredPaths: [
					'entities.lecturers.entities',
					'entities.rooms.entities',
					'entities.faculties.entities',
					'auth.user',
				],
				ignoredActions: [
					'entities/addLecturer',
					'entities/updateLecturer',
					'entities/addRoom',
					'entities/updateRoom',
					'entities/addFaculty',
					'entities/updateFaculty',
					'auth/login/fulfilled',
					'editHistory/pushEdit',
				],
			},
		}),
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
