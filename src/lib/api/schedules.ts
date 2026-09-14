import { api } from './client'
import type { CreateScheduleInput, Schedule, UpdateScheduleInput } from '@/types'

export const schedulesApi = {
	list: (universityId: string) =>
		api.get<Schedule[]>(`/api/schedules?universityId=${universityId}`),

	latest: (universityId: string) =>
		api.get<Schedule>(`/api/schedules/latest?universityId=${universityId}`),

	get: (id: string) => api.get<Schedule>(`/api/schedules/${id}`),

	create: (data: CreateScheduleInput & { universityId: string }) =>
		api.post<Schedule>('/api/schedules', data),

	update: (id: string, updates: UpdateScheduleInput) =>
		api.patch<Schedule>(`/api/schedules/${id}`, updates),

	delete: (id: string) => api.delete<void>(`/api/schedules/${id}`),
}
