/**
 * Vercel serverless entry point.
 *
 * Vercel detects files in /api and invokes the default export with (req, res).
 * Express apps are already that shape, so the entire API runs as one function.
 * vercel.json rewrites all /api/* requests here.
 *
 * The server/src/app.ts does NOT call listen() — Vercel owns the socket.
 */
import 'dotenv/config'
import 'reflect-metadata'
import app from '../server/src/app'

export default app
