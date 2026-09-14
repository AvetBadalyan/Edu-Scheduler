# EduScheduler

University timetable generator with algorithm visualization.

## Live Demo

Try with Armenian Code Academy — no account required.

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS 4, Redux Toolkit, Supabase, Express, TypeORM

## Running Locally

### Frontend

    npm install
    cp .env.example .env.local  # add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
    npm run dev

Demo mode works offline — click "Try with Armenian Code Academy" on the landing page.

### Backend

    cd server
    npm install
    cp .env.example .env  # add DATABASE_URL (Supabase session pooler URI)
    npm run dev

### Tests

    npm test               # property tests (fast-check + vitest)
    npx playwright test    # E2E tests

## Two Modes

- **Demo**: one click, no account, in-memory seed data
- **Authenticated**: Supabase Auth + PostgreSQL, data persists

## Deployment

1. Import repo at vercel.com
2. Set env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
3. Build: npm run build, output: dist
