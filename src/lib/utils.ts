import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind CSS class names with conflict resolution.
 * Used by all shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Generates a short unique id (timestamp + random). Optional prefix, e.g.
 * uid('toast') → "toast-1712...-a1b2c3". Not cryptographically secure — fine
 * for client-side keys.
 */
export function uid(prefix?: string): string {
	const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
	return prefix ? `${prefix}-${id}` : id
}
