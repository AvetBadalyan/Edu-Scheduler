# Implementation Plan: Education Management Modernization

## Overview

This implementation plan transforms the Education Management application from a
2022 Create React App project into a modern, production-ready portfolio piece.
Tasks are ordered to deliver incremental value, starting with infrastructure
migration, then core functionality, followed by advanced features like
visualization and fullstack capabilities.

The plan follows a vertical slice approach: each major section results in a
working, testable increment of the application.

## Tasks

- [x] 1. Infrastructure Migration (Vite + TypeScript)
  - [x] 1.1 Initialize Vite project with React 19 and TypeScript strict mode
    - Create new Vite project configuration alongside existing CRA setup
    - Configure `vite.config.ts` with React plugin and path aliases
    - Set up `tsconfig.json` with strict mode and proper module resolution
    - Create `src/vite-env.d.ts` for Vite type definitions
    - _Requirements: 1.1, 1.2, 2.6_

  - [x] 1.2 Migrate existing components to TypeScript
    - Convert `.js/.jsx` files to `.ts/.tsx` with proper type annotations
    - Create type definitions for existing props and state in `src/types/`
    - Fix type errors and add missing type annotations
    - _Requirements: 1.2, 2.3_

  - [x] 1.3 Clean up dependencies and remove legacy packages
    - Remove `react-scripts`, `react-native` dependencies, and CRA-specific
      packages
    - Remove conflicting UI libraries (MUI v4, Radium, styled-components)
    - Update `package.json` scripts for Vite (`dev`, `build`, `preview`)
    - Verify development server starts in under 3 seconds
    - _Requirements: 1.3, 1.6, 3.2_

  - [x] 1.4 Configure build optimization and source maps
    - Set up code splitting configuration in Vite
    - Configure source map generation for debugging
    - Verify production build generates optimized bundles
    - _Requirements: 1.4, 1.5_

- [x] 2. Checkpoint - Verify Vite migration
  - Ensure the application builds and runs with Vite
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. UI Framework Setup (Tailwind + shadcn/ui)
  - [x] 3.1 Install and configure Tailwind CSS
    - Install Tailwind CSS, PostCSS, and Autoprefixer
    - Create `tailwind.config.ts` with custom theme (colors, spacing, fonts)
    - Set up `postcss.config.js` for Tailwind processing
    - Create base styles in `src/index.css` with Tailwind directives
    - _Requirements: 3.1, 3.3_

  - [x] 3.2 Set up shadcn/ui component library
    - Initialize shadcn/ui with CLI configuration
    - Create `components.json` configuration file
    - Set up `src/components/ui/` directory structure
    - Install base shadcn/ui components (Button, Input, Card, Dialog)
    - _Requirements: 3.1_

  - [x] 3.3 Implement responsive design utilities
    - Define responsive breakpoints in Tailwind config (320px to 2560px)
    - Create responsive container components
    - Set up CSS custom properties for theming
    - _Requirements: 3.4_

  - [x] 3.4 Implement accessibility foundations
    - Configure focus-visible styles for keyboard navigation
    - Set up color contrast utilities meeting WCAG 2.1 AA
    - Add skip-to-content link and proper heading hierarchy
    - _Requirements: 3.5_

- [x] 4. State Management Layer (Zustand)
  - [x] 4.1 Create core type definitions
    - Create `src/types/entities.ts` with Lecturer, Room, Faculty, Student types
    - Create `src/types/schedule.ts` with TimeSlot, Timetable, ClassAssignment
      types
    - Create `src/types/algorithm.ts` with AlgorithmStep, ScheduleResult types
    - Create `src/types/api.ts` with API response and error types
    - _Requirements: 2.3_

  - [x] 4.2 Implement EntityStore for lecturers, rooms, and faculties
    - Create `src/stores/entityStore.ts` with typed state and actions
    - Implement CRUD operations with immutable update patterns
    - Add typed selectors for filtering and searching entities
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.3 Implement ScheduleStore for timetable management
    - Create `src/stores/scheduleStore.ts` with ScheduleState type
    - Implement `assignClass`, `unassignClass`, `moveClass` actions
    - Add selectors for room/lecturer/faculty timetables
    - Implement conflict detection logic
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.4 Implement EditHistoryStore for undo/redo
    - Create `src/stores/editHistoryStore.ts` with 50-action limit
    - Implement `pushEdit`, `undo`, `redo` actions
    - Add `canUndo`, `canRedo` selectors
    - _Requirements: 12.4_

  - [x] 4.5 Write property test for undo/redo reversibility
    - **Property 7: Undo/Redo Reversibility**
    - **Validates: Requirements 12.4**

