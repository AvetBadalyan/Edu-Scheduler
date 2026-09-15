import { RoomForm } from '@/components/forms/RoomForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoomList } from '@/components/lists/RoomList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useEntityCrud } from '@/hooks/useEntityCrud'
import { addRoomThunk, deleteRoomThunk, selectRoomById, updateRoomThunk } from '@/store/entitySlice'
import type { CreateRoomInput, Room } from '@/types'
import { Plus } from 'lucide-react'

const roomLabel = (data: Pick<Room, 'number'>) => `Room ${data.number}`

export default function RoomsPage() {
	const crud = useEntityCrud<Room, CreateRoomInput>({
		selectById: selectRoomById,
		addThunk: addRoomThunk,
		updateThunk: updateRoomThunk,
		deleteThunk: deleteRoomThunk,
		label: roomLabel,
		labelFromInput: roomLabel,
	})

	return (
		<>
			<PageHeader
				title="Rooms"
				description="Available rooms and their capacity"
				actions={
					<Button onClick={crud.openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Room
					</Button>
				}
			/>
			<RoomList onEdit={crud.openEdit} onDelete={crud.requestDelete} />

			<Dialog open={crud.dialogOpen} onOpenChange={crud.setDialogOpen}>
				<DialogContent title={crud.editingId ? 'Edit room' : 'Add room'}>
					<RoomForm
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
				title="Delete Room?"
				description={
					crud.deleteTarget
						? `Are you sure you want to remove Room ${crud.deleteTarget.number}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={crud.confirmDelete}
			/>
		</>
	)
}
