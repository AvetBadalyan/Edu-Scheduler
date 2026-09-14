import { FacultyForm } from '@/components/forms/FacultyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { FacultyList } from '@/components/lists/FacultyList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch } from '@/store/hooks'
import { addFaculty, updateFaculty, deleteFaculty, selectFacultyById } from '@/store/entitySlice'
import { store } from '@/store'
import type { CreateFacultyInput, Faculty } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function FacultiesPage() {
  const dispatch = useAppDispatch()
  const toast    = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)

  const editing = editingId ? selectFacultyById(store.getState(), editingId) : null

  const openCreate = () => { setEditingId(null); setDialogOpen(true) }
  const openEdit   = (f: Faculty) => { setEditingId(f.id); setDialogOpen(true) }

  const handleSubmit = async (data: CreateFacultyInput) => {
    if (editingId) {
      dispatch(updateFaculty({ id: editingId, updates: data }))
      toast.success(`Updated ${data.name}`)
    } else {
      dispatch(addFaculty(data))
      toast.success(`Added ${data.name}`)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const f = selectFacultyById(store.getState(), id)
    dispatch(deleteFaculty(id))
    if (f) toast.info(`Removed ${f.name}`)
  }

  return (
    <>
      <PageHeader title="Faculties" description="Courses, their syllabus and enrolled students"
        actions={<Button onClick={openCreate} className="gap-2"><Plus className="size-4" aria-hidden />Add Faculty</Button>} />
      <FacultyList onEdit={openEdit} onDelete={handleDelete} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editingId ? 'Edit faculty' : 'Add faculty'}>
          <FacultyForm mode={editingId ? 'edit' : 'create'}
            initialData={editing ?? undefined} onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
