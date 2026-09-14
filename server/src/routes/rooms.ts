import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Room } from '../entities'
import { requireAuth } from '../middleware/auth'

export const roomsRouter = Router()

roomsRouter.use(requireAuth)

roomsRouter.get('/', async (_req, res, next) => {
	try {
		const rooms = await AppDataSource.getRepository(Room).find({
			order: { capacity: 'ASC' }
		})
		res.json(rooms)
	} catch (err) {
		next(err)
	}
})

roomsRouter.get('/:id', async (req, res, next) => {
	try {
		const room = await AppDataSource.getRepository(Room).findOneBy({
			id: req.params.id
		})
		if (!room)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Room not found.' })
		res.json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.post('/', async (req, res, next) => {
	try {
		const { number, capacity } = req.body as {
			number: string
			capacity: number
		}
		if (!number?.trim())
			return res
				.status(400)
				.json({ code: 'VALIDATION_ERROR', message: 'Room number is required.' })
		if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'Capacity must be between 1 and 500.'
				})

		const repo = AppDataSource.getRepository(Room)
		const existing = await repo.findOneBy({ number })
		if (existing)
			return res
				.status(409)
				.json({ code: 'CONFLICT', message: `Room "${number}" already exists.` })

		const room = repo.create({ number, capacity })
		await repo.save(room)
		res.status(201).json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.patch('/:id', async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Room)
		const room = await repo.findOneBy({ id: req.params.id })
		if (!room)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Room not found.' })
		repo.merge(room, req.body)
		await repo.save(room)
		res.json(room)
	} catch (err) {
		next(err)
	}
})

roomsRouter.delete('/:id', async (req, res, next) => {
	try {
		await AppDataSource.getRepository(Room).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
