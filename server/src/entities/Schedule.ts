import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { University } from './University'

@Entity('schedules')
export class Schedule {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar' })
	name!: string

	@Column({ type: 'varchar', name: 'user_id' })
	userId!: string

	@Column({ type: 'varchar', name: 'university_id', nullable: true })
	universityId!: string | null

	@ManyToOne(() => University, university => university.schedules, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'university_id' })
	university!: University | null

	@Column({ type: 'jsonb', default: '{}' })
	state!: object // ScheduleState

	@Column({ type: 'jsonb', default: '{}' })
	stats!: object // ScheduleStats

	@CreateDateColumn({ name: 'created_at' })
	@Index()
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