- [x] 5. Checkpoint - Verify state management
  - Ensure all stores are properly typed and functional
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Scheduling Algorithm Core
  - [x] 6.1 Implement input validation for scheduling
    - Create `src/lib/algorithm/validation.ts`
    - Validate lecturers have valid specialties matching syllabi
    - Validate rooms have positive capacity (1-500)
    - Validate faculties have positive required hours
    - Return specific error messages for each validation failure
    - _Requirements: 5.1, 5.2_

  - [x] 6.2 Implement constraint checking functions
    - Create `src/lib/algorithm/constraints.ts`
    - Implement lecturer availability check (no double-booking)
    - Implement room availability check (no double-booking)
    - Implement faculty schedule check (no overlapping classes)
    - Implement capacity check (room fits faculty students)
    - Implement specialty match check (lecturer can teach subject)
    - _Requirements: 5.1, 5.3_

  - [x] 6.3 Write property tests for no double-booking constraints
    - **Property 1: No Double-Booking of Lecturers**
    - **Property 2: No Double-Booking of Rooms**
    - **Property 3: No Double-Booking of Faculties**
    - **Validates: Requirements 5.1, 5.2**

  - [x] 6.4 Write property test for room capacity satisfaction
    - **Property 4: Room Capacity Satisfaction**
    - **Validates: Requirements 5.4, 10.3**

  - [x] 6.5 Write property test for lecturer specialty match
    - **Property 5: Lecturer Specialty Match**
    - **Validates: Requirements 9.3**

  - [x] 6.6 Implement core scheduling algorithm with backtracking
    - Create `src/lib/algorithm/scheduler.ts`
    - Implement generator-based schedule generation yielding AlgorithmSteps
    - Implement backtracking when assignments lead to dead ends
    - Prioritize assignments minimizing room capacity waste
    - Prefer even distribution of classes across days
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 6.7 Implement algorithm result handling
    - Return partial schedule when no complete solution exists
    - Report which constraints could not be satisfied
    - Track total steps and backtrack count
    - _Requirements: 5.3_

  - [x] 6.8 Write property test for required hours tracking
    - **Property 9: Required Hours Tracking**
    - **Validates: Requirements 8.3**

  - [x] 6.9 Write property test for input validation completeness
    - **Property 14: Input Validation Completeness**
    - **Validates: Requirements 5.2**

- [x] 7. Checkpoint - Verify scheduling algorithm
  - Ensure algorithm generates valid schedules for test data
  - Verify performance: 100 lecturers, 50 rooms, 20 faculties in under 5 seconds
  - Ensure all tests pass, ask the user if questions arise

- [x] 8. Timetable Display Components
  - [x] 8.1 Create TimetableGrid component
    - Create `src/components/timetable/TimetableGrid.tsx`
    - Implement 5-day × 4-hour grid layout with Tailwind
    - Add color coding by lecturer or subject
    - Implement hover tooltips showing class details
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 8.2 Implement timetable view switching
    - Add view mode selector (by lecturer, room, or faculty)
    - Create `src/components/timetable/TimetableView.tsx` wrapper
    - Wire up to ScheduleStore selectors
    - _Requirements: 11.4_

  - [x] 8.3 Implement conflict highlighting
    - Add visual indicators for scheduling conflicts (red highlighting)
    - Show conflict details on hover
    - _Requirements: 11.6_

  - [x] 8.4 Write property test for timetable consistency
    - **Property 6: Timetable Consistency**
    - **Validates: Requirements 12.5**

