import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import 'reflect-metadata'
import { AppDataSource } from './data-source'
import { University } from './entities'
import { facultiesRouter } from './routes/faculties'
import { lecturersRouter } from './routes/lecturers'
import { roomsRouter } from './routes/rooms'
import { schedulesRouter } from './routes/schedules'
import { universitiesRouter } from './routes/universities'
import { connectToDatabase } from './utils/db'

const app = express()

// On Vercel the app runs behind a proxy; trust it so rate-limit / IPs work.
app.set('trust proxy', 1)

// Security headers. This is a JSON API (no HTML served), so the default
// restrictive CSP is fine and won't interfere with the SPA's own assets.
app.use(helmet())

app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
		credentials: true,
	})
)

// Cap request body size — these endpoints only ever receive small JSON.
app.use(express.json({ limit: '100kb' }))

// Rate limit all API routes to blunt abuse / brute force of auth-protected
// endpoints. 300 requests / 15 min per IP is generous for normal UI use.
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
})
app.use('/api', apiLimiter)

// Health check — MUST be before the DB middleware so it always responds.
// Registered under both paths: locally the server is hit at /healthz, while
// on Vercel every request keeps its /api prefix (rewrite → the function).
app.get(['/healthz', '/api/healthz'], (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Ensure DB is connected before API routes
app.use('/api', async (_req, _res, next) => {
	try {
		await connectToDatabase()
		next()
	} catch (err) {
		next(err)
	}
})

// Keep-alive — unlike /healthz above, this deliberately runs a tiny read-only
// query against the database so an uptime monitor (e.g. UptimeRobot) pinging it
// keeps the Supabase project from pausing on the free tier. It sits AFTER the
// DB-connection middleware so the query actually touches Postgres.
// count() on the universities table reads an index/metadata only and writes
// nothing. No auth so the monitor can reach it without credentials.
// Exposed as /api/health too so a single monitor URL convention works across
// apps; /api/healthz above stays the DB-free liveness probe.
app.get(['/api/keep-alive', '/api/health'], async (_req, res) => {
	try {
		await AppDataSource.getRepository(University).count()
		res.status(200).json({ ok: true })
	} catch (err) {
		res
			.status(500)
			.json({ ok: false, error: err instanceof Error ? err.message : 'Database unreachable' })
	}
})

// Routes
app.use('/api/universities', universitiesRouter)
app.use('/api/lecturers', lecturersRouter)
app.use('/api/rooms', roomsRouter)
app.use('/api/faculties', facultiesRouter)
app.use('/api/schedules', schedulesRouter)

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err)
	res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong.' })
})

export default app
