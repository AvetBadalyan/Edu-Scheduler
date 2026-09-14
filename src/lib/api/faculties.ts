import type { CreateFacultyInput, Faculty, UpdateFacultyInput } from '@/types'
import { createEntityApi } from './createEntityApi'

export const facultiesApi = createEntityApi<Faculty, CreateFacultyInput, UpdateFacultyInput>(
	'faculties'
)
