/**
 * entitySlice — lecturers, rooms and faculties (master data).
 *
 * Sync actions (addLecturer, etc.) work in demo mode (in-memory only).
 * Async thunks (addLecturerThunk, etc.) are mode-aware:
 *   - demo mode  → dispatch sync action directly
 *   - auth mode  → call API, then upsert the server-returned entity
 */
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type {
  CreateFacultyInput,
  CreateLecturerInput,
  CreateRoomInput,
  Faculty,
  Lecturer,
  Room,
  UpdateFacultyInput,
  UpdateLecturerInput,
  UpdateRoomInput,
} from '@/types'
import { lecturersApi } from '@/lib/api/lecturers'
import { roomsApi }     from '@/lib/api/rooms'
import { facultiesApi } from '@/lib/api/faculties'
import type { RootState } from './index'

// ─── ID generator ─────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ─── Entity adapters ──────────────────────────────────────────────────────────

const lecturersAdapter = createEntityAdapter<Lecturer>()
const roomsAdapter     = createEntityAdapter<Room>()
const facultiesAdapter = createEntityAdapter<Faculty>()

// ─── Slice ────────────────────────────────────────────────────────────────────

const entitySlice = createSlice({
  name: 'entities',
  initialState: {
    lecturers: lecturersAdapter.getInitialState(),
    rooms:     roomsAdapter.getInitialState(),
    faculties: facultiesAdapter.getInitialState(),
  },
  reducers: {
    // ── Lecturers ────────────────────────────────────────────────────────────
    addLecturer(state, action: PayloadAction<CreateLecturerInput>) {
      lecturersAdapter.addOne(state.lecturers, {
        ...action.payload, id: generateId(), createdAt: new Date(), updatedAt: new Date(),
      })
    },
    upsertLecturer(state, action: PayloadAction<Lecturer>) {
      lecturersAdapter.upsertOne(state.lecturers, action.payload)
    },
    updateLecturer(state, action: PayloadAction<{ id: string; updates: UpdateLecturerInput }>) {
      lecturersAdapter.updateOne(state.lecturers, {
        id: action.payload.id, changes: { ...action.payload.updates, updatedAt: new Date() },
      })
    },
    deleteLecturer(state, action: PayloadAction<string>) {
      lecturersAdapter.removeOne(state.lecturers, action.payload)
    },

    // ── Rooms ────────────────────────────────────────────────────────────────
    addRoom(state, action: PayloadAction<CreateRoomInput>) {
      roomsAdapter.addOne(state.rooms, {
        ...action.payload, id: generateId(), createdAt: new Date(), updatedAt: new Date(),
      })
    },
    upsertRoom(state, action: PayloadAction<Room>) {
      roomsAdapter.upsertOne(state.rooms, action.payload)
    },
    updateRoom(state, action: PayloadAction<{ id: string; updates: UpdateRoomInput }>) {
      roomsAdapter.updateOne(state.rooms, {
        id: action.payload.id, changes: { ...action.payload.updates, updatedAt: new Date() },
      })
    },
    deleteRoom(state, action: PayloadAction<string>) {
      roomsAdapter.removeOne(state.rooms, action.payload)
    },

    // ── Faculties ────────────────────────────────────────────────────────────
    addFaculty(state, action: PayloadAction<CreateFacultyInput>) {
      facultiesAdapter.addOne(state.faculties, {
        ...action.payload, id: generateId(), createdAt: new Date(), updatedAt: new Date(),
      })
    },
    upsertFaculty(state, action: PayloadAction<Faculty>) {
      facultiesAdapter.upsertOne(state.faculties, action.payload)
    },
    updateFaculty(state, action: PayloadAction<{ id: string; updates: UpdateFacultyInput }>) {
      facultiesAdapter.updateOne(state.faculties, {
        id: action.payload.id, changes: { ...action.payload.updates, updatedAt: new Date() },
      })
    },
    deleteFaculty(state, action: PayloadAction<string>) {
      facultiesAdapter.removeOne(state.faculties, action.payload)
    },

    // ── Bulk load (authenticated mode — replace all) ──────────────────────
    setLecturers(state, action: PayloadAction<Lecturer[]>) {
      lecturersAdapter.setAll(state.lecturers, action.payload)
    },
    setRooms(state, action: PayloadAction<Room[]>) {
      roomsAdapter.setAll(state.rooms, action.payload)
    },
    setFaculties(state, action: PayloadAction<Faculty[]>) {
      facultiesAdapter.setAll(state.faculties, action.payload)
    },
  },
})

