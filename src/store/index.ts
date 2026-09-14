/**
 * Redux store — single source of truth.
 *
 * Slices:
 *   app         — application-level state (current university)
 *   auth        — session, login/logout
 *   entities    — lecturers, rooms, faculties (normalized)
 *   schedule    — timetable assignment state
 *   editHistory — undo/redo stack
 *   visualization — algorithm playback
 *   toast       — notification queue
 */
import { configureStore } from '@reduxjs/toolkit'
import appReducer from './appSlice'
import authReducer from './authSlice'
import editHistoryReducer from './editHistorySlice'
import entityReducer from './entitySlice'
import scheduleReducer from './scheduleSlice'
import toastReducer from './toastSlice'
import visualizationReducer from './visualizationSlice'

export const store = configureStore({
	reducer: {
		app: appReducer,
		auth: authReducer,
		entities: entityReducer,
		schedule: scheduleReducer,
		editHistory: editHistoryReducer,
		visualization: visualizationReducer,
		toast: toastReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			// Entities carry Date fields (createdAt/updatedAt). In demo mode these
			// are real Date objects; in authenticated mode the API returns ISO
			// strings. We accept Dates in state rather than migrating every model
			// to strings, so the serializable-check ignores the slice state paths
			// and action sub-paths that legitimately hold them.
			serializableCheck: {
				ignoredPaths: [
					'app.currentUniversity',
					'auth.user',
					'entities.lecturers.entities',
					'entities.rooms.entities',
					'entities.faculties.entities',
					'schedule.rooms',
					'schedule.lecturers',
					'schedule.faculties',
					'editHistory.edits',
				],
				// loadSchedule/setCurrentUniversity/entity actions carry Date fields
				// nested in their payloads; ignore those action sub-paths.
				ignoredActionPaths: [
					'payload.createdAt',
					'payload.updatedAt',
					'payload.state',
					'payload.rooms',
					'payload.lecturers',
					'payload.faculties',
					'meta.arg',
				],
			},
		}),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
