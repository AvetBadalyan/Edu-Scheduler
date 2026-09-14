import type { CreateRoomInput, Room, UpdateRoomInput } from '@/types'
import { createEntityApi } from './createEntityApi'

export const roomsApi = createEntityApi<Room, CreateRoomInput, UpdateRoomInput>('rooms')
