/**
 * Connection caching — same pattern as the Music app.
 * One connection per process instance, cached promise to handle cold starts.
 */
import type { DataSource } from 'typeorm'
import { AppDataSource } from '../data-source'

let connectionPromise: Promise<DataSource> | undefined

export async function connectToDatabase(): Promise<void> {
	if (!connectionPromise) {
		connectionPromise = AppDataSource.initialize()
		connectionPromise.catch(() => {
			connectionPromise = undefined
		})
	}
	await connectionPromise
}
