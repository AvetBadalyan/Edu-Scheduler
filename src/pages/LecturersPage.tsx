import { LecturerForm } from '@/components/forms/LecturerForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { LecturerList } from '@/components/lists/LecturerList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useEntityCrud } from '@/hooks/useEntityCrud'
import {
	addLecturerThunk,
	deleteLecturerThunk,
	selectLecturerById,
	updateLecturerThunk,
} from '@/store/entitySlice'
import type { CreateLecturerInput, Lecturer } from '@/types'
import { Plus } from 'lucide-react'

const lecturerLabel = (data: Pick<Lecturer, 'name' | 'surname'>) => `${data.name} ${data.surname}`

export default function LecturersPage() {
	const crud = useEntityCrud<Lecturer, CreateLecturerInput>({
		selectById: selectLecturerById,
		addThunk: addLecturerThunk,
		updateThunk: updateLecturerThunk,
		deleteThunk: deleteLecturerThunk,
		label: lecturerLabel,
		labelFromInput: lecturerLabel,
	})

	return (
		<>
			<PageHeader
				title="Lecturers"
				description="Teaching staff and their specialties"
				actions={
					<Button onClick={crud.openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Lecturer
					</Button>
				}
			/>
			<LecturerList onEdit={crud.openEdit} onDelete={crud.requestDelete} />

			<Dialog open={crud.dialogOpen} onOpenChange={crud.setDialogOpen}>
				<DialogContent title={crud.editingId ? 'Edit lecturer' : 'Add lecturer'}>
					<LecturerForm
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
				title="Delete Lecturer?"
				description={
					crud.deleteTarget
						? `Are you sure you want to remove ${crud.deleteTarget.name} ${crud.deleteTarget.surname}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={crud.confirmDelete}
			/>
		</>
	)
}
