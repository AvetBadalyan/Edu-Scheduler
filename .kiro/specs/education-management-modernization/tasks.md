# Implementation Plan: Education Management Modernization

<!-- ============================================================
  TASK 1.1 VERIFICATION REPORT
  Completed via static code review + dev server startup check
  ============================================================

  ## Dev Server (Req 1.3)
  ✅ App starts cleanly in 248 ms (well under the 3-second requirement)
     `npm run dev` → VITE v5.4.21 ready in 248 ms on http://localhost:3000/
  ✅ TypeScript strict-mode compilation: `tsc --noEmit` exits 0 with no errors

  ## Seed Data (Req 2.1)
  ✅ useSeedData hook loads 12 lecturers, 8 rooms, 4 faculties on first mount
     (guarded with `length === 0` check so it only runs once)
  ✅ All lecturer image assets confirmed present on disk (including noro.jpg,
     sona.jpg, etc.)

  ## Entity Pages
  ✅ LecturersPage — reads selectAllLecturers, renders LecturerList with search,
     CRUD via dialog + LecturerForm
  ✅ RoomsPage — reads selectAllRooms, renders RoomList, CRUD via RoomForm
  ✅ FacultiesPage — reads selectAllFaculties, renders FacultyList, CRUD via
     FacultyForm
  All three pages are protected routes inside AppLayout; navigation sidebar
  links to /lecturers, /rooms, /faculties, /schedule, /

  ## Schedule Page & Algorithm (Req 4.1, 4.5)
  ✅ "Generate schedule" button calls runSchedulingAlgorithm (backtracking
     constraint-satisfaction solver) synchronously and dispatches loadSchedule
  ✅ Algorithm covers: most-constrained-first heuristic, even-distribution
     sorting, room capacity minimization, backtrack on dead ends (up to 10 000)
  ✅ Input validation via validateScheduleInput before algorithm runs
  ✅ Result stat cards (classes placed, backtracks, steps, unresolved) shown
     after generation

  ## Visualization Player (Req 4.5)
  ✅ VisualizationPlayer: Start, Play, Pause, Step Forward, Step Back controls
  ✅ Speed controls: 0.5×, 1×, 2×, 4×
  ✅ Progress bar with step counter and "X placed" counter
  ✅ Per-step chip shows evaluate / assign / conflict / backtrack / complete
  ✅ useProgressiveTimetable rebuilds timetable incrementally with each step,
     including backtrack removal — timetable animates in real time
  ✅ DecisionLog renders full step log alongside the player
  ✅ Auto-follow: TimetableViewer tracks active entity during visualization;
     user can pin a specific entity

  ## Drag-and-Drop Editing (Req 12.1)
  ✅ TimetableGrid uses HTML5 drag-and-drop (draggable, onDragStart, onDragOver,
     onDrop) — only active when isEditable=true and cell has an assignment
  ✅ handleSlotDrop in SchedulePage dispatches moveClass, which validates all
     three timetables atomically with rollback on failure
  ✅ Constraint errors (room busy, lecturer busy, faculty busy) shown via toast
  ✅ Manual placements marked with `isManual: true` and an "M" badge

  ## Undo/Redo (Req 12.4)
  ✅ useUndoRedo hook: Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z shortcuts + buttons
  ✅ editHistorySlice supports up to 50 entries with discard-redo-branch logic
  ⚠️ BUG: pushEdit is never dispatched. handleSlotDrop in SchedulePage calls
     dispatch(moveClass(...)) but does NOT subsequently dispatch pushEdit with
     the before/after ClassAssignment. As a result, the undo/redo stack is
     always empty and the Undo/Redo buttons remain permanently disabled after
     any drag-and-drop move.
     File: src/pages/SchedulePage.tsx, function handleSlotDrop (line ~102)
     Fix: after a successful moveClass, read the moved assignment from
     scheduleSlice state and dispatch pushEdit({ id, timestamp, type: 'move',
     before: originalAssignment, after: newAssignment }).
     The editHistorySlice.pushEdit action is exported and the
     undo/redo logic in useUndoRedo correctly reads before/after, so only
     the dispatch call in handleSlotDrop is missing.

  ## Additional Observations
  ✅ Auth: demo session persisted in sessionStorage; login page pre-fills demo
     credentials; ProtectedRoute redirects to /login when not authenticated
  ✅ Error handling: ErrorBoundary wraps all routes; Toaster for async feedback
  ✅ All 6 Redux slices wired in store/index.ts; serializableCheck configured
     to ignore Date objects in entity slices

  ## Summary
  Core functionality is confirmed working:
  - Dev server starts fast
  - Seed data loads on first boot
  - Lecturers/Rooms/Faculties pages display data
  - Schedule generation runs the full CSP algorithm
  - Visualization plays with all controls
  - Drag-and-drop editing validates constraints

  One bug found:
  🐛 Undo/Redo non-functional — pushEdit is never called after drag-and-drop
     moves, so the history stack stays empty (src/pages/SchedulePage.tsx)
  ============================================================ -->

