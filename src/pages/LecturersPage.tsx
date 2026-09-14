/**
 * LecturersPage — manage lecturers (create, edit, delete, search, filter).
 */
import { LecturerForm } from '@/components/forms/LecturerForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { LecturerList } from '@/components/lists/LecturerList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useEntityStore } from '@/stores/entityStore'
import type { CreateLecturerInput, Lecturer } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function LecturersPage() {
	const { addLecturer, updateLecturer, deleteLecturer } = useEntityStore()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<Lecturer | null>(null)

	const openCreate = () => {
		setEditing(null)
		setDialogOpen(true)
	}

	const openEdit = (lecturer: Lecturer) => {
		setEditing(lecturer)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateLecturerInput) => {
		if (editing) {
			updateLecturer(editing.id, data)
			toast.success(`Updated ${data.name} ${data.surname}`)
		} else {
			addLecturer(data)
			toast.success(`Added ${data.name} ${data.surname}`)
		}
		setDialogOpen(false)
	}

	const handleDelete = (lecturer: Lecturer) => {
		deleteLecturer(lecturer.id)
		toast.info(`Removed ${lecturer.name} ${lecturer.surname}`)
	}

	return (
		<>
			<PageHeader
				title="Lecturers"
				description="Teaching staff and their specialties"
				actions={
					<Button
						onClick={openCreate}
						className="gap-2"
					>
						<Plus
							className="size-4"
							aria-hidden
						/>
						Add Lecturer
					</Button>
				}
			/>

			<LecturerList
				onEdit={openEdit}
				onDelete={id => {
					const lecturer = useEntityStore
						.getState()
						.lecturers.find(l => l.id === id)
					if (lecturer) handleDelete(lecturer)
				}}
			/>

			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			>
				<DialogContent title={editing ? 'Edit lecturer' : 'Add lecturer'}>
					<LecturerForm
						mode={editing ? 'edit' : 'create'}
						initialData={editing ?? undefined}
						onSubmit={handleSubmit}
						onCancel={() => setDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	)
}
