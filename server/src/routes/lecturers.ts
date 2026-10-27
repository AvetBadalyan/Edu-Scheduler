import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Lecturer } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'
import { getOwnedUniversity } from '../utils/authHelpers'

export const lecturersRouter = Router()
lecturersRouter.use(requireAuth)

// GET /api/lecturers?universityId=...
lecturersRouter.get('/', async (req: AuthRequest, res, next) => {
	try {
		const universityId = req.query.universityId as string | undefined
		if (!universityId)
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'universityId query param is required.',
			})
		const uni = await getOwnedUniversity(universityId, req.userId!)
		if (!uni) return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		const lecturers = await AppDataSource.getRepository(Lecturer).find({
			where: { universityId },
			order: { surname: 'ASC' },
		})
		res.json(lecturers)
	} catch (err) {
		next(err)
	}
})

lecturersRouter.get('/:id', async (req: AuthRequest, res, next) => {
	try {
		const lecturer = await AppDataSource.getRepository(Lecturer).findOneBy({
			id: req.params.id,
		})
		if (!lecturer)
			return res.status(404).json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
		if (!lecturer.universityId || !(await getOwnedUniversity(lecturer.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		res.json(lecturer)
	} catch (err) {
		next(err)
	}
})

lecturersRouter.post('/', async (req: AuthRequest, res, next) => {
	try {
		const { name, surname, specialties, imageUrl, universityId } = req.body as {
			name: string
			surname: string
			specialties: string[]
			imageUrl?: string
			universityId?: string
		}
		if (!name?.trim() || !surname?.trim())
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'name and surname are required.',
			})
		if (!Array.isArray(specialties) || !specialties.length)
			return res.status(400).json({
				code: 'VALIDATION_ERROR',
				message: 'At least one specialty is required.',
			})

		const repo = AppDataSource.getRepository(Lecturer)
		const lecturer = repo.create({
			name,
			surname,
			specialties,
			imageUrl: imageUrl ?? null,
			universityId: universityId ?? null,
		})
		await repo.save(lecturer)
		res.status(201).json(lecturer)
	} catch (err) {
		next(err)
	}
})

lecturersRouter.patch('/:id', async (req: AuthRequest, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Lecturer)
		const lecturer = await repo.findOneBy({ id: req.params.id })
		if (!lecturer)
			return res.status(404).json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
		if (!lecturer.universityId || !(await getOwnedUniversity(lecturer.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		// Whitelist updatable fields so a client can't reassign ownership
		// (universityId) or overwrite id / timestamps via the request body.
		const { name, surname, specialties, imageUrl } = req.body as {
			name?: string
			surname?: string
			specialties?: string[]
			imageUrl?: string | null
		}
		if (name !== undefined) {
			if (!name.trim())
				return res
					.status(400)
					.json({ code: 'VALIDATION_ERROR', message: 'name cannot be empty.' })
			lecturer.name = name
		}
		if (surname !== undefined) {
			if (!surname.trim())
				return res
					.status(400)
					.json({ code: 'VALIDATION_ERROR', message: 'surname cannot be empty.' })
			lecturer.surname = surname
		}
		if (specialties !== undefined) {
			if (!Array.isArray(specialties) || !specialties.length)
				return res
					.status(400)
					.json({ code: 'VALIDATION_ERROR', message: 'At least one specialty is required.' })
			lecturer.specialties = specialties
		}
		if (imageUrl !== undefined) lecturer.imageUrl = imageUrl
		await repo.save(lecturer)
		res.json(lecturer)
	} catch (err) {
		next(err)
	}
})

lecturersRouter.delete('/:id', async (req: AuthRequest, res, next) => {
	try {
		const lecturer = await AppDataSource.getRepository(Lecturer).findOneBy({
			id: req.params.id,
		})
		if (!lecturer)
			return res.status(404).json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
		if (!lecturer.universityId || !(await getOwnedUniversity(lecturer.universityId, req.userId!)))
			return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
		await AppDataSource.getRepository(Lecturer).delete(req.params.id)
		res.status(204).send()
	} catch (err) {
		next(err)
	}
})
