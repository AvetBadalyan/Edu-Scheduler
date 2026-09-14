import type { CreateLecturerInput, Lecturer, UpdateLecturerInput } from '@/types'
import { createEntityApi } from './createEntityApi'

export const lecturersApi = createEntityApi<Lecturer, CreateLecturerInput, UpdateLecturerInput>(
	'lecturers'
)
