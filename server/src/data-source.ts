/**
 * TypeORM DataSource — connects to Supabase PostgreSQL.
 *
 * Reads DATABASE_URL from environment (set in server/.env).
 * SSL is always enabled for Supabase; rejectUnauthorized is relaxed
 * for local/dev to avoid certificate issues with self-signed certs.
 */
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Faculty, Lecturer, Room, Schedule, University, User } from './entities'

const isProduction = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url:  process.env.DATABASE_URL,
        ssl:  { rejectUnauthorized: false }, // required for Supabase
        synchronize: true,   // auto-creates/updates tables (fine for dev & this project)
        logging: !isProduction,
        entities: [User, University, Lecturer, Room, Faculty, Schedule],
        migrations: [],
      }
    : {
        type:     'postgres',
        host:     process.env.DB_HOST     ?? 'localhost',
        port:     Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME     ?? 'education_management',
        ssl:      false,
        synchronize: true,
        logging:  !isProduction,
        entities: [User, University, Lecturer, Room, Faculty, Schedule],
        migrations: [],
      }
)
