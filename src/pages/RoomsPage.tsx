import { RoomForm } from '@/components/forms/RoomForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { RoomList } from '@/components/lists/RoomList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch } from '@/store/hooks'
import { addRoom, updateRoom, deleteRoom, selectRoomById } from '@/store/entitySlice'
import { store } from '@/store'
import type { CreateRoomInput, Room } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function RoomsPage() {
  const dispatch = useAppDispatch()
  const toast    = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)

  const editing = editingId ? selectRoomById(store.getState(), editingId) : null

  const openCreate = () => { setEditingId(null); setDialogOpen(true) }
  const openEdit   = (r: Room) => { setEditingId(r.id); setDialogOpen(true) }

  const handleSubmit = async (data: CreateRoomInput) => {
    if (editingId) {
      dispatch(updateRoom({ id: editingId, updates: data }))
      toast.success(`Updated Room ${data.number}`)
    } else {
      dispatch(addRoom(data))
      toast.success(`Added Room ${data.number}`)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const r = selectRoomById(store.getState(), id)
    dispatch(deleteRoom(id))
    if (r) toast.info(`Removed Room ${r.number}`)
  }

  return (
    <>
      <PageHeader title="Rooms" description="Available rooms and their capacity"
        actions={<Button onClick={openCreate} className="gap-2"><Plus className="size-4" aria-hidden />Add Room</Button>} />
      <RoomList onEdit={openEdit} onDelete={handleDelete} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editingId ? 'Edit room' : 'Add room'}>
          <RoomForm mode={editingId ? 'edit' : 'create'}
            initialData={editing ?? undefined} onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
