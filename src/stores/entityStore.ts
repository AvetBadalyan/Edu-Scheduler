import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type {
  Lecturer, LecturerId, Room, RoomId, Faculty, FacultyId,
  CreateLecturerInput, UpdateLecturerInput,
  CreateRoomInput, UpdateRoomInput,
  CreateFacultyInput, UpdateFacultyInput,
} from "@/types"

// ─── Helper to generate IDs ───────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function now(): Date {
  return new Date()
}

// ─── EntityStore interface ────────────────────────────────────────────────────

interface EntityStore {
  // State
  lecturers: Lecturer[]
  rooms: Room[]
  faculties: Faculty[]
  isLoading: boolean
  error: string | null

  // Lecturer Actions
  addLecturer: (input: CreateLecturerInput) => Lecturer
  updateLecturer: (id: LecturerId, updates: UpdateLecturerInput) => Lecturer | null
  deleteLecturer: (id: LecturerId) => void

  // Room Actions
  addRoom: (input: CreateRoomInput) => Room
  updateRoom: (id: RoomId, updates: UpdateRoomInput) => Room | null
  deleteRoom: (id: RoomId) => void

  // Faculty Actions
  addFaculty: (input: CreateFacultyInput) => Faculty
  updateFaculty: (id: FacultyId, updates: UpdateFacultyInput) => Faculty | null
  deleteFaculty: (id: FacultyId) => void

  // Utility
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useEntityStore = create<EntityStore>()(
  devtools(
    (set, _get) => ({
      // Initial state
      lecturers: [],
      rooms: [],
      faculties: [],
      isLoading: false,
      error: null,

      // ── Lecturer Actions ───────────────────────────────────────────────────

      addLecturer: (input) => {
        const lecturer: Lecturer = {
          ...input,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ lecturers: [...state.lecturers, lecturer] }))
        return lecturer
      },

      updateLecturer: (id, updates) => {
        let updated: Lecturer | null = null
        set((state) => ({
          lecturers: state.lecturers.map((l) => {
            if (l.id === id) {
              updated = { ...l, ...updates, id, updatedAt: now() }
              return updated
            }
            return l
          }),
        }))
        return updated
      },

      deleteLecturer: (id) => {
        set((state) => ({
          lecturers: state.lecturers.filter((l) => l.id !== id),
        }))
      },

      // ── Room Actions ───────────────────────────────────────────────────────

      addRoom: (input) => {
        const room: Room = {
          ...input,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ rooms: [...state.rooms, room] }))
        return room
      },

      updateRoom: (id, updates) => {
        let updated: Room | null = null
        set((state) => ({
          rooms: state.rooms.map((r) => {
            if (r.id === id) {
              updated = { ...r, ...updates, id, updatedAt: now() }
              return updated
            }
            return r
          }),
        }))
        return updated
      },

      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
        }))
      },

      // ── Faculty Actions ────────────────────────────────────────────────────

      addFaculty: (input) => {
        const faculty: Faculty = {
          ...input,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ faculties: [...state.faculties, faculty] }))
        return faculty
      },

      updateFaculty: (id, updates) => {
        let updated: Faculty | null = null
        set((state) => ({
          faculties: state.faculties.map((f) => {
            if (f.id === id) {
              updated = { ...f, ...updates, id, updatedAt: now() }
              return updated
            }
            return f
          }),
        }))
        return updated
      },

      deleteFaculty: (id) => {
        set((state) => ({
          faculties: state.faculties.filter((f) => f.id !== id),
        }))
      },

      // ── Utility ────────────────────────────────────────────────────────────

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: "EntityStore" }
  )
)