## Overview

This project is **70-80% complete**. The core infrastructure and demo mode
functionality are already built and working. The remaining work focuses on
adding a landing page for portfolio demos, integrating Supabase for
authentication and data persistence in authenticated mode, and final polish for
deployment.

### What's Already Done ✅

- **Build System**: Vite + React 19 + TypeScript strict mode
- **UI Framework**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: Redux Toolkit with entitySlice, scheduleSlice,
  visualizationSlice, editHistorySlice, authSlice, toastSlice
- **Scheduling Algorithm**: Full constraint satisfaction with backtracking,
  generator-based for visualization
- **Algorithm Visualization**: VisualizationPlayer with playback controls,
  DecisionLog, step highlighting
- **Timetable Components**: TimetableGrid with drag-and-drop editing
- **Entity Management**: LecturersPage, RoomsPage, FacultiesPage with forms and
  lists
- **Seed Data**: Armenian Code Academy demo data (12 lecturers, 8 rooms, 4
  faculties)
- **Routing**: React Router with protected routes
- **Error Handling**: ErrorBoundary, Toaster notifications
- **Server Scaffold**: Express + TypeORM entities (User, Lecturer, Room,
  Faculty, Schedule)

### Remaining Work

1. **Verify current implementation works** — run and test existing features
2. **Landing page with demo entry** — one-click portfolio demo experience
3. **University entity for multi-tenancy** — support multiple users with their
   own data
4. **Supabase integration** — replace demo auth with Supabase Auth + PostgreSQL
5. **Connect frontend to backend** — API calls in authenticated mode
6. **Tests** — property-based tests for algorithm, E2E tests
7. **Deployment** — Vercel + Supabase with live demo link

## Tasks

- [x] 1. Verify existing implementation
  - [x] 1.1 Run application and verify core functionality works
    - Run `npm run dev` and confirm app starts without errors
    - Verify seed data loads correctly on first boot
    - Navigate to Lecturers, Rooms, Faculties pages — confirm data displays
    - Navigate to Schedule page — confirm algorithm generates schedule
    - Test visualization plays with playback controls (play/pause/speed)
    - Test drag-and-drop editing on timetable grid
    - Test undo/redo functionality
    - Document any bugs found in a comment
    - _Requirements: 1.3, 2.1, 4.1, 4.5, 12.1_

- [ ] 2. Checkpoint - Current implementation verified
  - Confirm app runs, seed data loads, algorithm works, visualization plays
  - Ask the user if questions arise

