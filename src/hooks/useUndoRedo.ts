/**
 * useUndoRedo — Ctrl+Z / Ctrl+Y keyboard shortcuts + programmatic undo/redo.
 */
import {
	redo,
	selectCanRedo,
	selectCanUndo,
	selectCurrentEdit,
	selectNextEdit,
	undo,
} from '@/store/editHistorySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { assignClass, unassignClass } from '@/store/scheduleSlice'
import { useCallback, useEffect } from 'react'

export function useUndoRedo(enableKeyboardShortcuts = true) {
	const dispatch = useAppDispatch()
	const canUndo = useAppSelector(selectCanUndo)
	const canRedo = useAppSelector(selectCanRedo)

	// We read these lazily inside callbacks to avoid stale closures
	const handleUndo = useCallback(() => {
		if (!canUndo) return
		// 1. Get the edit at currentIndex before decrementing
		// We dispatch undo first, then read the now-previous state
		// Actually: read currentEdit BEFORE dispatching undo
		dispatch((_, getState) => {
			const edit = selectCurrentEdit(getState())
			dispatch(undo())
			if (edit?.after) {
				dispatch(
					unassignClass({
						...edit.after.timeSlot,
						entityType: 'room',
						entityId: edit.after.roomId,
					})
				)
			}
			if (edit?.before) {
				dispatch(assignClass(edit.before))
			}
		})
	}, [canUndo, dispatch])

	const handleRedo = useCallback(() => {
		if (!canRedo) return
		dispatch((_, getState) => {
			const edit = selectNextEdit(getState())
			dispatch(redo())
			if (edit?.after) {
				dispatch(assignClass(edit.after))
			}
		})
	}, [canRedo, dispatch])

	useEffect(() => {
		if (!enableKeyboardShortcuts) return
		const handler = (e: KeyboardEvent) => {
			const ctrl = e.ctrlKey || e.metaKey
			if (!ctrl) return
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault()
				handleUndo()
			} else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
				e.preventDefault()
				handleRedo()
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [handleUndo, handleRedo, enableKeyboardShortcuts])

	return { undo: handleUndo, redo: handleRedo, canUndo, canRedo }
}
