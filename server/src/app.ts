import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './utils/db'
import { authRouter }      from './routes/auth'
import { lecturersRouter } from './routes/lecturers'
import { roomsRouter }     from './routes/rooms'
import { facultiesRouter } from './routes/faculties'
import { schedulesRouter } from './routes/schedules'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Attach DB connection to every request
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (err) {
    next(err)
  }
})

// Health check (works even when DB is slow)
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth',      authRouter)
app.use('/api/lecturers', lecturersRouter)
app.use('/api/rooms',     roomsRouter)
app.use('/api/faculties', facultiesRouter)
app.use('/api/schedules', schedulesRouter)

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong.' })
})

export default app