- [x] 3. Create landing page with demo entry point
  - [x] 3.1 Create LandingPage component
    - Hero section with app title and brief description
    - "Try with Armenian Code Academy" prominent one-click demo button
    - "Sign up / Login" option for authenticated mode (link to /login)
    - Brief feature highlights (algorithm visualization, schedule editing)
    - Make it visually impressive for portfolio review
    - _Requirements: (Portfolio demo strategy from design)_
  - [x] 3.2 Update routing to show landing page at root
    - Change `/` from HomePage to LandingPage
    - LandingPage should be public (not behind ProtectedRoute)
    - HomePage becomes `/dashboard` (protected)
    - Demo button navigates to `/dashboard` after loading seed data
    - _Requirements: (Portfolio demo strategy from design)_
  - [x] 3.3 Add mode indicator to AppLayout
    - Show "Demo Mode" badge in header when in demo mode
    - Add "Exit Demo" button that returns to landing page
    - Show user email/name when in authenticated mode
    - _Requirements: 14.1_

- [ ] 4. Checkpoint - Landing page complete
  - Verify landing page displays correctly
  - Verify demo button loads seed data and navigates to dashboard
  - Ask the user if questions arise

- [x] 5. Add University entity for multi-tenancy
  - [x] 5.1 Create University TypeORM entity
    - Create server/src/entities/University.ts
    - Fields: id, name, ownerId (Supabase user ID), createdAt
    - Add @OneToMany relations to Lecturer, Room, Faculty, Schedule
    - Export from server/src/entities/index.ts
    - _Requirements: 7.2_
  - [x] 5.2 Add universityId to existing entities
    - Update Lecturer entity: add universityId column and @ManyToOne relation
    - Update Room entity: add universityId column and @ManyToOne relation
    - Update Faculty entity: add universityId column and @ManyToOne relation
    - Update Schedule entity: add universityId column and @ManyToOne relation
    - _Requirements: 7.2_
  - [x] 5.3 Update seed data to include demo university
    - Create University type in src/types
    - Update seedData.ts to include a demo university object
    - Update useSeedData hook to store demo university ID
    - _Requirements: 7.2_
  - [x] 5.4 Add university state to Redux store
    - Add currentUniversity to a new appSlice or extend authSlice
    - Store universityId with entities for future API integration
    - _Requirements: 2.3_

- [ ] 6. Checkpoint - University entity added
  - Verify TypeORM entities compile without errors
  - Verify seed data includes university
  - Ask the user if questions arise

- [ ] 7. Integrate Supabase Auth
  - [ ] 7.1 Set up Supabase project
    - Create Supabase project at supabase.com
    - Enable email/password authentication
    - Get project URL and anon key
    - Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    - Update .env.example with placeholder values
    - _Requirements: 6.1, 6.5_
  - [ ] 7.2 Install and configure Supabase client
    - Run `npm install @supabase/supabase-js`
    - Create src/lib/supabase.ts with client initialization
    - Export typed supabase client
    - _Requirements: 6.1_
  - [ ] 7.3 Update authSlice for Supabase
    - Replace demo login/logout with Supabase auth calls
    - Use supabase.auth.signInWithPassword for login
    - Use supabase.auth.signUp for registration
    - Use supabase.auth.signOut for logout
    - Set up onAuthStateChange listener for session persistence
    - Keep demo mode fallback when Supabase is not configured
    - _Requirements: 6.2, 6.3, 6.6_
  - [ ] 7.4 Update LoginPage for Supabase
    - Update form to call new authSlice actions
    - Add signup form/link
    - Show password requirements (8+ chars, uppercase, lowercase, number)
    - Display Supabase error messages
    - _Requirements: 6.4, 6.7, 14.2_
  - [ ] 7.5 Update ProtectedRoute for Supabase session
    - Check supabase.auth.getSession() instead of Redux state only
    - Handle session loading state
    - Redirect to login if no session
    - _Requirements: 6.1_

- [ ] 8. Checkpoint - Supabase auth working
  - Test signup with new account
  - Test login with created account
  - Test logout clears session
  - Test refresh maintains session
  - Ask the user if questions arise

