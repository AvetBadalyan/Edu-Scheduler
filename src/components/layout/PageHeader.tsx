/**
 * PageHeader — page title + optional description + action buttons.
 * Consistent across all pages.
 */
import type { ReactNode } from 'react'

interface PageHeaderProps {
	title: string
	description?: string
	actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between animate-fade-up">
			<div>
				<h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
				{description && <p className="mt-1.5 text-sm text-gray-500 max-w-xl">{description}</p>}
			</div>
			{actions && <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">{actions}</div>}
		</div>
	)
}
