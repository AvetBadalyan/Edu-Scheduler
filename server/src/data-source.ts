/**
 * TypeORM DataSource — connects to Supabase PostgreSQL.
 *
 * Reads DATABASE_URL from environment (set in server/.env).
 * SSL is enabled for Supabase. The Supabase connection pooler presents a
 * certificate that Node's default CA bundle doesn't trust, so we set
 * `rejectUnauthorized: false`. The connection is still encrypted; only the
 * certificate-chain check is skipped. To harden this, pass Supabase's CA
 * certificate via `ssl: { ca: <cert> }` instead.
 */
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Faculty, Lecturer, Room, Schedule, University } from './entities'

const isProduction = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource(
	process.env.DATABASE_URL
		? {
				type: 'postgres',
				url: process.env.DATABASE_URL,
				ssl: { rejectUnauthorized: false }, // required for Supabase
				synchronize: !isProduction,
				logging: !isProduction,
				entities: [University, Lecturer, Room, Faculty, Schedule],
				migrations: [],
			}
		: {
				type: 'postgres',
				host: process.env.DB_HOST ?? 'localhost',
				port: Number(process.env.DB_PORT ?? 5432),
				username: process.env.DB_USERNAME ?? 'postgres',
				password: process.env.DB_PASSWORD ?? 'postgres',
				database: process.env.DB_NAME ?? 'education_management',
				ssl: false,
				synchronize: !isProduction,
				logging: !isProduction,
				entities: [University, Lecturer, Room, Faculty, Schedule],
				migrations: [],
			}
)
