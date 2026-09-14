import { api } from './client'

/**
 * Builds the standard CRUD client for a university-scoped entity.
 *
 * Every entity (lecturers, rooms, faculties) exposes the same four calls that
 * differ only by resource path and payload type, so we generate them once here
 * instead of repeating the boilerplate per module.
 *
 * @typeParam T - the entity as returned by the API
 * @typeParam C - the create payload (without universityId, which is added here)
 * @typeParam U - the update payload
 */
export function createEntityApi<T, C, U>(resource: string) {
	return {
		list: (universityId: string) => api.get<T[]>(`/api/${resource}?universityId=${universityId}`),

		create: (data: C & { universityId: string }) => api.post<T>(`/api/${resource}`, data),

		update: (id: string, updates: U) => api.patch<T>(`/api/${resource}/${id}`, updates),

		delete: (id: string) => api.delete<void>(`/api/${resource}/${id}`),
	}
}