- [x] 9. Entity Management Forms
  - [x] 9.1 Create LecturerForm component with validation
    - Create `src/components/forms/LecturerForm.tsx`
    - Implement fields: name, surname, specialty (multi-select), image URL
    - Add Zod schema validation
    - Validate specialty matches at least one syllabus subject
    - _Requirements: 9.1, 9.3, 9.6_

  - [x] 9.2 Create RoomForm component with validation
    - Create `src/components/forms/RoomForm.tsx`
    - Implement fields: room number, capacity
    - Add Zod validation for capacity (1-500)
    - _Requirements: 10.1, 10.3_

  - [x] 9.3 Create FacultyForm component with validation
    - Create `src/components/forms/FacultyForm.tsx`
    - Implement fields: name, syllabus entries (subject + hours), students
    - Add Zod validation for positive integer hours
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 9.4 Implement availability editor for lecturers and rooms
    - Create `src/components/forms/AvailabilityEditor.tsx`
    - Implement time slot blocking interface (click to toggle)
    - Wire up to entity forms
    - _Requirements: 9.2, 10.2_

- [x] 10. Entity List Views
  - [x] 10.1 Create LecturerList component
    - Create `src/components/lists/LecturerList.tsx`
    - Implement filterable grid with specialty tags
    - Add click handler to view lecturer details and timetable
    - _Requirements: 9.4, 9.5_

  - [x] 10.2 Create RoomList component
    - Create `src/components/lists/RoomList.tsx`
    - Implement grouping by capacity range
    - Show occupancy statistics and utilization percentage
    - _Requirements: 10.4, 10.5, 10.6_

  - [x] 10.3 Create FacultyList component
    - Create `src/components/lists/FacultyList.tsx`
    - Implement searchable, sortable list
    - Add click handler to view faculty details, timetable, and syllabus
    - _Requirements: 8.4, 8.5_

  - [x] 10.4 Implement virtualization for large lists
    - Install `@tanstack/react-virtual`
    - Apply virtualization to lists exceeding 100 items
    - _Requirements: 15.5_

- [x] 11. Checkpoint - Verify entity management UI
  - Ensure all entity forms validate correctly
  - Ensure entity lists display and filter properly
  - Ensure all tests pass, ask the user if questions arise

- [x] 12. Manual Schedule Editing
  - [x] 12.1 Implement drag-and-drop for timetable cells
    - Add drag-and-drop functionality to TimetableGrid
    - Use HTML5 drag events or a library like `@dnd-kit/core`
    - Validate constraints on drop and prevent invalid placements
    - _Requirements: 12.1, 12.2_

  - [x] 12.2 Implement constraint violation feedback
    - Show conflict explanation when invalid placement attempted
    - Highlight conflicting elements
    - _Requirements: 12.3_

  - [x] 12.3 Wire up undo/redo to manual edits
    - Connect EditHistoryStore to drag-and-drop actions
    - Add keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
    - _Requirements: 12.4_

  - [x] 12.4 Implement visual distinction for manual vs auto-generated classes
    - Add visual indicator (badge or border style) for manually-placed classes
    - _Requirements: 12.6_

  - [x] 12.5 Update all affected timetables on edit
    - Ensure lecturer, room, and faculty timetables update simultaneously
    - _Requirements: 12.5_

  - [x] 12.6 Write property tests for assignment validation and move atomicity
    - **Property 8: Assignment Validation Consistency**
    - **Property 11: Move Operation Atomicity**
    - **Validates: Requirements 12.2, 12.3, 12.1, 12.5**

