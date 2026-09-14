import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
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
