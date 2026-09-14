import { api } from './client'
import type { CreateLecturerInput, Lecturer, UpdateLecturerInput } from '@/types'

export const lecturersApi = {
  list: (universityId: string) =>
    api.get<Lecturer[]>(`/api/lecturers?universityId=${universityId}`),

  create: (data: CreateLecturerInput & { universityId: string }) =>
    api.post<Lecturer>('/api/lecturers', data),

  update: (id: string, updates: UpdateLecturerInput) =>
    api.patch<Lecturer>(`/api/lecturers/${id}`, updates),

  delete: (id: string) =>
    api.delete<void>(`/api/lecturers/${id}`),
}
