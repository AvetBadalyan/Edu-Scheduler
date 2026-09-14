import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Lecturer } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'

export const lecturersRouter = Router()
lecturersRouter.use(requireAuth)

// GET /api/lecturers?universityId=...
lecturersRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const universityId = req.query.universityId as string | undefined
    const repo = AppDataSource.getRepository(Lecturer)
    const lecturers = universityId
      ? await repo.find({ where: { universityId }, order: { surname: 'ASC' } })
      : await repo.find({ order: { surname: 'ASC' } })
    res.json(lecturers)
  } catch (err) { next(err) }
})

lecturersRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const lecturer = await AppDataSource.getRepository(Lecturer).findOneBy({ id: req.params.id })
    if (!lecturer) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
    res.json(lecturer)
  } catch (err) { next(err) }
})

lecturersRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, surname, specialties, imageUrl, universityId } = req.body as {
      name: string; surname: string; specialties: string[]
      imageUrl?: string; universityId?: string
    }
    if (!name?.trim() || !surname?.trim())
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'name and surname are required.' })
    if (!Array.isArray(specialties) || !specialties.length)
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'At least one specialty is required.' })

    const repo = AppDataSource.getRepository(Lecturer)
    const lecturer = repo.create({ name, surname, specialties, imageUrl: imageUrl ?? null, universityId: universityId ?? null })
    await repo.save(lecturer)
    res.status(201).json(lecturer)
  } catch (err) { next(err) }
})

lecturersRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const repo = AppDataSource.getRepository(Lecturer)
    const lecturer = await repo.findOneBy({ id: req.params.id })
    if (!lecturer) return res.status(404).json({ code: 'NOT_FOUND', message: 'Lecturer not found.' })
    repo.merge(lecturer, req.body)
    await repo.save(lecturer)
    res.json(lecturer)
  } catch (err) { next(err) }
})

lecturersRouter.delete('/:id', async (_req: AuthRequest, res, next) => {
  try {
    await AppDataSource.getRepository(Lecturer).delete(_req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