- [x] 13. Algorithm Visualization System
  - [x] 13.1 Implement VisualizationStore
    - Create `src/stores/visualizationStore.ts`
    - Implement playback state (idle, playing, paused, complete)
    - Implement step navigation (forward, backward, jump)
    - Implement speed control (0.5x, 1x, 2x, 4x)
    - _Requirements: 4.5_

  - [x] 13.2 Create VisualizationPlayer component
    - Create `src/components/visualization/VisualizationPlayer.tsx`
    - Implement playback controls UI (play, pause, step buttons)
    - Add progress indicator showing current step and total
    - _Requirements: 4.5_

  - [x] 13.3 Implement element highlighting during visualization
    - Highlight current lecturer, room, and time slot being evaluated
    - Show constraint check results (pass/fail indicators)
    - Highlight conflicts in red when detected
    - _Requirements: 4.2, 4.3, 4.6_

  - [x] 13.4 Implement assignment animation
    - Animate class placement on timetable when assignment succeeds
    - Use CSS transitions or Framer Motion for smooth animations
    - _Requirements: 4.4_

  - [x] 13.5 Implement decision log display
    - Create `src/components/visualization/DecisionLog.tsx`
    - Show running log of algorithm decisions
    - Scroll to current step automatically
    - _Requirements: 4.7_

  - [x] 13.6 Implement visualization summary
    - Show summary on completion: assignments made, unresolved constraints
    - _Requirements: 4.8_

  - [x] 13.7 Write property test for visualization step completeness
    - **Property 10: Visualization Step Completeness**
    - **Validates: Requirements 4.1, 4.7**

- [x] 14. Checkpoint - Verify visualization system
  - Ensure visualization plays through algorithm steps correctly
  - Ensure playback controls work as expected
  - Ensure all tests pass, ask the user if questions arise

- [x] 15. Backend Setup (Node.js + Express + PostgreSQL)
  - [x] 15.1 Initialize backend project structure
    - Create `server/` directory with Express TypeScript setup
    - Configure `tsconfig.json` for backend
    - Set up `package.json` scripts for dev and build
    - Create basic Express app with health check endpoint
    - _Requirements: 7.1_

  - [x] 15.2 Set up Prisma ORM with PostgreSQL
    - Install Prisma and configure `prisma/schema.prisma`
    - Define User, Lecturer, Room, Faculty, Schedule models
    - Generate Prisma client
    - Create initial migration
    - _Requirements: 7.2_

  - [x] 15.3 Implement database service layer
    - Create `server/services/` with typed service functions
    - Implement CRUD operations for each entity
    - Add error handling for database failures
    - _Requirements: 7.3, 7.4, 7.7_

- [x] 16. Authentication System
  - [x] 16.1 Implement JWT authentication endpoints
    - Create `server/routes/auth.ts` with login, logout, register endpoints
    - Implement password hashing with bcrypt
    - Generate access and refresh tokens
    - _Requirements: 6.1, 6.2_

  - [x] 16.2 Implement token refresh logic
    - Create refresh token endpoint
    - Implement automatic token refresh on client
    - _Requirements: 6.3_

  - [x] 16.3 Implement secure token storage
    - Configure httpOnly cookies for tokens
    - Add CSRF protection
    - _Requirements: 6.5_

  - [x] 16.4 Implement auth middleware and error handling
    - Create JWT verification middleware
    - Return specific error messages (invalid credentials, session expired)
    - Implement logout with session invalidation
    - _Requirements: 6.4, 6.6_

  - [x] 16.5 Implement password validation
    - Add password requirements: min 8 chars, uppercase, lowercase, number
    - Return validation errors for invalid passwords
    - _Requirements: 6.7_

  - [x] 16.6 Write property test for authentication token validity
    - **Property 12: Authentication Token Validity**
    - **Validates: Requirements 6.2, 6.3**

  - [x] 16.7 Implement AuthStore on frontend
    - Create `src/stores/authStore.ts`
    - Implement login, logout, refreshToken, checkAuth actions
    - Wire up to API client
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 17. Checkpoint - Verify authentication system
  - Ensure login/logout flow works end-to-end
  - Ensure token refresh happens automatically
  - Ensure all tests pass, ask the user if questions arise

