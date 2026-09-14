/**
 * RoomsPage — manage rooms (create, edit, delete) grouped by capacity.
 */
import { RoomForm } from '@/components/forms/RoomForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoomList } from '@/components/lists/RoomList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useEntityStore } from '@/stores/entityStore'
import type { CreateRoomInput, Room } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function RoomsPage() {
	const { addRoom, updateRoom, deleteRoom } = useEntityStore()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editing, setEditing] = useState<Room | null>(null)

	const openCreate = () => {
		setEditing(null)
		setDialogOpen(true)
	}

	const openEdit = (room: Room) => {
		setEditing(room)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateRoomInput) => {
		if (editing) {
			updateRoom(editing.id, data)
			toast.success(`Updated Room ${data.number}`)
		} else {
			addRoom(data)
			toast.success(`Added Room ${data.number}`)
		}
		setDialogOpen(false)
	}

	return (
		<>
			<PageHeader
				title="Rooms"
				description="Available rooms and their capacity"
				actions={
					<Button
						onClick={openCreate}
						className="gap-2"
					>
						<Plus
							className="size-4"
							aria-hidden
						/>
						Add Room
					</Button>
				}
			/>

			<RoomList
				onEdit={openEdit}
				onDelete={id => {
					const room = useEntityStore.getState().rooms.find(r => r.id === id)
					deleteRoom(id)
					if (room) toast.info(`Removed Room ${room.number}`)
				}}
			/>

			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			>
				<DialogContent title={editing ? 'Edit room' : 'Add room'}>
					<RoomForm
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
