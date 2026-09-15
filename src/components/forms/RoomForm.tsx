import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { emptyTimetable } from '@/lib/timetable'
import { capacityHint } from '@/lib/ui/capacityTiers'
import { ERROR, FIELD } from '@/lib/ui/formStyles'
import { cn } from '@/lib/utils'
import type { CreateRoomInput } from '@/types'
import { AlertCircle, DoorOpen, Hash, Users } from 'lucide-react'
import { useState } from 'react'

interface RoomFormProps {
	mode: 'create' | 'edit'
	initialData?: Partial<CreateRoomInput>
	onSubmit: (data: CreateRoomInput) => Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

export function RoomForm({
	mode,
	initialData,
	onSubmit,
	onCancel,
	isLoading = false,
}: RoomFormProps) {
	const [number, setNumber] = useState(initialData?.number ?? '')
	const [capacity, setCapacity] = useState(initialData?.capacity?.toString() ?? '')
	const [errors, setErrors] = useState<Record<string, string>>({})

	const cap = parseInt(capacity, 10)
	const tier = !isNaN(cap) && cap >= 1 ? capacityHint(cap) : null

	const validate = () => {
		const e: Record<string, string> = {}
		if (!number.trim()) e.number = 'Room number is required.'
		if (isNaN(cap) || cap < 1 || cap > 500) e.capacity = 'Capacity must be between 1 and 500.'
		setErrors(e)
		return !Object.keys(e).length
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		await onSubmit({
			number: number.trim(),
			capacity: cap,
			availability: emptyTimetable(),
		})
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
					<DoorOpen className="size-5" />
				</div>
				<div>
					<h2 className="text-lg font-bold text-gray-900">
						{mode === 'create' ? 'Add Room' : 'Edit Room'}
					</h2>
					<p className="text-xs text-gray-500">Register a classroom</p>
				</div>
			</div>

			{/* Room number */}
			<div className={FIELD}>
				<Label
					htmlFor="rf-num"
					className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
				>
					Room Number
				</Label>
				<div className="relative">
					<Hash className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
					<Input
						id="rf-num"
						value={number}
						onChange={e => setNumber(e.target.value)}
						className={cn('pl-9', errors.number && 'border-red-400')}
						placeholder="101"
						autoFocus
						aria-invalid={!!errors.number}
					/>
				</div>
				{errors.number && (
					<p className={ERROR} role="alert">
						<AlertCircle className="size-3" />
						{errors.number}
					</p>
				)}
			</div>

			{/* Capacity */}
			<div className={FIELD}>
				<Label
					htmlFor="rf-cap"
					className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
				>
					Capacity (seats)
				</Label>
				<div className="flex gap-2 items-start">
					<div className="relative flex-1">
						<Users className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
						<Input
							id="rf-cap"
							type="number"
							min={1}
							max={500}
							value={capacity}
							onChange={e => setCapacity(e.target.value)}
							className={cn('pl-9', errors.capacity && 'border-red-400')}
							placeholder="30"
							aria-invalid={!!errors.capacity}
						/>
					</div>
					{tier && (
						<span className={cn('shrink-0 rounded-xl px-3 py-2 text-xs font-bold', tier.color)}>
							{tier.label}
						</span>
					)}
				</div>
				{errors.capacity && (
					<p className={ERROR} role="alert">
						<AlertCircle className="size-3" />
						{errors.capacity}
					</p>
				)}
			</div>

			<div className="h-px bg-gray-100" />

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Saving…' : mode === 'create' ? 'Add Room' : 'Save Changes'}
				</Button>
			</div>
		</form>
	)
}
