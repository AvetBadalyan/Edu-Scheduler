import { api } from './client'
import type { University } from '@/types'

export const universitiesApi = {
  list: () =>
    api.get<University[]>('/api/universities'),

  get: (id: string) =>
    api.get<University>(`/api/universities/${id}`),

  create: (name: string) =>
    api.post<University>('/api/universities', { name }),

  rename: (id: string, name: string) =>
    api.patch<University>(`/api/universities/${id}`, { name }),

  delete: (id: string) =>
    api.delete<void>(`/api/universities/${id}`),
}
