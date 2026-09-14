import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ type: 'varchar', unique: true })
	email!: string

	@Column({ type: 'varchar', name: 'password_hash' })
	passwordHash!: string

	@Column({ type: 'varchar' })
	name!: string

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
