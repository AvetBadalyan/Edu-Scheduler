/**
 * useSeedData — populates the entity store with demo data on first mount.
 *
 * Runs once per session. If the store already has data (e.g. the user added
 * their own), it does nothing.
 */
import { useEffect } from "react"
import { useEntityStore } from "@/stores/entityStore"
import { seedFaculties, seedLecturers, seedRooms } from "@/lib/seedData"

export function useSeedData(): void {
  useEffect(() => {
    const { lecturers, rooms, faculties, addLecturer, addRoom, addFaculty } =
      useEntityStore.getState()

    if (lecturers.length === 0) seedLecturers.forEach(addLecturer)
    if (rooms.length === 0) seedRooms.forEach(addRoom)
    if (faculties.length === 0) seedFaculties.forEach(addFaculty)
  }, [])
}
