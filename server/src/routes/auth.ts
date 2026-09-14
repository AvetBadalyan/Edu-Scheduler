import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from '../entities'

export const authRouter = Router()

const ACCESS_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production'
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN ?? '15m'

function signToken(userId: string, email: string): string {
	return jwt.sign({ userId, email }, ACCESS_SECRET, {
		expiresIn: ACCESS_EXPIRES
	} as jwt.SignOptions)
}

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
	try {
		const { email, password, name } = req.body as {
			email: string
			password: string
			name: string
		}
		if (!email || !password || !name)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'email, password and name are required.'
				})
		if (password.length < 8)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'Password must be at least 8 characters.'
				})

		const repo = AppDataSource.getRepository(User)
		const existing = await repo.findOneBy({ email: email.toLowerCase() })
		if (existing)
			return res
				.status(409)
				.json({
					code: 'EMAIL_TAKEN',
					message: 'An account with this email already exists.'
				})

		const passwordHash = await bcrypt.hash(password, 12)
		const user = repo.create({ email: email.toLowerCase(), passwordHash, name })
		await repo.save(user)

		const token = signToken(user.id, user.email)
		res
			.status(201)
			.json({
				accessToken: token,
				user: { id: user.id, email: user.email, name: user.name }
			})
	} catch (err) {
		next(err)
	}
})

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body as { email: string; password: string }
		if (!email || !password)
			return res
				.status(400)
				.json({
					code: 'VALIDATION_ERROR',
					message: 'email and password are required.'
				})

		const user = await AppDataSource.getRepository(User).findOneBy({
			email: email.toLowerCase()
		})
		const match = user
			? await bcrypt.compare(password, user.passwordHash)
			: false
		if (!user || !match)
			return res
				.status(401)
				.json({
					code: 'INVALID_CREDENTIALS',
					message: 'Invalid email or password.'
				})

		const token = signToken(user.id, user.email)
		res.json({
			accessToken: token,
			user: { id: user.id, email: user.email, name: user.name }
		})
	} catch (err) {
		next(err)
	}
})

// POST /api/auth/logout — stateless JWT; client discards the token
authRouter.post('/logout', (_req, res) => {
	res.json({ message: 'Logged out.' })
})
