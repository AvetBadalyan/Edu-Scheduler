import type { CreateRoomInput, Room, UpdateRoomInput } from '@/types'
import { api } from './client'

export const roomsApi = {
	list: (universityId: string) => api.get<Room[]>(`/api/rooms?universityId=${universityId}`),

	create: (data: CreateRoomInput & { universityId: string }) => api.post<Room>('/api/rooms', data),

	update: (id: string, updates: UpdateRoomInput) => api.patch<Room>(`/api/rooms/${id}`, updates),

	delete: (id: string) => api.delete<void>(`/api/rooms/${id}`),
}
