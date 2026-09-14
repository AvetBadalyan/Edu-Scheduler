import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm'
import { University } from './University'

@Entity('faculties')
@Unique(['universityId', 'name'])
export class Faculty {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar', name: 'university_id', nullable: true })
	universityId!: string | null

	@ManyToOne(() => University, university => university.faculties, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'university_id' })
	university!: University | null

	@Column({ type: 'varchar' })
	name!: string

	@Column({ type: 'jsonb', default: '[]' })
	syllabus!: object // SyllabusEntry[]

	@Column({ type: 'jsonb', default: '[]' })
	students!: object // Student[]

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
