import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { CreateLecturerInput } from '@/types'
import { AlertCircle, Image, Tag, User, Users } from 'lucide-react'
import { useState } from 'react'

interface LecturerFormProps {
	mode: 'create' | 'edit'
	initialData?: Partial<CreateLecturerInput>
	onSubmit: (data: CreateLecturerInput) => Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

const FIELD = 'flex flex-col gap-1.5'
const ERROR = 'flex items-center gap-1 text-xs text-red-600'

export function LecturerForm({
	mode,
	initialData,
	onSubmit,
	onCancel,
	isLoading = false,
}: LecturerFormProps) {
	const [name, setName] = useState(initialData?.name ?? '')
	const [surname, setSurname] = useState(initialData?.surname ?? '')
	const [specialtiesInput, setSpecialties] = useState(initialData?.specialties?.join(', ') ?? '')
	const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validate = () => {
		const e: Record<string, string> = {}
		if (!name.trim()) e.name = 'First name is required.'
		if (!surname.trim()) e.surname = 'Last name is required.'
		if (
			!specialtiesInput
				.split(',')
				.map(s => s.trim())
				.filter(Boolean).length
		)
			e.specialties = 'At least one specialty is required.'
		setErrors(e)
		return !Object.keys(e).length
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		await onSubmit({
			name: name.trim(),
			surname: surname.trim(),
			specialties: specialtiesInput
				.split(',')
				.map(s => s.trim())
				.filter(Boolean),
			imageUrl: imageUrl.trim() || undefined,
			availability: {
				1: { 1: null, 2: null, 3: null, 4: null },
				2: { 1: null, 2: null, 3: null, 4: null },
				3: { 1: null, 2: null, 3: null, 4: null },
				4: { 1: null, 2: null, 3: null, 4: null },
				5: { 1: null, 2: null, 3: null, 4: null },
			} as CreateLecturerInput['availability'],
		})
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
					<Users className="size-5" />
				</div>
				<div>
					<h2 className="text-lg font-bold text-gray-900">
						{mode === 'create' ? 'Add Lecturer' : 'Edit Lecturer'}
					</h2>
					<p className="text-xs text-gray-500">Fill in the details below</p>
				</div>
			</div>

			{/* Name row */}
			<div className="grid grid-cols-2 gap-3">
				<div className={FIELD}>
					<Label
						htmlFor="lf-name"
						className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
					>
						First Name
					</Label>
					<div className="relative">
						<User className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
						<Input
							id="lf-name"
							value={name}
							onChange={e => setName(e.target.value)}
							className={cn('pl-9', errors.name && 'border-red-400 focus-visible:ring-red-400')}
							placeholder="Elen"
							autoFocus
							aria-invalid={!!errors.name}
						/>
					</div>
					{errors.name && (
						<p className={ERROR} role="alert">
							<AlertCircle className="size-3" />
							{errors.name}
						</p>
					)}
				</div>

				<div className={FIELD}>
					<Label
						htmlFor="lf-surname"
						className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
					>
						Last Name
					</Label>
					<div className="relative">
						<User className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
						<Input
							id="lf-surname"
							value={surname}
							onChange={e => setSurname(e.target.value)}
							className={cn('pl-9', errors.surname && 'border-red-400 focus-visible:ring-red-400')}
							placeholder="Ghazaryan"
							aria-invalid={!!errors.surname}
						/>
					</div>
					{errors.surname && (
						<p className={ERROR} role="alert">
							<AlertCircle className="size-3" />
							{errors.surname}
						</p>
					)}
				</div>
			</div>

			{/* Specialties */}
			<div className={FIELD}>
				<Label
					htmlFor="lf-spec"
					className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
				>
					Specialties{' '}
					<span className="normal-case font-normal text-gray-400">(comma-separated)</span>
				</Label>
				<div className="relative">
					<Tag className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
					<Input
						id="lf-spec"
						value={specialtiesInput}
						onChange={e => setSpecialties(e.target.value)}
						className={cn(
							'pl-9',
							errors.specialties && 'border-red-400 focus-visible:ring-red-400'
						)}
						placeholder="JavaScript, ReactJS"
						aria-invalid={!!errors.specialties}
					/>
				</div>
				{errors.specialties && (
					<p className={ERROR} role="alert">
						<AlertCircle className="size-3" />
						{errors.specialties}
					</p>
				)}
			</div>

			{/* Image URL */}
			<div className={FIELD}>
				<Label
					htmlFor="lf-img"
					className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
				>
					Photo URL <span className="normal-case font-normal text-gray-400">(optional)</span>
				</Label>
				<div className="relative">
					<Image className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
					<Input
						id="lf-img"
						type="url"
						value={imageUrl}
						onChange={e => setImageUrl(e.target.value)}
						className="pl-9"
						placeholder="https://..."
					/>
				</div>
			</div>

			{/* Divider */}
			<div className="h-px bg-gray-100" />

			{/* Actions */}
			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Saving…' : mode === 'create' ? 'Add Lecturer' : 'Save Changes'}
				</Button>
			</div>
		</form>
	)
}

export default LecturerForm
