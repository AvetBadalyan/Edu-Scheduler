/**
 * FacultiesPage — manage faculties/courses (syllabus + students).
 */
import { FacultyForm } from '@/components/forms/FacultyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FacultyList } from '@/components/lists/FacultyList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useEntityStore } from '@/stores/entityStore'
import type { CreateFacultyInput, Faculty } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function FacultiesPage() {
	const { addFaculty, updateFaculty, deleteFaculty } = useEntityStore()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<Faculty | null>(null)

	const openCreate = () => {
		setEditing(null)
		setDialogOpen(true)
	}

	const openEdit = (faculty: Faculty) => {
		setEditing(faculty)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateFacultyInput) => {
		if (editing) {
			updateFaculty(editing.id, data)
			toast.success(`Updated ${data.name}`)
		} else {
			addFaculty(data)
			toast.success(`Added ${data.name}`)
		}
		setDialogOpen(false)
	}

	return (
		<>
			<PageHeader
				title="Faculties"
				description="Courses, their syllabus and enrolled students"
				actions={
					<Button
						onClick={openCreate}
						className="gap-2"
					>
						<Plus
							className="size-4"
							aria-hidden
						/>
						Add Faculty
					</Button>
				}
			/>

			<FacultyList
				onEdit={openEdit}
				onDelete={id => {
					const faculty = useEntityStore
						.getState()
						.faculties.find(f => f.id === id)
					deleteFaculty(id)
					if (faculty) toast.info(`Removed ${faculty.name}`)
				}}
			/>

			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			>
				<DialogContent title={editing ? 'Edit faculty' : 'Add faculty'}>
					<FacultyForm
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
