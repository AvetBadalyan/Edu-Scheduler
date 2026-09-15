import type { University } from '@/types'
import { api } from './client'

export const universitiesApi = {
	list: () => api.get<University[]>('/api/universities'),

	create: (name: string) => api.post<University>('/api/universities', { name }),
}
