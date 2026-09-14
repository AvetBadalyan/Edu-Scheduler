/**
 * useSeedData — loads demo data into Redux on first mount.
 */
import { seedFaculties, seedLecturers, seedRooms } from '@/lib/seedData'
import {
	addFaculty,
	addLecturer,
	addRoom,
	selectAllFaculties,
	selectAllLecturers,
	selectAllRooms
} from '@/store/entitySlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useEffect } from 'react'

export function useSeedData(): void {
	const dispatch = useAppDispatch()
	const lecturers = useAppSelector(selectAllLecturers)
	const rooms = useAppSelector(selectAllRooms)
	const faculties = useAppSelector(selectAllFaculties)

	useEffect(() => {
		if (lecturers.length === 0)
			seedLecturers.forEach(l => dispatch(addLecturer(l)))
		if (rooms.length === 0) seedRooms.forEach(r => dispatch(addRoom(r)))
		if (faculties.length === 0)
			seedFaculties.forEach(f => dispatch(addFaculty(f)))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
