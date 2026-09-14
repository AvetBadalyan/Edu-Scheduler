import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Faculty } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'

export const facultiesRouter = Router()
facultiesRouter.use(requireAuth)

facultiesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const universityId = req.query.universityId as string | undefined
    const repo = AppDataSource.getRepository(Faculty)
    const faculties = universityId
      ? await repo.find({ where: { universityId }, order: { name: 'ASC' } })
      : await repo.find({ order: { name: 'ASC' } })
    res.json(faculties)
  } catch (err) { next(err) }
})

facultiesRouter.get('/:id', async (_req: AuthRequest, res, next) => {
  try {
    const faculty = await AppDataSource.getRepository(Faculty).findOneBy({ id: _req.params.id })
    if (!faculty) return res.status(404).json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
    res.json(faculty)
  } catch (err) { next(err) }
})

facultiesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, syllabus, students, universityId } = req.body as {
      name: string; syllabus: object[]; students?: object[]; universityId?: string
    }
    if (!name?.trim())
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Faculty name is required.' })
    if (!Array.isArray(syllabus) || !syllabus.length)
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Syllabus must have at least one entry.' })

    const repo = AppDataSource.getRepository(Faculty)
    const faculty = repo.create({ name, syllabus, students: students ?? [], universityId: universityId ?? null })
    await repo.save(faculty)
    res.status(201).json(faculty)
  } catch (err) { next(err) }
})

facultiesRouter.patch('/:id', async (_req: AuthRequest, res, next) => {
  try {
    const repo = AppDataSource.getRepository(Faculty)
    const faculty = await repo.findOneBy({ id: _req.params.id })
    if (!faculty) return res.status(404).json({ code: 'NOT_FOUND', message: 'Faculty not found.' })
    repo.merge(faculty, _req.body)
    await repo.save(faculty)
    res.json(faculty)
  } catch (err) { next(err) }
})

facultiesRouter.delete('/:id', async (_req: AuthRequest, res, next) => {
  try {
    await AppDataSource.getRepository(Faculty).delete(_req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
