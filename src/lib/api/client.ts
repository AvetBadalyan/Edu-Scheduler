/**
 * API client — typed fetch wrapper for the Express backend.
 *
 * Automatically attaches the Supabase access token from the current session.
 * In demo mode (no real session) API calls are skipped at the call site.
 */
import { supabase } from '@/lib/supabase'
import type { ApiError } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function getToken(): Promise<string | null> {
	const { data } = await supabase.auth.getSession()
	return data.session?.access_token ?? null
}

export class ApiRequestError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly status: number
	) {
		super(message)
		this.name = 'ApiRequestError'
	}
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
	const token = await getToken()
	const headers: Record<string, string> = { 'Content-Type': 'application/json' }
	if (token) headers['Authorization'] = `Bearer ${token}`

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})

	if (res.status === 204) return undefined as T

	const json = await res.json().catch(() => ({ code: 'PARSE_ERROR', message: res.statusText }))

	if (!res.ok) {
		const err = json as ApiError
		throw new ApiRequestError(err.code ?? 'UNKNOWN', err.message ?? 'Request failed', res.status)
	}

	return json as T
}

export const api = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
	patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
	delete: <T>(path: string) => request<T>('DELETE', path),
}
