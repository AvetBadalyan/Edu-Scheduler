import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import 'reflect-metadata'
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
