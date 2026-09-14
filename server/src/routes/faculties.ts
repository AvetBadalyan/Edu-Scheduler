import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Faculty } from '../entities'
import { requireAuth } from '../middleware/auth'

export const facultiesRouter = Router()

facultiesRouter.use(requireAuth)

facultiesRouter.get('/', async (_req, res, next) => {
	try {
		const faculties = await AppDataSource.getRepository(Faculty).find({
			order: { name: 'ASC' }
		})
		res.json(faculties)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.get('/:id', async (req, res, next) => {
	try {
		const faculty = await AppDataSource.getRepository(Faculty).findOneBy({
			id: req.params.id
		})
		if (!faculty)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
		res.json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.post('/', async (req, res, next) => {
	try {
		const { name, syllabus, students } = req.body as {
			name: string
			syllabus: object[]
			students: object[]
		}
		if (!name?.trim())
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'Faculty name is required.'
				})
		if (!Array.isArray(syllabus) || !syllabus.length)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'Syllabus must have at least one entry.'
				})

		const repo = AppDataSource.getRepository(Faculty)
		const faculty = repo.create({ name, syllabus, students: students ?? [] })
		await repo.save(faculty)
		res.status(201).json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.patch('/:id', async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Faculty)
		const faculty = await repo.findOneBy({ id: req.params.id })
		if (!faculty)
			return res
				.status(404)
				.json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
		repo.merge(faculty, req.body)
		await repo.save(faculty)
		res.json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.delete('/:id', async (req, res, next) => {
	try {
		await AppDataSource.getRepository(Faculty).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
