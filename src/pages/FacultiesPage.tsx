import { FacultyForm } from '@/components/forms/FacultyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FacultyList } from '@/components/lists/FacultyList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useEntityCrud } from '@/hooks/useEntityCrud'
import {
	addFacultyThunk,
	deleteFacultyThunk,
	selectFacultyById,
	updateFacultyThunk,
} from '@/store/entitySlice'
import type { CreateFacultyInput, Faculty } from '@/types'
import { Plus } from 'lucide-react'

export default function FacultiesPage() {
	const crud = useEntityCrud<Faculty, CreateFacultyInput>({
		selectById: selectFacultyById,
		addThunk: addFacultyThunk,
		updateThunk: updateFacultyThunk,
		deleteThunk: deleteFacultyThunk,
		label: f => f.name,
		labelFromInput: data => data.name,
	})

	return (
		<>
			<PageHeader
				title="Faculties"
				description="Courses, their syllabus and enrolled students"
				actions={
					<Button onClick={crud.openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Faculty
					</Button>
				}
			/>
			<FacultyList onEdit={crud.openEdit} onDelete={crud.requestDelete} />

			<Dialog open={crud.dialogOpen} onOpenChange={crud.setDialogOpen}>
				<DialogContent title={crud.editingId ? 'Edit faculty' : 'Add faculty'}>
					<FacultyForm
						mode={crud.editingId ? 'edit' : 'create'}
						initialData={crud.editing ?? undefined}
						onSubmit={crud.handleSubmit}
						onCancel={crud.closeDialog}
						isLoading={crud.isSaving}
					/>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!crud.deleteTarget}
				onOpenChange={open => !open && crud.cancelDelete()}
				title="Delete Faculty?"
				description={
					crud.deleteTarget
						? `Are you sure you want to remove "${crud.deleteTarget.name}"? All students and syllabus data will be lost. This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={crud.confirmDelete}
			/>
		</>
	)
}
