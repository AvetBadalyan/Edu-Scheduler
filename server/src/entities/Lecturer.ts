import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { University } from './University'

@Entity('lecturers')
export class Lecturer {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar', name: 'university_id', nullable: true })
	universityId!: string | null

	@ManyToOne(() => University, university => university.lecturers, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'university_id' })
	university!: University | null

	@Column({ type: 'varchar' })
	name!: string

	@Column({ type: 'varchar' })
	surname!: string

	@Column({ type: 'jsonb', default: '[]' })
	specialties!: string[]

	@Column({ type: 'varchar', name: 'image_url', nullable: true })
	imageUrl!: string | null

	@Column({ type: 'jsonb', default: '{}' })
	availability!: object

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
