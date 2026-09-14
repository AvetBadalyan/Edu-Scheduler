import { Request, Router } from 'express'
import { AppDataSource } from '../data-source'
import { Schedule } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/auth'

export const schedulesRouter = Router()

schedulesRouter.use(requireAuth)

schedulesRouter.get('/', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const schedules = await AppDataSource.getRepository(Schedule).find({
			where: { userId },
			order: { updatedAt: 'DESC' }
		})
		res.json(schedules)
	} catch (err) {
		next(err)
	}
})

schedulesRouter.get('/latest', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const schedule = await AppDataSource.getRepository(Schedule).findOne({
			where: { userId },
			order: { updatedAt: 'DESC' }
		})
		if (!schedule)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'No schedules found.' })
		res.json(schedule)
	} catch (err) {
		next(err)
	}
})

schedulesRouter.get('/:id', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const schedule = await AppDataSource.getRepository(Schedule).findOneBy({
			id: req.params.id
		})
		if (!schedule)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Schedule not found.' })
		if (schedule.userId !== userId)
			return res
				.status(403)
				.json({ code: 'FORBIDDEN', message: 'Access denied.' })
		res.json(schedule)
	} catch (err) {
		next(err)
	}
})

schedulesRouter.post('/', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const { name, state, stats } = req.body as {
			name: string
			state: object
			stats?: object
		}
		if (!name?.trim())
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'Schedule name is required.'
				})

		const repo = AppDataSource.getRepository(Schedule)
		const schedule = repo.create({
			name,
			userId,
			state: state ?? {},
			stats: stats ?? {}
		})
		await repo.save(schedule)
		res.status(201).json(schedule)
	} catch (err) {
		next(err)
	}
})

schedulesRouter.patch('/:id', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const repo = AppDataSource.getRepository(Schedule)
		const schedule = await repo.findOneBy({ id: req.params.id })
		if (!schedule)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Schedule not found.' })
		if (schedule.userId !== userId)
			return res
				.status(403)
				.json({ code: 'FORBIDDEN', message: 'Access denied.' })
		repo.merge(schedule, req.body)
		await repo.save(schedule)
		res.json(schedule)
	} catch (err) {
		next(err)
	}
})

schedulesRouter.delete('/:id', async (req: Request, res, next) => {
	try {
		const userId = (req as AuthRequest).userId!
		const schedule = await AppDataSource.getRepository(Schedule).findOneBy({
			id: req.params.id
		})
		if (!schedule)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Schedule not found.' })
		if (schedule.userId !== userId)
			return res
				.status(403)
				.json({ code: 'FORBIDDEN', message: 'Access denied.' })
		await AppDataSource.getRepository(Schedule).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
