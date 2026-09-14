# EduScheduler

University timetable generator with a backtracking constraint-satisfaction
solver and step-by-step algorithm visualization.

> Based on the original project:
> [RafaelAfrikyan/Education-management](https://github.com/RafaelAfrikyan/Education-management.git)

## Live Demo

Try it with Armenian Code Academy data — no account required. One click loads 12
lecturers, 8 rooms, and 4 faculties, then generates a conflict-free schedule in
seconds.

## Screenshots

### Landing page

![Landing page](docs/screenshots/01-landing.png)

### Dashboard

![Dashboard](docs/screenshots/02-dashboard.png)

### Lecturers

![Lecturers](docs/screenshots/03-lecturers.png)

### Rooms

![Rooms](docs/screenshots/04-rooms.png)

### Faculties

![Faculties](docs/screenshots/05-faculties.png)

### Generated schedule

![Generated schedule](docs/screenshots/07-schedule-generated.png)

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS 4, Redux Toolkit, Supabase, Express,
TypeORM

## Two Modes

- **Demo**: one click, no account, in-memory seed data
- **Authenticated**: Supabase Auth + PostgreSQL, data persists

## Running Locally

### Frontend

    npm install
    cp .env.example .env.local  # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (+ VITE_API_URL for authenticated mode)
    npm run dev

Demo mode works offline — click "Try with Armenian Code Academy" on the landing
page. Authenticated mode (sign up / sign in) additionally requires the backend
below to be running so lecturers, rooms, faculties, and schedules persist to
PostgreSQL.

### Backend

    cd server
    npm install
    cp .env.example .env  # add DATABASE_URL (Supabase session pooler URI)
    npm run dev

## Deployment

1. Import repo at vercel.com
2. Set env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
3. Build: npm run build, output: dist
