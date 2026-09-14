import { FacultyForm } from '@/components/forms/FacultyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FacultyList } from '@/components/lists/FacultyList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { store } from '@/store'
import {
	addFacultyThunk,
	deleteFacultyThunk,
	selectFacultyById,
	updateFacultyThunk,
} from '@/store/entitySlice'
import { useAppDispatch } from '@/store/hooks'
import type { CreateFacultyInput, Faculty } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function FacultiesPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const editing = editingId ? selectFacultyById(store.getState(), editingId) : null

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}
	const openEdit = (f: Faculty) => {
		setEditingId(f.id)
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

	const handleDeleteClick = (id: string) => {
		const f = selectFacultyById(store.getState(), id)
		if (f) setDeleteTarget(f)
	}

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return
		const target = deleteTarget
		setDeleteTarget(null)
		try {
			await dispatch(deleteFacultyThunk(target.id)).unwrap()
			toast.info(`Removed ${target.name}`)
		} catch {
			toast.error(`Could not remove ${target.name}. Please try again.`)
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
			<FacultyList onEdit={openEdit} onDelete={handleDeleteClick} />

			{/* Edit/Create Dialog */}
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

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
				title="Delete Faculty?"
				description={
					deleteTarget
						? `Are you sure you want to remove "${deleteTarget.name}"? All students and syllabus data will be lost. This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={handleDeleteConfirm}
			/>
		</>
	)
}
