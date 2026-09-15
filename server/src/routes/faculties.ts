import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Faculty } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'
import { getOwnedUniversity } from '../utils/authHelpers'

export const facultiesRouter = Router()
facultiesRouter.use(requireAuth)

facultiesRouter.get('/', async (req: AuthRequest, res, next) => {
	try {
		const universityId = req.query.universityId as string | undefined
		if (!universityId)
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'universityId query param is required.',
			})
		const uni = await getOwnedUniversity(universityId, req.userId!)
		if (!uni) return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		const faculties = await AppDataSource.getRepository(Faculty).find({
			where: { universityId },
			order: { name: 'ASC' },
		})
		res.json(faculties)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.get('/:id', async (req: AuthRequest, res, next) => {
	try {
		const faculty = await AppDataSource.getRepository(Faculty).findOneBy({
			id: req.params.id,
		})
		if (!faculty) return res.status(404).json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
		if (!faculty.universityId || !(await getOwnedUniversity(faculty.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		res.json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.post('/', async (req: AuthRequest, res, next) => {
	try {
		const { name, syllabus, students, universityId } = req.body as {
			name: string
			syllabus: object[]
			students?: object[]
			universityId?: string
		}
		if (!name?.trim())
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'Faculty name is required.',
			})
		if (!Array.isArray(syllabus) || !syllabus.length)
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'Syllabus must have at least one entry.',
			})

		const repo = AppDataSource.getRepository(Faculty)
		const faculty = repo.create({
			name,
			syllabus,
			students: students ?? [],
			universityId: universityId ?? null,
		})
		await repo.save(faculty)
		res.status(201).json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.patch('/:id', async (req: AuthRequest, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Faculty)
		const faculty = await repo.findOneBy({ id: req.params.id })
		if (!faculty) return res.status(404).json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
		if (!faculty.universityId || !(await getOwnedUniversity(faculty.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		delete req.body.universityId
		repo.merge(faculty, req.body)
		await repo.save(faculty)
		res.json(faculty)
	} catch (err) {
		next(err)
	}
})

facultiesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
	try {
		const faculty = await AppDataSource.getRepository(Faculty).findOneBy({
			id: req.params.id,
		})
		if (!faculty) return res.status(404).json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
		if (!faculty.universityId || !(await getOwnedUniversity(faculty.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		await AppDataSource.getRepository(Faculty).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
