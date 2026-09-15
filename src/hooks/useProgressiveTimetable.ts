/**
 * useProgressiveTimetable — rebuilds the timetable step-by-step during
 * visualization playback, making the grid animate in real time.
 */
import { emptyTimetable } from '@/lib/timetable'
import { selectAllFaculties, selectAllLecturers, selectAllRooms } from '@/store/entitySlice'
import { useAppSelector } from '@/store/hooks'
import {
	selectVizCurrentIndex,
	selectVizPlaybackState,
	selectVizSteps,
} from '@/store/visualizationSlice'
import type {
	ClassAssignment,
	DayOfWeek,
	FacultyWithTimetable,
	HourSlot,
	LecturerWithTimetable,
	RoomWithTimetable,
	ScheduleState,
	Timetable,
} from '@/types'
import { useMemo } from 'react'

function cloneTimetable(t: Timetable): Timetable {
	return {
		1: { ...t[1] },
		2: { ...t[2] },
		3: { ...t[3] },
		4: { ...t[4] },
		5: { ...t[5] },
	}
}

export function useProgressiveTimetable(): ScheduleState | null {
	const steps = useAppSelector(selectVizSteps)
	const currentStepIndex = useAppSelector(selectVizCurrentIndex)
	const playbackState = useAppSelector(selectVizPlaybackState)
	const lecturers = useAppSelector(selectAllLecturers)
	const rooms = useAppSelector(selectAllRooms)
	const faculties = useAppSelector(selectAllFaculties)

	return useMemo(() => {
		if (playbackState === 'idle' || steps.length === 0 || currentStepIndex < 0) return null

		const roomState: Record<string, RoomWithTimetable> = {}
		rooms.forEach(r => {
			roomState[r.id] = { ...r, timetable: emptyTimetable() }
		})

		const lecturerState: Record<string, LecturerWithTimetable> = {}
		lecturers.forEach(l => {
			lecturerState[l.id] = { ...l, timetable: emptyTimetable() }
		})

		const facultyState: Record<string, FacultyWithTimetable> = {}
		faculties.forEach(f => {
			facultyState[f.id] = {
				...f,
				timetable: emptyTimetable(),
			}
		})

		for (let i = 0; i <= currentStepIndex; i++) {
			const step = steps[i]
			if (!step) continue

			if (step.type === 'assign') {
				const { currentLecturer, currentRoom, currentFaculty, currentSubject, currentSlot } = step
				if (!currentLecturer || !currentRoom || !currentFaculty || !currentSubject || !currentSlot)
					continue

				const d = currentSlot.day as DayOfWeek
				const h = currentSlot.hour as HourSlot
				const assignment: ClassAssignment = {
					facultyId: currentFaculty,
					lecturerId: currentLecturer,
					roomId: currentRoom,
					subject: currentSubject,
					timeSlot: { day: d, hour: h },
					isManual: false,
				}

				if (lecturerState[currentLecturer]) {
					lecturerState[currentLecturer] = {
						...lecturerState[currentLecturer],
						timetable: cloneTimetable(lecturerState[currentLecturer].timetable),
					}
					lecturerState[currentLecturer].timetable[d][h] = assignment
				}
				if (roomState[currentRoom]) {
					roomState[currentRoom] = {
						...roomState[currentRoom],
						timetable: cloneTimetable(roomState[currentRoom].timetable),
					}
					roomState[currentRoom].timetable[d][h] = assignment
				}
				if (facultyState[currentFaculty]) {
					facultyState[currentFaculty] = {
						...facultyState[currentFaculty],
						timetable: cloneTimetable(facultyState[currentFaculty].timetable),
					}
					facultyState[currentFaculty].timetable[d][h] = assignment
				}
			} else if (step.type === 'backtrack') {
				const { currentFaculty, currentSubject } = step
				if (!currentFaculty || !currentSubject) continue
				const fac = facultyState[currentFaculty]
				if (!fac) continue

				let foundDay: DayOfWeek | null = null
				let foundHour: HourSlot | null = null
				let foundAssignment: ClassAssignment | null = null

				outer: for (const d of [5, 4, 3, 2, 1] as DayOfWeek[]) {
					for (const h of [4, 3, 2, 1] as HourSlot[]) {
						const a = fac.timetable[d][h]
						if (a && a.subject === currentSubject && a.facultyId === currentFaculty) {
							foundDay = d
							foundHour = h
							foundAssignment = a
							break outer
						}
					}
				}

				if (foundDay && foundHour && foundAssignment) {
					const { lecturerId, roomId } = foundAssignment
					if (lecturerState[lecturerId]) {
						lecturerState[lecturerId] = {
							...lecturerState[lecturerId],
							timetable: cloneTimetable(lecturerState[lecturerId].timetable),
						}
						lecturerState[lecturerId].timetable[foundDay][foundHour] = null
					}
					if (roomState[roomId]) {
						roomState[roomId] = {
							...roomState[roomId],
							timetable: cloneTimetable(roomState[roomId].timetable),
						}
						roomState[roomId].timetable[foundDay][foundHour] = null
					}
					facultyState[currentFaculty] = {
						...facultyState[currentFaculty],
						timetable: cloneTimetable(facultyState[currentFaculty].timetable),
					}
					facultyState[currentFaculty].timetable[foundDay][foundHour] = null
				}
			}
		}

		return {
			rooms: roomState,
			lecturers: lecturerState,
			faculties: facultyState,
		}
	}, [steps, currentStepIndex, playbackState, lecturers, rooms, faculties])
}
