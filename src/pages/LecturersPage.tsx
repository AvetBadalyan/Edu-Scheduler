import { LecturerForm } from '@/components/forms/LecturerForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { LecturerList } from '@/components/lists/LecturerList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch } from '@/store/hooks'
import { addLecturer, updateLecturer, deleteLecturer, selectLecturerById } from '@/store/entitySlice'
import { store } from '@/store'
import type { CreateLecturerInput, Lecturer } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function LecturersPage() {
  const dispatch = useAppDispatch()
  const toast    = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)

  const editing = editingId ? selectLecturerById(store.getState(), editingId) : null

  const openCreate = () => { setEditingId(null); setDialogOpen(true) }
  const openEdit   = (l: Lecturer) => { setEditingId(l.id); setDialogOpen(true) }

  const handleSubmit = async (data: CreateLecturerInput) => {
    if (editingId) {
      dispatch(updateLecturer({ id: editingId, updates: data }))
      toast.success(`Updated ${data.name} ${data.surname}`)
    } else {
      dispatch(addLecturer(data))
      toast.success(`Added ${data.name} ${data.surname}`)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const l = selectLecturerById(store.getState(), id)
    dispatch(deleteLecturer(id))
    if (l) toast.info(`Removed ${l.name} ${l.surname}`)
  }

  return (
    <>
      <PageHeader title="Lecturers" description="Teaching staff and their specialties"
        actions={<Button onClick={openCreate} className="gap-2"><Plus className="size-4" aria-hidden />Add Lecturer</Button>} />
      <LecturerList onEdit={openEdit} onDelete={handleDelete} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editingId ? 'Edit lecturer' : 'Add lecturer'}>
          <LecturerForm mode={editingId ? 'edit' : 'create'}
            initialData={editing ?? undefined} onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