export const {
  addLecturer, upsertLecturer, updateLecturer, deleteLecturer, setLecturers,
  addRoom,     upsertRoom,     updateRoom,     deleteRoom,     setRooms,
  addFaculty,  upsertFaculty,  updateFaculty,  deleteFaculty,  setFaculties,
} = entitySlice.actions

export default entitySlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

const lecturerSelectors = lecturersAdapter.getSelectors((s: RootState) => s.entities.lecturers)
const roomSelectors     = roomsAdapter.getSelectors((s: RootState) => s.entities.rooms)
const facultySelectors  = facultiesAdapter.getSelectors((s: RootState) => s.entities.faculties)

export const selectAllLecturers = lecturerSelectors.selectAll
export const selectLecturerById = lecturerSelectors.selectById
export const selectLecturerIds  = lecturerSelectors.selectIds
export const selectAllRooms     = roomSelectors.selectAll
export const selectRoomById     = roomSelectors.selectById
export const selectAllFaculties = facultySelectors.selectAll
export const selectFacultyById  = facultySelectors.selectById

// ─── Mode-aware thunks ────────────────────────────────────────────────────────

import { selectIsDemoMode } from './authSlice'
import { selectCurrentUniversity } from './appSlice'

// Lecturers
export const addLecturerThunk = createAsyncThunk<void, CreateLecturerInput, { state: RootState }>(
  'entities/addLecturerThunk',
  async (input, { dispatch, getState }) => {
    const s = getState()
    if (selectIsDemoMode(s) || !selectCurrentUniversity(s)) {
      dispatch(addLecturer(input)); return
    }
    const created = await lecturersApi.create({ ...input, universityId: selectCurrentUniversity(s)!.id })
    dispatch(upsertLecturer(created))
  }
)

export const deleteLecturerThunk = createAsyncThunk<void, string, { state: RootState }>(
  'entities/deleteLecturerThunk',
  async (id, { dispatch, getState }) => {
    if (selectIsDemoMode(getState())) { dispatch(deleteLecturer(id)); return }
    await lecturersApi.delete(id)
    dispatch(deleteLecturer(id))
  }
)

// Rooms
export const addRoomThunk = createAsyncThunk<void, CreateRoomInput, { state: RootState }>(
  'entities/addRoomThunk',
  async (input, { dispatch, getState }) => {
    const s = getState()
    if (selectIsDemoMode(s) || !selectCurrentUniversity(s)) {
      dispatch(addRoom(input)); return
    }
    const created = await roomsApi.create({ ...input, universityId: selectCurrentUniversity(s)!.id })
    dispatch(upsertRoom(created))
  }
)

export const deleteRoomThunk = createAsyncThunk<void, string, { state: RootState }>(
  'entities/deleteRoomThunk',
  async (id, { dispatch, getState }) => {
    if (selectIsDemoMode(getState())) { dispatch(deleteRoom(id)); return }
    await roomsApi.delete(id)
    dispatch(deleteRoom(id))
  }
)

// Faculties
export const addFacultyThunk = createAsyncThunk<void, CreateFacultyInput, { state: RootState }>(
  'entities/addFacultyThunk',
  async (input, { dispatch, getState }) => {
    const s = getState()
    if (selectIsDemoMode(s) || !selectCurrentUniversity(s)) {
      dispatch(addFaculty(input)); return
    }
    const created = await facultiesApi.create({ ...input, universityId: selectCurrentUniversity(s)!.id })
    dispatch(upsertFaculty(created))
  }
)

export const deleteFacultyThunk = createAsyncThunk<void, string, { state: RootState }>(
  'entities/deleteFacultyThunk',
  async (id, { dispatch, getState }) => {
    if (selectIsDemoMode(getState())) { dispatch(deleteFaculty(id)); return }
    await facultiesApi.delete(id)
    dispatch(deleteFaculty(id))
  }
)