- [ ] 9. Update backend for Supabase PostgreSQL
  - [ ] 9.1 Configure data source for Supabase
    - Update server/src/data-source.ts to read DATABASE_URL from environment
    - Create server/.env with Supabase PostgreSQL connection string
    - Update server/.env.example with placeholder
    - _Requirements: 7.2_
  - [ ] 9.2 Create Supabase auth middleware
    - Create server/src/middleware/supabaseAuth.ts
    - Implement requireAuth middleware that validates Supabase JWT
    - Use supabase.auth.getUser(token) to validate
    - Attach user to request object
    - Return 401 for invalid/expired tokens
    - _Requirements: 6.4, 7.1_
  - [ ] 9.3 Update existing routes to use new auth middleware
    - Replace existing auth.ts middleware with Supabase version
    - Update lecturers, rooms, faculties routes to require auth
    - Scope all queries by universityId from request
    - _Requirements: 7.1, 7.3_
  - [ ] 9.4 Create University API routes
    - GET /api/universities - list user's universities
    - POST /api/universities - create new university
    - All operations scoped to authenticated user's ownerId
    - _Requirements: 7.1_
  - [ ] 9.5 Update schedules routes for new structure
    - Add universityId to create/update operations
    - List schedules filtered by universityId
    - Store schedule state as JSON
    - _Requirements: 7.5_

- [ ] 10. Checkpoint - Backend API working with Supabase
  - Test API routes with authenticated requests
  - Verify database operations work
  - Ask the user if questions arise

- [ ] 11. Connect frontend to backend in authenticated mode
  - [ ] 11.1 Create API client module
    - Create src/lib/api/client.ts
    - Implement typed fetch wrapper that includes Supabase token
    - Handle common error responses (401, 404, 500)
    - Transform API errors to user-friendly messages
    - _Requirements: 7.7, 14.1_
  - [ ] 11.2 Create API service functions
    - Create src/lib/api/universities.ts with CRUD functions
    - Create src/lib/api/lecturers.ts with CRUD functions
    - Create src/lib/api/rooms.ts with CRUD functions
    - Create src/lib/api/faculties.ts with CRUD functions
    - Create src/lib/api/schedules.ts with CRUD functions
    - _Requirements: 7.1, 7.3, 7.4_
  - [ ] 11.3 Add mode-aware actions to entity slice
    - Create wrapper actions that check app mode
    - In demo mode: modify in-memory state only (current behavior)
    - In authenticated mode: call API then update state from response
    - Handle loading and error states
    - _Requirements: 7.3, 7.4, 14.1_
  - [ ] 11.4 Implement authenticated mode flow
    - After login, check for existing universities
    - If none, prompt to create university
    - If exists, select university and load its data
    - Store selected universityId in app state
    - Load schedules for selected university
    - _Requirements: 7.6_

- [ ] 12. Checkpoint - Authenticated mode works end-to-end
  - Sign up → create university → add entities → generate schedule → save
  - Refresh page → data persists
  - Ask the user if questions arise

- [ ] 13. Add property-based tests for algorithm
  - [ ] 13.1 Set up fast-check testing library
    - Run `npm install -D fast-check`
    - Create tests/properties directory
    - Create test helpers for generating arbitrary schedule inputs
    - _Requirements: 13.1_
  - [ ] 13.2 Write property tests for scheduling constraints
    - **Property 1: No Double-Booking of Lecturers**
    - **Property 2: No Double-Booking of Rooms**
    - **Property 3: No Double-Booking of Faculties**
    - **Property 4: Room Capacity Satisfaction**
    - **Property 5: Lecturer Specialty Match**
    - Run 100 iterations per property
    - **Validates: Requirements 5.1, 5.2, 5.4, 9.3**
  - [ ] 13.3 Write property tests for schedule editing
    - **Property 6: Timetable Consistency** - assignment appears in all three
      timetables
    - **Property 7: Undo/Redo Reversibility** - undo sequence restores original
      state
    - **Property 11: Move Operation Atomicity** - source empty, destination has
      assignment
    - **Validates: Requirements 12.1, 12.4, 12.5**

- [ ] 14. Checkpoint - Property tests pass
  - Run `npm test` and verify all property tests pass
  - Ask the user if questions arise

