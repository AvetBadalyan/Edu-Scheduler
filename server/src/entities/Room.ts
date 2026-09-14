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

@Entity('rooms')
@Unique(['universityId', 'number'])
export class Room {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar', name: 'university_id', nullable: true })
	universityId!: string | null

	@ManyToOne(() => University, university => university.rooms, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'university_id' })
	university!: University | null

	@Column({ type: 'varchar' })
	number!: string

	@Column({ type: 'int' })
	capacity!: number

	@Column({ type: 'jsonb', default: '{}' })
	availability!: object

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