- [x] 18. RESTful API Endpoints
  - [x] 18.1 Implement lecturer API endpoints
    - Create `server/routes/lecturers.ts` with CRUD endpoints
    - Add input validation with Zod
    - Wire up to service layer
    - _Requirements: 7.1_

  - [x] 18.2 Implement room API endpoints
    - Create `server/routes/rooms.ts` with CRUD endpoints
    - Add input validation with Zod
    - Wire up to service layer
    - _Requirements: 7.1_

  - [x] 18.3 Implement faculty API endpoints
    - Create `server/routes/faculties.ts` with CRUD endpoints
    - Prevent deletion of faculties with scheduled classes
    - Wire up to service layer
    - _Requirements: 7.1, 8.6_

  - [x] 18.4 Write property test for entity deletion safety
    - **Property 13: Entity Deletion Safety**
    - **Validates: Requirements 8.6**

  - [x] 18.5 Implement schedule API endpoints
    - Create `server/routes/schedules.ts` with CRUD endpoints
    - Support multiple named schedules per user
    - Load most recent schedule on app start
    - _Requirements: 7.5, 7.6_

  - [x] 18.6 Implement API client on frontend
    - Create `src/lib/api/client.ts` with typed methods
    - Wire up to Zustand stores
    - Implement request/response interceptors
    - _Requirements: 7.3, 7.4_

- [x] 19. Checkpoint - Verify API integration
  - Ensure all CRUD operations work end-to-end
  - Ensure data persists across page reloads
  - Ensure all tests pass, ask the user if questions arise

- [x] 20. Error Handling and User Feedback
  - [x] 20.1 Implement toast notification system
    - Install and configure a toast library (e.g., react-hot-toast or shadcn
      toast)
    - Show error notifications for API failures
    - _Requirements: 14.1_

  - [x] 20.2 Implement form validation error display
    - Show inline error messages on invalid fields
    - Highlight invalid fields visually
    - _Requirements: 14.2_

  - [x] 20.3 Implement progress indicators
    - Add loading spinners for long operations
    - Show progress during schedule generation
    - _Requirements: 14.3_

  - [x] 20.4 Implement offline detection and operation queueing
    - Detect network status changes
    - Show offline indicator in UI
    - Queue operations when offline
    - _Requirements: 14.4_

  - [x] 20.5 Implement error logging and error boundary
    - Add client-side error logging
    - Create error boundary with friendly error page
    - Add retry option on error page
    - _Requirements: 14.5, 14.6_

- [x] 21. Performance Optimization
  - [x] 21.1 Implement route-based code splitting
    - Configure React.lazy for route components
    - Add Suspense boundaries with loading fallbacks
    - _Requirements: 15.3_

  - [x] 21.2 Implement lazy loading for images and non-critical components
    - Add lazy loading for lecturer profile images
    - Defer loading of visualization components
    - _Requirements: 15.4_

  - [x] 21.3 Implement API response caching
    - Configure cache headers on API endpoints
    - Implement client-side caching strategy
    - _Requirements: 15.6_

  - [x] 21.4 Verify Lighthouse performance targets
    - Run Lighthouse audit
    - Target: Performance ≥ 90, initial load < 2s on 3G
    - _Requirements: 15.1, 15.2_

- [x] 22. Testing Infrastructure
  - [x] 22.1 Set up Vitest for unit and integration tests
    - Configure `vitest.config.ts`
    - Set up test utilities and mocks
    - Configure coverage reporting (target 90% for algorithm)
    - _Requirements: 13.1, 13.6_

  - [x] 22.2 Set up Playwright for E2E tests
    - Configure `playwright.config.ts`
    - Create test utilities for login and navigation
    - _Requirements: 13.6_

  - [x] 22.3 Write integration tests for API endpoints
    - Test all CRUD operations for each entity type
    - Test authentication flows
    - _Requirements: 13.2_

  - [x] 22.4 Write component tests for interactive UI components
    - Test TimetableGrid interactions
    - Test entity forms validation
    - Test drag-and-drop functionality
    - _Requirements: 13.3_

  - [x] 22.5 Write E2E tests for critical user flows
    - Test login flow
    - Test entity creation flow
    - Test schedule generation flow
    - _Requirements: 13.4_

  - [x] 22.6 Configure CI test runner
    - Ensure all tests complete within 5 minutes
    - _Requirements: 13.5_

- [x] 23. Export and Final Polish
  - [x] 23.1 Implement timetable export (PDF/image)
    - Add export functionality using html2canvas or similar
    - Support PDF and image formats
    - _Requirements: 11.5_

  - [x] 23.2 Final accessibility audit and fixes
    - Run axe-core audit
    - Fix any remaining WCAG 2.1 AA violations
    - _Requirements: 3.5_

