import cors from 'cors'
import express from 'express'
import 'reflect-metadata'
import { facultiesRouter } from './routes/faculties'
import { lecturersRouter } from './routes/lecturers'
import { roomsRouter } from './routes/rooms'
import { schedulesRouter } from './routes/schedules'
import { universitiesRouter } from './routes/universities'
import { connectToDatabase } from './utils/db'

const app = express()

app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
		credentials: true,
	})
)
app.use(express.json())

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
