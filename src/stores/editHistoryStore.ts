import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { ScheduleEdit } from "@/types"

const MAX_HISTORY_SIZE = 50

// ─── EditHistoryStore interface ───────────────────────────────────────────────

interface EditHistoryStore {
  // State
  history: ScheduleEdit[]
  currentIndex: number

  // Actions
  pushEdit: (edit: ScheduleEdit) => void
  undo: () => ScheduleEdit | null
  redo: () => ScheduleEdit | null

  // Selectors
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useEditHistoryStore = create<EditHistoryStore>()(
  devtools(
    (set, get) => ({
      history: [],
      currentIndex: -1,

      // ── pushEdit ──────────────────────────────────────────────────────────
      // Adds a new edit. Discards any redo entries (edits after currentIndex),
      // then appends and trims to MAX_HISTORY_SIZE.
      pushEdit: (edit) => {
        set((state) => {
          // Discard all edits after current position (redo branch)
          const trimmed = state.history.slice(0, state.currentIndex + 1)
          // Append new edit
          const appended = [...trimmed, edit]
          // Enforce max size — keep the most recent entries
          const bounded =
            appended.length > MAX_HISTORY_SIZE
              ? appended.slice(appended.length - MAX_HISTORY_SIZE)
              : appended
          return {
            history: bounded,
            currentIndex: bounded.length - 1,
          }
        })
      },

      // ── undo ──────────────────────────────────────────────────────────────
      // Moves currentIndex back one and returns the edit that was undone,
      // so the caller can reverse it in the schedule store.
      undo: () => {
        const { history, currentIndex, canUndo } = get()
        if (!canUndo()) return null
        const edit = history[currentIndex]
        set({ currentIndex: currentIndex - 1 })
        return edit
      },

      // ── redo ──────────────────────────────────────────────────────────────
      // Moves currentIndex forward one and returns the edit to re-apply.
      redo: () => {
        const { history, currentIndex, canRedo } = get()
        if (!canRedo()) return null
        const nextIndex = currentIndex + 1
        const edit = history[nextIndex]
        set({ currentIndex: nextIndex })
        return edit
      },

      // ── canUndo / canRedo ─────────────────────────────────────────────────
      canUndo: () => get().currentIndex >= 0,
      canRedo: () => get().currentIndex < get().history.length - 1,

      // ── clearHistory ──────────────────────────────────────────────────────
      clearHistory: () => set({ history: [], currentIndex: -1 }),
    }),
    { name: "EditHistoryStore" }
  )
)
