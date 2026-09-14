import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
	userId?: string
	userEmail?: string
}

const SECRET = process.env.JWT_SECRET ?? 'change-me-in-production'

export function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	const header = req.headers.authorization
	if (!header?.startsWith('Bearer '))
		return res
			.status(401)
			.json({ code: 'NO_TOKEN', message: 'Authentication required.' })

	const token = header.slice(7)
	try {
		const payload = jwt.verify(token, SECRET) as {
			userId: string
			email: string
		}
		req.userId = payload.userId
		req.userEmail = payload.email
		next()
	} catch {
		res
			.status(401)
			.json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token.' })
	}
}
