import { LecturerForm } from '@/components/forms/LecturerForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { LecturerList } from '@/components/lists/LecturerList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { store } from '@/store'
import {
	addLecturerThunk,
	deleteLecturerThunk,
	selectLecturerById,
	updateLecturerThunk,
} from '@/store/entitySlice'
import { useAppDispatch } from '@/store/hooks'
import type { CreateLecturerInput, Lecturer } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function LecturersPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Lecturer | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const editing = editingId ? selectLecturerById(store.getState(), editingId) : null

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}
	const openEdit = (l: Lecturer) => {
		setEditingId(l.id)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateLecturerInput) => {
		setIsSaving(true)
		try {
			if (editingId) {
				await dispatch(updateLecturerThunk({ id: editingId, updates: data })).unwrap()
				toast.success(`Updated ${data.name} ${data.surname}`)
			} else {
				await dispatch(addLecturerThunk(data)).unwrap()
				toast.success(`Added ${data.name} ${data.surname}`)
			}
			setDialogOpen(false)
		} catch {
			toast.error(`Could not save ${data.name} ${data.surname}. Please try again.`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleDeleteClick = (id: string) => {
		const l = selectLecturerById(store.getState(), id)
		if (l) setDeleteTarget(l)
	}

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return
		const target = deleteTarget
		setDeleteTarget(null)
		try {
			await dispatch(deleteLecturerThunk(target.id)).unwrap()
			toast.info(`Removed ${target.name} ${target.surname}`)
		} catch {
			toast.error(`Could not remove ${target.name} ${target.surname}. Please try again.`)
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
			<LecturerList onEdit={openEdit} onDelete={handleDeleteClick} />

			{/* Edit/Create Dialog */}
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

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
				title="Delete Lecturer?"
				description={
					deleteTarget
						? `Are you sure you want to remove ${deleteTarget.name} ${deleteTarget.surname}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={handleDeleteConfirm}
			/>
		</>
	)
}
