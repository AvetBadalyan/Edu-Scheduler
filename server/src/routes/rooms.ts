import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Room } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'

export const roomsRouter = Router()
roomsRouter.use(requireAuth)

roomsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const universityId = req.query.universityId as string | undefined
    const repo = AppDataSource.getRepository(Room)
    const rooms = universityId
      ? await repo.find({ where: { universityId }, order: { number: 'ASC' } })
      : await repo.find({ order: { number: 'ASC' } })
    res.json(rooms)
  } catch (err) { next(err) }
})

roomsRouter.get('/:id', async (_req: AuthRequest, res, next) => {
  try {
    const room = await AppDataSource.getRepository(Room).findOneBy({ id: _req.params.id })
    if (!room) return res.status(404).json({ code: 'NOT_FOUND', message: 'Room not found.' })
    res.json(room)
  } catch (err) { next(err) }
})

roomsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { number, capacity, universityId } = req.body as {
      number: string; capacity: number; universityId?: string
    }
    if (!number?.trim())
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Room number is required.' })
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500)
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Capacity must be between 1 and 500.' })

    const repo = AppDataSource.getRepository(Room)
    const room = repo.create({ number, capacity, universityId: universityId ?? null })
    await repo.save(room)
    res.status(201).json(room)
  } catch (err) { next(err) }
})

roomsRouter.patch('/:id', async (_req: AuthRequest, res, next) => {
  try {
    const repo = AppDataSource.getRepository(Room)
    const room = await repo.findOneBy({ id: _req.params.id })
    if (!room) return res.status(404).json({ code: 'NOT_FOUND', message: 'Room not found.' })
    repo.merge(room, _req.body)
    await repo.save(room)
    res.json(room)
  } catch (err) { next(err) }
})

roomsRouter.delete('/:id', async (_req: AuthRequest, res, next) => {
  try {
    await AppDataSource.getRepository(Room).delete(_req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
