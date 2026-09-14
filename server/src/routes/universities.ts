/**
 * University routes — scoped to the authenticated user (ownerId = userId).
 *
 * GET  /api/universities        — list universities owned by current user
 * POST /api/universities        — create a new university
 * GET  /api/universities/:id    — get one (must be owner)
 * PATCH /api/universities/:id   — rename (must be owner)
 * DELETE /api/universities/:id  — delete + cascade (must be owner)
 */
import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { University } from '../entities'
import { AuthRequest, requireAuth } from '../middleware/supabaseAuth'

export const universitiesRouter = Router()
universitiesRouter.use(requireAuth)

universitiesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const universities = await AppDataSource.getRepository(University).find({
      where: { ownerId: req.userId! },
      order: { createdAt: 'ASC' },
    })
    res.json(universities)
  } catch (err) { next(err) }
})

universitiesRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const university = await AppDataSource.getRepository(University).findOneBy({ id: req.params.id })
    if (!university) return res.status(404).json({ code: 'NOT_FOUND', message: 'University not found.' })
    if (university.ownerId !== req.userId)
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
    res.json(university)
  } catch (err) { next(err) }
})

universitiesRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.body as { name: string }
    if (!name?.trim())
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'University name is required.' })

    const repo = AppDataSource.getRepository(University)
    const university = repo.create({ name: name.trim(), ownerId: req.userId! })
    await repo.save(university)
    res.status(201).json(university)
  } catch (err) { next(err) }
})

universitiesRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const repo = AppDataSource.getRepository(University)
    const university = await repo.findOneBy({ id: req.params.id })
    if (!university) return res.status(404).json({ code: 'NOT_FOUND', message: 'University not found.' })
    if (university.ownerId !== req.userId)
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
    if (req.body.name) university.name = req.body.name.trim()
    await repo.save(university)
    res.json(university)
  } catch (err) { next(err) }
})

universitiesRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const repo = AppDataSource.getRepository(University)
    const university = await repo.findOneBy({ id: req.params.id })
    if (!university) return res.status(404).json({ code: 'NOT_FOUND', message: 'University not found.' })
    if (university.ownerId !== req.userId)
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' })
    await repo.delete(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
