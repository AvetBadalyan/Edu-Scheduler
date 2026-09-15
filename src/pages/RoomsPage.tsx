import { RoomForm } from '@/components/forms/RoomForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoomList } from '@/components/lists/RoomList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { addRoomThunk, deleteRoomThunk, selectRoomById, updateRoomThunk } from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { CreateRoomInput, Room } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function RoomsPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	// Look up the entity being edited / deleted from the store (stays in sync).
	const editing = useAppSelector(state =>
		editingId ? selectRoomById(state, editingId) : undefined
	)
	const deleteTarget = useAppSelector(state =>
		deleteId ? selectRoomById(state, deleteId) : undefined
	)

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}

	const openEdit = (room: Room) => {
		setEditingId(room.id)
		setDialogOpen(true)
	}

	const handleSubmit = async (data: CreateRoomInput) => {
		setIsSaving(true)
		try {
			if (editingId) {
				await dispatch(updateRoomThunk({ id: editingId, updates: data })).unwrap()
				toast.success(`Updated Room ${data.number}`)
			} else {
				await dispatch(addRoomThunk(data)).unwrap()
				toast.success(`Added Room ${data.number}`)
			}
			setDialogOpen(false)
		} catch {
			toast.error(`Could not save Room ${data.number}. Please try again.`)
		} finally {
			setIsSaving(false)
		}
	}

	const confirmDelete = async () => {
		if (!deleteTarget) return
		const number = deleteTarget.number
		setDeleteId(null)
		try {
			await dispatch(deleteRoomThunk(deleteTarget.id)).unwrap()
			toast.info(`Removed Room ${number}`)
		} catch {
			toast.error(`Could not remove Room ${number}. Please try again.`)
		}
	}

	return (
		<>
			<PageHeader
				title="Rooms"
				description="Available rooms and their capacity"
				actions={
					<Button onClick={openCreate} className="gap-2">
						<Plus className="size-4" aria-hidden />
						Add Room
					</Button>
				}
			/>
			<RoomList onEdit={openEdit} onDelete={setDeleteId} />

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent title={editingId ? 'Edit room' : 'Add room'}>
					<RoomForm
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
				title="Delete Room?"
				description={
					deleteTarget
						? `Are you sure you want to remove Room ${deleteTarget.number}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={confirmDelete}
			/>
		</>
	)
}
