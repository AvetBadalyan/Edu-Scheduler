import { FacultyForm } from '@/components/forms/FacultyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FacultyList } from '@/components/lists/FacultyList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import {
	addFacultyThunk,
	deleteFacultyThunk,
	selectFacultyById,
	updateFacultyThunk,
} from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { CreateFacultyInput, Faculty } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function FacultiesPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	// Look up the entity being edited / deleted from the store (stays in sync).
	const editing = useAppSelector(state =>
		editingId ? selectFacultyById(state, editingId) : undefined
	)
	const deleteTarget = useAppSelector(state =>
		deleteId ? selectFacultyById(state, deleteId) : undefined
	)

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}

	const openEdit = (faculty: Faculty) => {
		setEditingId(faculty.id)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateFacultyInput) => {
		setIsSaving(true)
		try {
			if (editingId) {
				await dispatch(updateFacultyThunk({ id: editingId, updates: data })).unwrap()
				toast.success(`Updated ${data.name}`)
			} else {
				await dispatch(addFacultyThunk(data)).unwrap()
				toast.success(`Added ${data.name}`)
			}
			setDialogOpen(false)
		} catch {
			toast.error(`Could not save ${data.name}. Please try again.`)
		} finally {
			setIsSaving(false)
		}
	}

	const confirmDelete = async () => {
		if (!deleteTarget) return
		const name = deleteTarget.name
		setDeleteId(null)
		try {
			await dispatch(deleteFacultyThunk(deleteTarget.id)).unwrap()
			toast.info(`Removed ${name}`)
		} catch {
			toast.error(`Could not remove ${name}. Please try again.`)
		}
	}

	return (
		<>
			<PageHeader
				title="Faculties"
				description="Courses, their syllabus and enrolled students"
				actions={
					<Button onClick={openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Faculty
					</Button>
				}
			/>
			<FacultyList onEdit={openEdit} onDelete={setDeleteId} />

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent title={editingId ? 'Edit faculty' : 'Add faculty'}>
					<FacultyForm
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
				title="Delete Faculty?"
				description={
					deleteTarget
						? `Are you sure you want to remove "${deleteTarget.name}"? All students and syllabus data will be lost. This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={confirmDelete}
			/>
		</>
	)
}
