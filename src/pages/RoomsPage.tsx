import { RoomForm } from '@/components/forms/RoomForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoomList } from '@/components/lists/RoomList'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { store } from '@/store'
import { addRoomThunk, deleteRoomThunk, selectRoomById, updateRoomThunk } from '@/store/entitySlice'
import { useAppDispatch } from '@/store/hooks'
import type { CreateRoomInput, Room } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function RoomsPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()

	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Room | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const editing = editingId ? selectRoomById(store.getState(), editingId) : null

	const openCreate = () => {
		setEditingId(null)
		setDialogOpen(true)
	}
	const openEdit = (r: Room) => {
		setEditingId(r.id)
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

	const handleDeleteClick = (id: string) => {
		const r = selectRoomById(store.getState(), id)
		if (r) setDeleteTarget(r)
	}

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return
		const target = deleteTarget
		setDeleteTarget(null)
		try {
			await dispatch(deleteRoomThunk(target.id)).unwrap()
			toast.info(`Removed Room ${target.number}`)
		} catch {
			toast.error(`Could not remove Room ${target.number}. Please try again.`)
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
			<RoomList onEdit={openEdit} onDelete={handleDeleteClick} />

			{/* Edit/Create Dialog */}
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

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
				title="Delete Room?"
				description={
					deleteTarget
						? `Are you sure you want to remove Room ${deleteTarget.number}? This action cannot be undone.`
						: ''
				}
				confirmLabel="Delete"
				onConfirm={handleDeleteConfirm}
			/>
		</>
	)
}