- [x] 24. Final Checkpoint - Production readiness
  - Ensure all tests pass
  - Verify Lighthouse scores meet targets
  - Ensure the application is production-ready
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after major milestones
- Property tests validate universal correctness properties from the design
  document
- Unit tests validate specific examples and edge cases
- The implementation follows a vertical slice approach: infrastructure → state →
  algorithm → UI → backend → polish
- Performance targets: algorithm < 5s for 100 lecturers/50 rooms/20 faculties,
  Lighthouse ≥ 90

## Task Dependency Graph

```json
{
	"waves": [
		{ "id": 0, "tasks": ["1.1"] },
		{ "id": 1, "tasks": ["1.2"] },
		{ "id": 2, "tasks": ["1.3"] },
		{ "id": 3, "tasks": ["1.4"] },
		{ "id": 4, "tasks": ["3.1", "4.1"] },
		{ "id": 5, "tasks": ["3.2", "4.2", "4.3"] },
		{ "id": 6, "tasks": ["3.3", "3.4", "4.4"] },
		{ "id": 7, "tasks": ["4.5"] },
		{ "id": 8, "tasks": ["6.1"] },
		{ "id": 9, "tasks": ["6.2"] },
		{ "id": 10, "tasks": ["6.3", "6.4", "6.5"] },
		{ "id": 11, "tasks": ["6.6"] },
		{ "id": 12, "tasks": ["6.7"] },
		{ "id": 13, "tasks": ["6.8", "6.9"] },
		{ "id": 14, "tasks": ["8.1"] },
		{ "id": 15, "tasks": ["8.2", "8.3"] },
		{ "id": 16, "tasks": ["8.4"] },
		{ "id": 17, "tasks": ["9.1", "9.2", "9.3"] },
		{ "id": 18, "tasks": ["9.4"] },
		{ "id": 19, "tasks": ["10.1", "10.2", "10.3"] },
		{ "id": 20, "tasks": ["10.4"] },
		{ "id": 21, "tasks": ["12.1"] },
		{ "id": 22, "tasks": ["12.2", "12.3"] },
		{ "id": 23, "tasks": ["12.4", "12.5"] },
		{ "id": 24, "tasks": ["12.6"] },
		{ "id": 25, "tasks": ["13.1"] },
		{ "id": 26, "tasks": ["13.2", "13.3"] },
		{ "id": 27, "tasks": ["13.4", "13.5"] },
		{ "id": 28, "tasks": ["13.6"] },
		{ "id": 29, "tasks": ["13.7"] },
		{ "id": 30, "tasks": ["15.1"] },
		{ "id": 31, "tasks": ["15.2"] },
		{ "id": 32, "tasks": ["15.3"] },
		{ "id": 33, "tasks": ["16.1"] },
		{ "id": 34, "tasks": ["16.2", "16.3"] },
		{ "id": 35, "tasks": ["16.4", "16.5"] },
		{ "id": 36, "tasks": ["16.6", "16.7"] },
		{ "id": 37, "tasks": ["18.1", "18.2", "18.3"] },
		{ "id": 38, "tasks": ["18.4", "18.5"] },
		{ "id": 39, "tasks": ["18.6"] },
		{ "id": 40, "tasks": ["20.1", "20.2"] },
		{ "id": 41, "tasks": ["20.3", "20.4"] },
		{ "id": 42, "tasks": ["20.5"] },
		{ "id": 43, "tasks": ["21.1", "21.2"] },
		{ "id": 44, "tasks": ["21.3"] },
		{ "id": 45, "tasks": ["21.4"] },
		{ "id": 46, "tasks": ["22.1", "22.2"] },
		{ "id": 47, "tasks": ["22.3", "22.4"] },
		{ "id": 48, "tasks": ["22.5"] },
		{ "id": 49, "tasks": ["22.6"] },
		{ "id": 50, "tasks": ["23.1", "23.2"] }
	]
}
```
