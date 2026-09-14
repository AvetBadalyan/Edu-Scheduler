/**
 * ConfirmDialog — simple confirmation modal for destructive actions.
 */
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	confirmLabel?: string
	onConfirm: () => void
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Delete',
	onConfirm,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent title={title}>
				<div className="flex flex-col items-center text-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-red-100">
						<AlertTriangle className="size-6 text-red-600" aria-hidden />
					</div>
					<div>
						<h2 className="text-lg font-bold text-gray-900">{title}</h2>
						<p className="mt-1 text-sm text-gray-500">{description}</p>
					</div>
					<div className="flex gap-3 w-full mt-2">
						<Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleConfirm} className="flex-1">
							{confirmLabel}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ConfirmDialog
