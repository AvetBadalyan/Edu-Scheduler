import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Room } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'
import { getOwnedUniversity } from '../utils/authHelpers'

export const roomsRouter = Router()
roomsRouter.use(requireAuth)

roomsRouter.get('/', async (req: AuthRequest, res, next) => {
	try {
		const universityId = req.query.universityId as string | undefined
		if (!universityId)
			return res.status(403).json({
				code: 'FORBIDDEN',
				message: 'universityId query param is required.',
			})
		const uni = await getOwnedUniversity(universityId, req.userId!)
		if (!uni) return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		const rooms = await AppDataSource.getRepository(Room).find({
			where: { universityId },
			order: { number: 'ASC' },
		})
		res.json(rooms)
	} catch (err) {
		next(err)
	}
})

roomsRouter.get('/:id', async (req: AuthRequest, res, next) => {
	try {
		const room = await AppDataSource.getRepository(Room).findOneBy({
			id: req.params.id,
		})
		if (!room) return res.status(404).json({ code: 'NOT_FOUND', message: 'Room not found.' })
		if (!room.universityId || !(await getOwnedUniversity(room.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		res.json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.post('/', async (req: AuthRequest, res, next) => {
	try {
		const { number, capacity, universityId } = req.body as {
			number: string
			capacity: number
			universityId?: string
		}
		if (!number?.trim())
			return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Room number is required.' })
		if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500)
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'Capacity must be between 1 and 500.',
			})

		const repo = AppDataSource.getRepository(Room)
		const room = repo.create({
			number,
			capacity,
			universityId: universityId ?? null,
		})
		await repo.save(room)
		res.status(201).json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.patch('/:id', async (req: AuthRequest, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Room)
		const room = await repo.findOneBy({ id: req.params.id })
		if (!room) return res.status(404).json({ code: 'NOT_FOUND', message: 'Room not found.' })
		if (!room.universityId || !(await getOwnedUniversity(room.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		delete req.body.universityId
		repo.merge(room, req.body)
		await repo.save(room)
		res.json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
	try {
		const room = await AppDataSource.getRepository(Room).findOneBy({
			id: req.params.id,
		})
		if (!room) return res.status(404).json({ code: 'NOT_FOUND', message: 'Room not found.' })
		if (!room.universityId || !(await getOwnedUniversity(room.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		await AppDataSource.getRepository(Room).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
