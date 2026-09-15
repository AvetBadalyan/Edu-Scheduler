/**
 * useEntityCrud — shared create/edit/delete orchestration for the entity pages.
 *
 * The Faculties / Lecturers / Rooms pages are structurally identical: open a
 * dialog to create or edit, submit through a thunk with success/error toasts,
 * and confirm deletes. This hook holds that logic once; each page supplies only
 * the entity-specific thunks, selector and label formatting.
 */
import { useToast } from '@/hooks/useToast'
import type { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { AsyncThunkAction } from '@reduxjs/toolkit'
import { useState } from 'react'

interface EntityWithId {
	id: string
}

/**
 * Payload-creator call signature of an AsyncThunk. Using this (rather than the
 * full `AsyncThunk` type) as the config field type keeps dispatch strongly
 * typed while avoiding the generic-variance friction that collapses the
 * payload argument to `never` when the arg type is itself a generic.
 */
type ThunkCreator<TArg> = (arg: TArg) => AsyncThunkAction<void, TArg, { state: RootState }>

/**
 * @template TEntity  the stored entity (has an `id`)
 * @template TInput   the create payload (form submit) shape
 * @template TUpdate  the update payload shape (defaults to a partial create)
 */
interface EntityCrudConfig<
	TEntity extends EntityWithId,
	TInput extends object,
	TUpdate = Partial<TInput>,
> {
	/** Reactive selector for a single entity by id. */
	selectById: (state: RootState, id: string) => TEntity | undefined
	/** Thunks that talk to the store/API. */
	addThunk: ThunkCreator<TInput>
	updateThunk: ThunkCreator<{ id: string; updates: TUpdate }>
	deleteThunk: ThunkCreator<string>
	/** Human-readable label for an entity, used in toast messages. */
	label: (entity: TEntity) => string
	/** Label built from submitted form data (entity may not exist yet on create). */
	labelFromInput: (input: TInput) => string
}

export function useEntityCrud<
	TEntity extends EntityWithId,
	TInput extends object,
	TUpdate = Partial<TInput>,
>(config: EntityCrudConfig<TEntity, TInput, TUpdate>) {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	// Reactive reads — re-render if the entity changes while a dialog is open.
	const editing = useAppSelector(state =>
		editingId ? (config.selectById(state, editingId) ?? null) : null
	)
	const deleteTarget = useAppSelector(state =>
		deleteId ? (config.selectById(state, deleteId) ?? null) : null
	)

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}

	const openEdit = (entity: TEntity) => {
		setEditingId(entity.id)
		setDialogOpen(true)
	}

	const closeDialog = () => setDialogOpen(false)

	const handleSubmit = async (data: TInput) => {
		const name = config.labelFromInput(data)
		setIsSaving(true)
		try {
			if (editingId) {
				// A full create payload is always a valid update payload.
				const updates = data as unknown as TUpdate
				await dispatch(config.updateThunk({ id: editingId, updates })).unwrap()
				toast.success(`Updated ${name}`)
			} else {
				await dispatch(config.addThunk(data)).unwrap()
				toast.success(`Added ${name}`)
			}
			setDialogOpen(false)
		} catch {
			toast.error(`Could not save ${name}. Please try again.`)
		} finally {
			setIsSaving(false)
		}
	}

	const requestDelete = (id: string) => setDeleteId(id)

	const cancelDelete = () => setDeleteId(null)

	const confirmDelete = async () => {
		if (!deleteTarget) return
		const target = deleteTarget
		const name = config.label(target)
		setDeleteId(null)
		try {
			await dispatch(config.deleteThunk(target.id)).unwrap()
			toast.info(`Removed ${name}`)
		} catch {
			toast.error(`Could not remove ${name}. Please try again.`)
		}
	}

	return {
		// dialog state
		dialogOpen,
		setDialogOpen,
		editingId,
		editing,
		isSaving,
		openCreate,
		openEdit,
		closeDialog,
		handleSubmit,
		// delete state
		deleteTarget,
		requestDelete,
		cancelDelete,
		confirmDelete,
	}
}
