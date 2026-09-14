/**
 * useUndoRedo hook — connects EditHistoryStore to ScheduleStore for keyboard
 * shortcuts (Ctrl+Z / Ctrl+Y) and programmatic undo/redo of manual edits.
 *
 * Requirements: 12.4 (undo/redo stack with ≥50 actions)
 */
import { useEffect, useCallback } from "react"
import { useEditHistoryStore } from "@/stores/editHistoryStore"
import { useScheduleStore } from "@/stores/scheduleStore"

/**
 * Applies a redo (re-assigns the moved/assigned class).
 */
function applyRedo(
  edit: ReturnType<typeof useEditHistoryStore.getState>["history"][0],
  assignClass: ReturnType<typeof useScheduleStore.getState>["assignClass"]
) {
  if (edit.after) {
    assignClass(edit.after)
  }
}

/**
 * Reverses an edit (moves back / unassigns).
 */
function applyUndo(
  edit: ReturnType<typeof useEditHistoryStore.getState>["history"][0],
  assignClass: ReturnType<typeof useScheduleStore.getState>["assignClass"],
  unassignClass: ReturnType<typeof useScheduleStore.getState>["unassignClass"]
) {
  // Unassign the "after" state
  if (edit.after) {
    unassignClass({
      ...edit.after.timeSlot,
      entityType: "room",
      entityId: edit.after.roomId,
    })
  }
  // Re-assign the "before" state if it existed
  if (edit.before) {
    assignClass(edit.before)
  }
}

export function useUndoRedo(enableKeyboardShortcuts = true) {
  const { undo, redo, canUndo, canRedo } = useEditHistoryStore()
  const { assignClass, unassignClass } = useScheduleStore()

  const handleUndo = useCallback(() => {
    if (!canUndo()) return
    const edit = undo()
    if (edit) applyUndo(edit, assignClass, unassignClass)
  }, [canUndo, undo, assignClass, unassignClass])

  const handleRedo = useCallback(() => {
    if (!canRedo()) return
    const edit = redo()
    if (edit) applyRedo(edit, assignClass)
  }, [canRedo, redo, assignClass])

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo)
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleUndo, handleRedo, enableKeyboardShortcuts])

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
  }
}
