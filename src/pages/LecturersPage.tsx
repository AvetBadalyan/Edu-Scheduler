import { LecturerForm } from '@/components/forms/LecturerForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { LecturerList } from '@/components/lists/LecturerList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import {
	addLecturerThunk,
	deleteLecturerThunk,
	selectLecturerById,
	updateLecturerThunk,
} from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { CreateLecturerInput, Lecturer } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function LecturersPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	// Look up the entity being edited / deleted from the store (stays in sync).
	const editing = useAppSelector(state =>
		editingId ? selectLecturerById(state, editingId) : undefined
	)
	const deleteTarget = useAppSelector(state =>
		deleteId ? selectLecturerById(state, deleteId) : undefined
	)

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}

	const openEdit = (lecturer: Lecturer) => {
		setEditingId(lecturer.id)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateLecturerInput) => {
		const name = `${data.name} ${data.surname}`
		setIsSaving(true)
		try {
			if (editingId) {
				await dispatch(updateLecturerThunk({ id: editingId, updates: data })).unwrap()
				toast.success(`Updated ${name}`)
			} else {
				await dispatch(addLecturerThunk(data)).unwrap()
				toast.success(`Added ${name}`)
			}
			setDialogOpen(false)
		} catch {
			toast.error(`Could not save ${name}. Please try again.`)
		} finally {
			setIsSaving(false)
		}
	}

	const confirmDelete = async () => {
		if (!deleteTarget) return
		const name = `${deleteTarget.name} ${deleteTarget.surname}`
		setDeleteId(null)
		try {
			await dispatch(deleteLecturerThunk(deleteTarget.id)).unwrap()
			toast.info(`Removed ${name}`)
		} catch {
			toast.error(`Could not remove ${name}. Please try again.`)
		}
	}

	return (
		<>
			<PageHeader
				title="Lecturers"
				description="Teaching staff and their specialties"
				actions={
					<Button onClick={openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Lecturer
					</Button>
				}
			/>
			<LecturerList onEdit={openEdit} onDelete={setDeleteId} />

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent title={editingId ? 'Edit lecturer' : 'Add lecturer'}>
					<LecturerForm
						mode={editingId ? 'edit' : 'create'}
						initialData={editing ?? undefined}
						onSubmit={handleSubmit}
						onCancel={() => setDialogOpen(false)}
						isLoading={isSaving}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteId(null)}
				title="Delete Lecturer?"
				description={
					deleteTarget
						? `Are you sure you want to remove ${deleteTarget.name} ${deleteTarget.surname}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={confirmDelete}
			/>
		</>
	)
}
