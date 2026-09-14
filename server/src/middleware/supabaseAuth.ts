/**
 * supabaseAuth — validates Supabase JWTs on protected routes.
 *
 * The Supabase client is created lazily (on first request) so that
 * dotenv.config() has already run before we read the env vars.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { NextFunction, Request, Response } from 'express'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
	if (!_client) {
		const url = process.env.SUPABASE_URL
		const key = process.env.SUPABASE_ANON_KEY
		if (!url || !key)
			throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in server/.env')
		_client = createClient(url, key)
	}
	return _client
}

export interface AuthRequest extends Request {
	userId?: string
	userEmail?: string
	universityId?: string
}

export async function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	const header = req.headers.authorization
	if (!header?.startsWith('Bearer ')) {
		res.status(401).json({ code: 'NO_TOKEN', message: 'Authentication required.' })
		return
	}

	const token = header.slice(7)
	try {
		const { data, error } = await getClient().auth.getUser(token)
		if (error || !data.user) {
			res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired session.' })
			return
		}
		req.userId = data.user.id
		req.userEmail = data.user.email ?? undefined
		next()
	} catch (err) {
		next(err)
	}
}
