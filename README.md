# Education Manager

A university timetable-management single-page app. Define lecturers, rooms and
faculties, then generate a **conflict-free weekly schedule** with a
constraint-satisfaction solver — and watch the algorithm make its decisions step
by step. Schedules can be fine-tuned by dragging classes around the grid, with
full undo/redo.

The project is built to run entirely in the browser (no backend required) so it
can be explored instantly, while a typed API client and an Express + Prisma
backend are included to show how it would connect to a real server.

> **Demo login** — the form is pre-filled, just click **Sign in**:
> `demo@education.app` / `demo1234`

---

## Highlights

- **Constraint-satisfaction scheduler** with backtracking — places every
  required class into a valid `day × hour` slot while respecting room capacity,
  lecturer specialties, and no double-booking of rooms, lecturers or faculties.
- **Algorithm visualization** — replay the solver step by step (evaluate →
  assign → conflict → backtrack) with play/pause, speed control and a live
  decision log.
- **Manual editing** — drag-and-drop classes between slots with conflict
  prevention and keyboard-accessible **undo/redo** (`Ctrl+Z` / `Ctrl+Y`).
- **Full CRUD** for lecturers, rooms and faculties with client-side validation,
  search, filtering and toast notifications.
- **Accessibility first** — semantic landmarks, skip link, focus-trapped
  dialogs, ARIA live regions, keyboard support and `prefers-reduced-motion`.
- **Responsive** — sidebar navigation on desktop collapses to a drawer on
  mobile; layouts adapt from 320px upward.

## Tech stack

| Area          | Choice                                                        |
| ------------- | ------------------------------------------------------------- |
| Language      | TypeScript (strict)                                           |
| UI            | React 19, Tailwind CSS v4, Radix UI primitives (shadcn-style) |
| State         | Zustand (entity, schedule, edit-history, visualization, auth) |
| Routing       | React Router v6 with lazy, code-split routes                  |
| Build         | Vite 5                                                        |
| Icons / fonts | lucide-react, Inter                                           |
| Testing       | Vitest + fast-check (property tests), Playwright (E2E)        |
| Backend\*     | Express, Prisma, PostgreSQL, JWT (optional — see below)       |

\* The frontend runs standalone with in-memory stores and mock auth. The backend
is provided as a reference implementation of the same contracts.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Then sign in with the demo credentials above. Demo data (lecturers, rooms and
faculties) is seeded automatically on first load.

### Scripts

| Script                  | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start the Vite dev server           |
| `npm run build`         | Type-check and build for production |
| `npm run preview`       | Preview the production build        |
| `npm test`              | Run unit + property tests (Vitest)  |
| `npm run test:coverage` | Run tests with coverage             |
| `npm run test:e2e`      | Run end-to-end tests (Playwright)   |

## Architecture

```
src/
├─ pages/           Route-level screens (lazy-loaded, code-split)
├─ components/
│  ├─ layout/       App shell, protected routes, page header
│  ├─ ui/           Reusable primitives (button, input, dialog, toast…)
│  ├─ forms/        Entity create/edit forms with validation
│  ├─ lists/        Searchable / filterable entity lists
│  ├─ timetable/    Timetable grid + multi-view viewer
│  └─ visualization/Algorithm playback UI
├─ stores/          Zustand stores (single source of truth per domain)
├─ lib/
│  ├─ algorithm/    Scheduling solver (generator-based, testable)
│  ├─ validation/   Input & constraint checks
│  └─ api/          Typed API client + secure token storage
├─ hooks/           Reusable hooks (drag-drop, undo-redo, toasts, seeding)
└─ types/           Central domain type definitions
```

### The scheduler

`src/lib/algorithm/schedulingAlgorithm.ts` models timetabling as a constraint
satisfaction problem and solves it with backtracking:

- Assignments are ordered **most-constrained-first** (subjects with fewer
  qualified lecturers go first) to reduce backtracking.
- Rooms are tried **smallest-capacity-first** to minimise wasted space; slots
  are chosen to **spread classes evenly** across the week.
- The solver is a **generator**, so the exact same logic powers both the instant
  "Generate" action and the step-by-step visualization — the UI just consumes
  the yielded steps.
- If a class cannot be placed it is reported as an unresolved constraint rather
  than failing the whole run, producing a usable partial schedule.

The core is pure and framework-agnostic, which makes it straightforward to test
with property-based tests (fast-check) asserting invariants like "no two classes
ever share a room/lecturer/faculty in the same slot".

## Testing

- **Unit & property tests** (`tests/`) cover the algorithm, stores, constraint
  checks and edit history — including property-based tests that assert
  scheduling invariants across randomised inputs.
- **End-to-end tests** (`tests/e2e/`) drive the real app in Chromium: login,
  auth redirects, navigation, entity CRUD and schedule generation.

```bash
npm test           # 61 unit/property tests
npm run test:e2e   # 8 end-to-end tests
```

## Authentication & the backend

For the demo, auth is mocked in `src/stores/authStore.ts` against a single demo
account, with the session flag kept in `sessionStorage`. The store exposes the
same async shape (`login` / `logout` / `checkAuth`) a real integration uses, so
switching to the server means swapping those method bodies for calls to
`src/lib/api/apiClient.ts`.

The `server/` directory contains a reference Express + Prisma backend with JWT
auth (short-lived in-memory access token + httpOnly refresh cookie). To run it:

```bash
cd server
cp .env.example .env      # set DATABASE_URL and JWT secrets
npm install
npm run prisma:migrate
npm run dev               # http://localhost:4000
```

Point the frontend at it with `VITE_API_URL=http://localhost:4000`.

## Security notes

`npm audit` advisories were triaged rather than blindly auto-fixed: the
applicable React Router advisory was patched, while the remaining items are
dev-tooling only or SSR-specific and do not affect this client-only build, so no
breaking major upgrades were forced.
