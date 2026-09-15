/**
 * useUndoRedo — Ctrl+Z / Ctrl+Y keyboard shortcuts + programmatic undo/redo.
 *
 * All the actual undo/redo logic lives in scheduleSlice (undoLastMove /
 * redoLastMove). This hook just wires up the buttons and keyboard shortcuts.
 */
import { selectCanRedo, selectCanUndo } from '@/store/editHistorySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { redoLastMove, undoLastMove } from '@/store/scheduleSlice'
import { useEffect } from 'react'

export function useUndoRedo(enableKeyboardShortcuts = true) {
	const dispatch = useAppDispatch()
	const canUndo = useAppSelector(selectCanUndo)
	const canRedo = useAppSelector(selectCanRedo)

	const undo = () => {
		if (canUndo) dispatch(undoLastMove())
	}

	const redo = () => {
		if (canRedo) dispatch(redoLastMove())
	}

	useEffect(() => {
		if (!enableKeyboardShortcuts) return

		const handler = (e: KeyboardEvent) => {
			const ctrl = e.ctrlKey || e.metaKey
			if (!ctrl) return
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault()
				if (canUndo) dispatch(undoLastMove())
			} else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
				e.preventDefault()
				if (canRedo) dispatch(redoLastMove())
			}
		}

		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [dispatch, canUndo, canRedo, enableKeyboardShortcuts])

	return { undo, redo, canUndo, canRedo }
}
