import { Pencil, Trash2 } from 'lucide-react'

interface CardActionsProps {
	onEdit?: () => void
	onDelete?: () => void
	/** Used for the buttons' accessible labels, e.g. "room 101" or a faculty name. */
	label: string
}

/**
 * Edit + Delete button pair shown at the bottom of a Room or Faculty card.
 * Kept in one place so both cards stay visually identical.
 */
export function CardActions({ onEdit, onDelete, label }: CardActionsProps) {
	return (
		<div className="mt-auto flex gap-2 pt-1">
			{onEdit && (
				<button
					onClick={onEdit}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
					aria-label={`Edit ${label}`}
				>
					<Pencil className="size-3" aria-hidden />
					Edit
				</button>
			)}
			{onDelete && (
				<button
					onClick={onDelete}
					className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
					aria-label={`Delete ${label}`}
				>
					<Trash2 className="size-3.5" aria-hidden />
				</button>
			)}
		</div>
	)
}
