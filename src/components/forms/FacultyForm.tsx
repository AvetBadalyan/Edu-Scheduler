import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { CreateFacultyInput, Student, SyllabusEntry } from '@/types'
import {
	AlertCircle,
	BookOpen,
	GraduationCap,
	Plus,
	Trash2,
	UserPlus,
	Users
} from 'lucide-react'
import { useState } from 'react'

interface FacultyFormProps {
	mode: 'create' | 'edit'
	initialData?: Partial<CreateFacultyInput>
	onSubmit: (data: CreateFacultyInput) => Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

const FIELD = 'flex flex-col gap-1.5'
const ERROR = 'flex items-center gap-1 text-xs text-red-600'
const SECTION =
	'rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-3'
const SECTION_TITLE = 'flex items-center gap-2 text-sm font-bold text-gray-800'

export function FacultyForm({
	mode,
	initialData,
	onSubmit,
	onCancel,
	isLoading = false
}: FacultyFormProps) {
	const [name, setName] = useState(initialData?.name ?? '')
	const [syllabus, setSyllabus] = useState<SyllabusEntry[]>(
		initialData?.syllabus ?? [{ subject: '', requiredHours: 1 }]
	)
	const [students, setStudents] = useState<Student[]>(
		initialData?.students ?? []
	)
	const [newSName, setNewSName] = useState('')
	const [newSSurname, setNewSSurname] = useState('')
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validate = () => {
		const e: Record<string, string> = {}
		if (!name.trim()) e.name = 'Faculty name is required.'
		const valid = syllabus.filter(s => s.subject.trim())
		if (!valid.length) e.syllabus = 'At least one subject is required.'
		if (valid.some(s => s.requiredHours < 1))
			e.syllabus = 'Each subject needs at least 1 hour.'
		setErrors(e)
		return !Object.keys(e).length
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		await onSubmit({
			name: name.trim(),
			syllabus: syllabus.filter(s => s.subject.trim()),
			students
		})
	}

	const updateEntry = (
		i: number,
		field: keyof SyllabusEntry,
		val: string | number
	) =>
		setSyllabus(prev =>
			prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e))
		)

	const addStudent = () => {
		if (!newSName.trim() || !newSSurname.trim()) return
		setStudents(prev => [
			...prev,
			{
				id: `s-${Date.now()}`,
				name: newSName.trim(),
				surname: newSSurname.trim()
			}
		])
		setNewSName('')
		setNewSSurname('')
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-5"
			noValidate
		>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
					<GraduationCap className="size-5" />
				</div>
				<div>
					<h2 className="text-lg font-bold text-gray-900">
						{mode === 'create' ? 'Add Faculty' : 'Edit Faculty'}
					</h2>
					<p className="text-xs text-gray-500">
						Configure syllabus and students
					</p>
				</div>
			</div>

			{/* Name */}
			<div className={FIELD}>
				<Label
					htmlFor="ff-name"
					className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
				>
					Faculty Name
				</Label>
				<Input
					id="ff-name"
					value={name}
					onChange={e => setName(e.target.value)}
					className={cn(errors.name && 'border-red-400')}
					placeholder="e.g. Frontend Bootcamp"
					autoFocus
					aria-invalid={!!errors.name}
				/>
				{errors.name && (
					<p
						className={ERROR}
						role="alert"
					>
						<AlertCircle className="size-3" />
						{errors.name}
					</p>
				)}
			</div>

			{/* Syllabus */}
			<div className={SECTION}>
				<div className="flex items-center justify-between">
					<p className={SECTION_TITLE}>
						<BookOpen className="size-4 text-indigo-500" /> Syllabus
					</p>
					<button
						type="button"
						onClick={() =>
							setSyllabus(prev => [...prev, { subject: '', requiredHours: 1 }])
						}
						className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
					>
						<Plus className="size-3" /> Add Subject
					</button>
				</div>

				{errors.syllabus && (
					<p
						className={ERROR}
						role="alert"
					>
						<AlertCircle className="size-3" />
						{errors.syllabus}
					</p>
				)}

				<div className="flex flex-col gap-2">
					{syllabus.length > 0 && (
						<div className="grid grid-cols-[1fr_5rem_2rem] gap-2 px-1">
							<span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
								Subject
							</span>
							<span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 text-center">
								Hours
							</span>
							<span />
						</div>
					)}
					{syllabus.map((entry, i) => (
						<div
							key={i}
							className="grid grid-cols-[1fr_5rem_2rem] gap-2 items-center"
						>
							<Input
								value={entry.subject}
								onChange={e => updateEntry(i, 'subject', e.target.value)}
								placeholder="e.g. JavaScript"
								aria-label={`Subject ${i + 1}`}
								className="bg-white"
							/>
							<Input
								type="number"
								min={1}
								value={entry.requiredHours}
								onChange={e =>
									updateEntry(
										i,
										'requiredHours',
										parseInt(e.target.value, 10) || 1
									)
								}
								aria-label={`Hours for subject ${i + 1}`}
								className="bg-white text-center"
							/>
							<button
								type="button"
								onClick={() =>
									setSyllabus(prev => prev.filter((_, j) => j !== i))
								}
								className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
								aria-label={`Remove ${entry.subject || `subject ${i + 1}`}`}
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Students */}
			<div className={SECTION}>
				<p className={SECTION_TITLE}>
					<Users className="size-4 text-emerald-500" />
					Students
					<span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
						{students.length}
					</span>
				</p>

				{/* Add student row */}
				<div className="flex gap-2">
					<Input
						value={newSName}
						onChange={e => setNewSName(e.target.value)}
						placeholder="First name"
						aria-label="Student first name"
						className="bg-white"
					/>
					<Input
						value={newSSurname}
						onChange={e => setNewSSurname(e.target.value)}
						placeholder="Last name"
						aria-label="Student last name"
						className="bg-white"
					/>
					<button
						type="button"
						onClick={addStudent}
						className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
					>
						<UserPlus className="size-3.5" /> Add
					</button>
				</div>

				{/* Student list */}
				{students.length > 0 && (
					<ul className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 bg-white divide-y text-sm">
						{students.map((s, i) => (
							<li
								key={i}
								className="flex items-center justify-between px-3 py-1.5"
							>
								<span className="text-gray-700">
									<span className="text-gray-400 text-xs mr-1.5">{i + 1}.</span>
									{s.name} {s.surname}
								</span>
								<button
									type="button"
									onClick={() =>
										setStudents(prev => prev.filter((_, j) => j !== i))
									}
									className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
									aria-label={`Remove ${s.name} ${s.surname}`}
								>
									<Trash2 className="size-3" />
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="h-px bg-gray-100" />

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isLoading}
				>
					{isLoading
						? 'Saving…'
						: mode === 'create'
							? 'Add Faculty'
							: 'Save Changes'}
				</Button>
			</div>
		</form>
	)
}

export default FacultyForm
