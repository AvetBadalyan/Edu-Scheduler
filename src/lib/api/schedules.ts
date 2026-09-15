import type { CreateScheduleInput, Schedule, UpdateScheduleInput } from '@/types'
import { api } from './client'

export const schedulesApi = {
	latest: (universityId: string) =>
		api.get<Schedule>(`/api/schedules/latest?universityId=${universityId}`),

	create: (data: CreateScheduleInput & { universityId: string }) =>
		api.post<Schedule>('/api/schedules', data),

	update: (id: string, updates: UpdateScheduleInput) =>
		api.patch<Schedule>(`/api/schedules/${id}`, updates),
}
