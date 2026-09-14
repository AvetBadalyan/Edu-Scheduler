import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
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
