import { api } from './client'
import type { CreateFacultyInput, Faculty, UpdateFacultyInput } from '@/types'

export const facultiesApi = {
  list: (universityId: string) =>
    api.get<Faculty[]>(`/api/faculties?universityId=${universityId}`),

  create: (data: CreateFacultyInput & { universityId: string }) =>
    api.post<Faculty>('/api/faculties', data),

  update: (id: string, updates: UpdateFacultyInput) =>
    api.patch<Faculty>(`/api/faculties/${id}`, updates),

  delete: (id: string) =>
    api.delete<void>(`/api/faculties/${id}`),
}