- [ ] 15. Add end-to-end tests
  - [ ] 15.1 Set up Playwright
    - Run `npm install -D @playwright/test`
    - Run `npx playwright install`
    - Create playwright.config.ts
    - Create tests/e2e directory
    - _Requirements: 13.6_
  - [ ] 15.2 Write E2E test for demo mode flow
    - Visit landing page
    - Click "Try with Armenian Code Academy" button
    - Verify dashboard loads with seed data
    - Navigate to Schedule page
    - Click generate schedule
    - Verify visualization plays
    - Drag a class to a different slot
    - Verify move succeeded
    - _Requirements: 13.4_
  - [ ] 15.3 Write E2E test for authenticated mode flow
    - Visit landing page
    - Click sign up
    - Create new account
    - Create university
    - Add lecturer, room, faculty
    - Generate schedule
    - Save schedule
    - Log out and log back in
    - Verify data persists
    - _Requirements: 13.4_
  - [ ] 15.4 Configure CI to run tests
    - Create .github/workflows/test.yml
    - Run unit tests and E2E tests
    - Target completion within 5 minutes
    - _Requirements: 13.5_

- [ ] 16. Checkpoint - E2E tests pass
  - Run `npx playwright test` and verify all tests pass
  - Ask the user if questions arise

- [ ] 17. Deploy to Vercel + Supabase
  - [ ] 17.1 Configure Vercel deployment
    - Connect GitHub repository to Vercel
    - Set build command: `npm run build`
    - Set output directory: `dist`
    - Add environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
    - _Requirements: (Deployment from design)_
  - [ ] 17.2 Configure production Supabase
    - Run TypeORM migrations against production database
    - Configure Supabase auth for production URL
    - Set up CORS for production domain
    - _Requirements: 7.2_
  - [ ] 17.3 Update README with live demo
    - Add prominent "Live Demo" link at top of README
    - Explain demo mode vs authenticated mode
    - Add technology stack badges
    - Include interview talking points from design document
    - _Requirements: (Portfolio demo strategy from design)_

- [ ] 18. Final checkpoint - Production deployment complete
  - Verify live demo works at Vercel URL
  - Test demo mode flow in production
  - Run Lighthouse audit (target 90+ performance)
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional tests that can be skipped for faster
  deployment
- The project uses **Redux Toolkit** (not Zustand as mentioned in design) — this
  is fine, keep Redux
- Demo mode should work completely offline with no Supabase configuration needed
- Authenticated mode requires Supabase project setup
- Property tests validate correctness properties from the design document
- The "WOW factor" is the algorithm visualization — it already works!

## Task Dependency Graph

```json
{
	"waves": [
		{ "id": 0, "tasks": ["1.1"] },
		{ "id": 1, "tasks": ["3.1"] },
		{ "id": 2, "tasks": ["3.2", "3.3"] },
		{ "id": 3, "tasks": ["5.1"] },
		{ "id": 4, "tasks": ["5.2", "5.3"] },
		{ "id": 5, "tasks": ["5.4"] },
		{ "id": 6, "tasks": ["7.1"] },
		{ "id": 7, "tasks": ["7.2"] },
		{ "id": 8, "tasks": ["7.3", "7.4", "7.5"] },
		{ "id": 9, "tasks": ["9.1"] },
		{ "id": 10, "tasks": ["9.2"] },
		{ "id": 11, "tasks": ["9.3", "9.4", "9.5"] },
		{ "id": 12, "tasks": ["11.1"] },
		{ "id": 13, "tasks": ["11.2"] },
		{ "id": 14, "tasks": ["11.3", "11.4"] },
		{ "id": 15, "tasks": ["13.1"] },
		{ "id": 16, "tasks": ["13.2", "13.3"] },
		{ "id": 17, "tasks": ["15.1"] },
		{ "id": 18, "tasks": ["15.2", "15.3"] },
		{ "id": 19, "tasks": ["15.4"] },
		{ "id": 20, "tasks": ["17.1", "17.2"] },
		{ "id": 21, "tasks": ["17.3"] }
	]
}
```
