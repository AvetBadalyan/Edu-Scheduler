import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('lecturers')
export class Lecturer {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  surname!: string

  @Column('simple-array')
  specialties!: string[]

  @Column({ name: 'image_url', nullable: true })
  imageUrl!: string | null

  @Column({ type: 'jsonb', default: '{}' })
  availability!: object

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
