import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'
import { Faculty } from './Faculty'
import { Lecturer } from './Lecturer'
import { Room } from './Room'
import { Schedule } from './Schedule'

@Entity('universities')
export class University {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar' })
	name!: string

	@Column({ type: 'varchar', name: 'owner_id' })
	ownerId!: string // Supabase user ID

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@OneToMany(() => Lecturer, lecturer => lecturer.university)
	lecturers!: Lecturer[]

	@OneToMany(() => Room, room => room.university)
	rooms!: Room[]

	@OneToMany(() => Faculty, faculty => faculty.university)
	faculties!: Faculty[]

	@OneToMany(() => Schedule, schedule => schedule.university)
	schedules!: Schedule[]
}
