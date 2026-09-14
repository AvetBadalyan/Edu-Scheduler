import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Lecturer } from '../entities'
import { requireAuth } from '../middleware/auth'

export const lecturersRouter = Router()

lecturersRouter.use(requireAuth)

// GET /api/lecturers
lecturersRouter.get('/', async (_req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Lecturer)
		const lecturers = await repo.find({ order: { surname: 'ASC' } })
		res.json(lecturers)
	} catch (err) {
		next(err)
	}
})

// GET /api/lecturers/:id
lecturersRouter.get('/:id', async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Lecturer)
		const lecturer = await repo.findOneBy({ id: req.params.id })
		if (!lecturer)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
		res.json(lecturer)
	} catch (err) {
		next(err)
	}
})

// POST /api/lecturers
lecturersRouter.post('/', async (req, res, next) => {
	try {
		const { name, surname, specialties, imageUrl } = req.body as {
			name: string
			surname: string
			specialties: string[]
			imageUrl?: string
		}
		if (!name?.trim() || !surname?.trim())
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'name and surname are required.'
				})
		if (!Array.isArray(specialties) || !specialties.length)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'At least one specialty is required.'
				})

		const repo = AppDataSource.getRepository(Lecturer)
		const lecturer = repo.create({
			name,
			surname,
			specialties,
			imageUrl: imageUrl ?? null
		})
		await repo.save(lecturer)
		res.status(201).json(lecturer)
	} catch (err) {
		next(err)
	}
})

// PATCH /api/lecturers/:id
lecturersRouter.patch('/:id', async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Lecturer)
		const lecturer = await repo.findOneBy({ id: req.params.id })
		if (!lecturer)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
		repo.merge(lecturer, req.body)
		await repo.save(lecturer)
		res.json(lecturer)
	} catch (err) {
		next(err)
	}
})

// DELETE /api/lecturers/:id
lecturersRouter.delete('/:id', async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Lecturer)
		await repo.delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
