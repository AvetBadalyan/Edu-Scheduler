/**
 * TypeORM DataSource — same pattern as the Music app.
 * Single connection shared across all route handlers.
 */
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User, Lecturer, Room, Faculty, Schedule } from './entities'

const isProduction = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        synchronize: !isProduction,   // auto-creates tables in dev, never in prod
        logging: !isProduction,
        entities: [User, Lecturer, Room, Faculty, Schedule],
        migrations: [],
      }
    : {
        type: 'postgres',
        host:     process.env.DB_HOST     ?? 'localhost',
        port:     Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME     ?? 'education_management',
        ssl: false,
        synchronize: !isProduction,
        logging: !isProduction,
        entities: [User, Lecturer, Room, Faculty, Schedule],
        migrations: [],
      }
)
