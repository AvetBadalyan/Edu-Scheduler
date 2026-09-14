import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { User } from './User'

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => User, u => u.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

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
