# Requirements Document

## Introduction

This document specifies requirements for modernizing the Education Management application — a University Schedule Management System that automatically generates class schedules. The app solves a constraint satisfaction problem: given faculties with syllabi, lecturers with specialties, and rooms with capacities, it assigns classes to time slots while respecting constraints (no double-booking, capacity matching, required hours fulfilled).

The modernization transforms this 2022 Code Academy project into a polished, production-ready portfolio piece demonstrating modern frontend architecture, algorithm visualization, and optionally fullstack capabilities with data persistence.

## Glossary

- **Scheduler**: The core system responsible for generating and managing university class schedules
- **Scheduling_Algorithm**: The constraint satisfaction solver that assigns classes to time slots
- **Faculty**: An academic program or bootcamp (e.g., "Frontend Bootcamp") with a syllabus, students, and required lecture hours
- **Lecturer**: An instructor with a specialty subject and weekly availability timetable
- **Room**: A physical classroom with a capacity (number of seats) and weekly availability timetable
- **Time_Slot**: A specific combination of day (Monday-Friday) and hour (1-4) representing a schedulable period
- **Constraint**: A rule that must be satisfied during scheduling (e.g., no double-booking, capacity fits)
- **Algorithm_Visualization**: An animated step-by-step display of the scheduling process as it assigns classes
- **Schedule_State**: The current state of all timetables including rooms, lecturers, and faculties
- **Conflict**: A situation where a constraint cannot be satisfied (e.g., lecturer already booked)
- **User_Session**: An authenticated user's interaction period with the application
- **API_Server**: The backend service providing data persistence and business logic
- **Schedule_Entity**: A database record representing a saved schedule configuration

## Requirements

### Requirement 1: Modern Build System Migration

**User Story:** As a developer, I want the application built with Vite instead of Create React App, so that I have faster development builds, better tree-shaking, and a maintained toolchain.

#### Acceptance Criteria

1. THE Scheduler SHALL be built using Vite as the build tool with React plugin
2. THE Scheduler SHALL use TypeScript for all source files with strict mode enabled
3. THE Scheduler SHALL have a development server startup time of less than 3 seconds
4. THE Scheduler SHALL produce optimized production bundles with code splitting
5. WHEN the build process runs, THE Scheduler SHALL generate source maps for debugging
6. THE Scheduler SHALL have all react-native dependencies removed from package.json

---

### Requirement 2: State Management Modernization

**User Story:** As a developer, I want modern state management with immutable updates and proper typing, so that the code is maintainable and follows current best practices.

#### Acceptance Criteria

1. THE Scheduler SHALL use either Redux Toolkit or Zustand for state management
2. WHEN state updates occur, THE Scheduler SHALL use immutable update patterns
3. THE Scheduler SHALL have TypeScript interfaces defined for all state slices
4. THE Scheduler SHALL have typed actions and selectors for all state operations
5. IF legacy Redux patterns exist, THEN THE Scheduler SHALL replace them with modern equivalents
6. THE Scheduler SHALL use React 19 with concurrent features enabled

---

### Requirement 3: UI Framework Consolidation

**User Story:** As a developer, I want a single, consistent UI library, so that the application has a unified design system without conflicting dependencies.

#### Acceptance Criteria

1. THE Scheduler SHALL use a single UI framework (either MUI v6, shadcn/ui with Tailwind, or Tailwind standalone)
2. THE Scheduler SHALL remove all conflicting UI libraries (MUI v4, Radium, styled-components if not primary choice)
3. THE Scheduler SHALL have a consistent design system with defined color palette and spacing scale
4. THE Scheduler SHALL implement responsive design supporting screens from 320px to 2560px width
5. THE Scheduler SHALL meet WCAG 2.1 AA accessibility standards for color contrast and keyboard navigation

---

### Requirement 4: Algorithm Visualization System

**User Story:** As a user, I want to see the scheduling algorithm work step-by-step with animations, so that I can understand how schedule generation solves constraints.

#### Acceptance Criteria

1. WHEN the user initiates schedule generation, THE Algorithm_Visualization SHALL display each assignment step
2. WHILE the algorithm processes, THE Algorithm_Visualization SHALL highlight the current lecturer, room, and time slot being evaluated
3. WHEN a constraint check occurs, THE Algorithm_Visualization SHALL indicate whether it passed or failed
4. WHEN an assignment succeeds, THE Algorithm_Visualization SHALL animate the class being placed on the timetable
5. THE Algorithm_Visualization SHALL provide playback controls: play, pause, step forward, step backward, and speed adjustment
6. WHEN a conflict is detected, THE Algorithm_Visualization SHALL highlight the conflicting elements in red
7. THE Algorithm_Visualization SHALL display a running log of algorithm decisions
8. WHEN visualization completes, THE Algorithm_Visualization SHALL show a summary of assignments made and any unresolved constraints

---

### Requirement 5: Enhanced Scheduling Algorithm

**User Story:** As an administrator, I want the scheduling algorithm to handle edge cases gracefully and provide clear feedback, so that I can understand and resolve scheduling issues.

#### Acceptance Criteria

1. THE Scheduling_Algorithm SHALL validate all input data before attempting schedule generation
2. IF input data is invalid, THEN THE Scheduling_Algorithm SHALL return specific error messages identifying the issue
3. WHEN no valid schedule exists, THE Scheduling_Algorithm SHALL report which constraints could not be satisfied
4. THE Scheduling_Algorithm SHALL prioritize assignments to minimize room capacity waste
5. THE Scheduling_Algorithm SHALL attempt backtracking when initial assignments lead to dead ends
6. WHEN multiple valid assignments exist, THE Scheduling_Algorithm SHALL prefer distributing classes evenly across days
7. THE Scheduling_Algorithm SHALL complete schedule generation for 100 lecturers, 50 rooms, and 20 faculties within 5 seconds

---

### Requirement 6: Authentication System

**User Story:** As an administrator, I want secure authentication, so that only authorized users can create and modify schedules.

#### Acceptance Criteria

1. THE Scheduler SHALL implement JWT-based authentication for user sessions
2. WHEN a user provides valid credentials, THE Scheduler SHALL issue an access token and refresh token
3. WHEN an access token expires, THE Scheduler SHALL automatically refresh it using the refresh token
4. IF authentication fails, THEN THE Scheduler SHALL display a specific error message (invalid credentials, account locked, session expired)
5. THE Scheduler SHALL store tokens securely (httpOnly cookies or secure memory, never localStorage for tokens)
6. WHEN a user logs out, THE Scheduler SHALL invalidate the session on both client and server
7. THE Scheduler SHALL enforce password requirements: minimum 8 characters, at least one uppercase, one lowercase, and one number

---

### Requirement 7: Data Persistence Layer

**User Story:** As an administrator, I want all schedule data persisted to a database, so that schedules survive page reloads and can be accessed across sessions.

#### Acceptance Criteria

1. THE API_Server SHALL provide RESTful endpoints for CRUD operations on lecturers, rooms, faculties, and schedules
2. THE Scheduler SHALL persist all entity data to a PostgreSQL database
3. WHEN the user creates a new entity, THE Scheduler SHALL save it immediately to the database
4. WHEN the user modifies an entity, THE Scheduler SHALL update the database within 1 second
5. THE Scheduler SHALL support saving multiple named schedule configurations per user
6. WHEN the application loads, THE Scheduler SHALL restore the user's most recent schedule state
7. IF a database operation fails, THEN THE Scheduler SHALL display an error message and provide retry option

---

### Requirement 8: Faculty Management

**User Story:** As an administrator, I want to manage faculties/courses with their syllabi and students, so that I can configure what needs to be scheduled.

#### Acceptance Criteria

1. THE Scheduler SHALL provide a form to create new faculties with name, syllabus subjects, and required hours per subject
2. THE Scheduler SHALL provide a form to add, edit, and remove students from a faculty
3. WHEN a faculty is created, THE Scheduler SHALL validate that required hours are positive integers
4. THE Scheduler SHALL display all faculties in a searchable, sortable list
5. WHEN a user selects a faculty, THE Scheduler SHALL display its timetable, student list, and syllabus summary
6. THE Scheduler SHALL prevent deletion of a faculty that has scheduled classes (require unscheduling first)

---

### Requirement 9: Lecturer Management

**User Story:** As an administrator, I want to manage lecturers with their specialties and availability, so that I can configure who teaches what.

#### Acceptance Criteria

1. THE Scheduler SHALL provide a form to create lecturers with name, surname, specialty, and profile image
2. THE Scheduler SHALL provide an interface to set lecturer availability (block specific time slots)
3. WHEN a lecturer is created, THE Scheduler SHALL validate that specialty matches a subject in at least one faculty syllabus
4. THE Scheduler SHALL display all lecturers in a filterable grid with specialty tags
5. WHEN a user selects a lecturer, THE Scheduler SHALL display their weekly timetable and assigned classes
6. THE Scheduler SHALL support assigning multiple specialties to a single lecturer

---

### Requirement 10: Room Management

**User Story:** As an administrator, I want to manage rooms with their capacities, so that I can configure where classes can be held.

#### Acceptance Criteria

1. THE Scheduler SHALL provide a form to create rooms with room number and capacity
2. THE Scheduler SHALL provide an interface to set room availability (block specific time slots for maintenance)
3. WHEN a room is created, THE Scheduler SHALL validate that capacity is a positive integer between 1 and 500
4. THE Scheduler SHALL display all rooms grouped by capacity range with occupancy statistics
5. WHEN a user selects a room, THE Scheduler SHALL display its weekly timetable and utilization percentage
6. THE Scheduler SHALL calculate and display overall room utilization across all rooms

---

### Requirement 11: Timetable Display Components

**User Story:** As a user, I want clear, interactive timetable displays, so that I can easily view and understand schedules.

#### Acceptance Criteria

1. THE Scheduler SHALL display timetables as a 5-day (Monday-Friday) by 4-hour grid
2. WHEN a time slot is occupied, THE Scheduler SHALL display the assigned class with color coding by lecturer or subject
3. THE Scheduler SHALL provide hover tooltips showing full details of each scheduled class
4. THE Scheduler SHALL support viewing timetables by lecturer, by room, or by faculty
5. WHEN viewing a timetable, THE Scheduler SHALL allow exporting it as PDF or image
6. THE Scheduler SHALL highlight conflicts (if any) in scheduled timetables with distinct visual indicators

---

### Requirement 12: Manual Schedule Editing

**User Story:** As an administrator, I want to manually adjust generated schedules, so that I can handle special cases the algorithm cannot anticipate.

#### Acceptance Criteria

1. THE Scheduler SHALL provide drag-and-drop functionality to move classes between time slots
2. WHEN a user drags a class, THE Scheduler SHALL validate constraints and prevent invalid placements
3. IF a manual placement violates constraints, THEN THE Scheduler SHALL highlight the conflict and explain the violation
4. THE Scheduler SHALL provide an undo/redo stack for manual edits with at least 50 actions
5. WHEN manual edits are made, THE Scheduler SHALL update all affected timetables (lecturer, room, faculty) simultaneously
6. THE Scheduler SHALL distinguish between auto-generated and manually-placed classes visually

---

### Requirement 13: Testing Infrastructure

**User Story:** As a developer, I want comprehensive test coverage, so that refactoring and new features do not break existing functionality.

#### Acceptance Criteria

1. THE Scheduler SHALL have unit tests for the scheduling algorithm with at least 90% code coverage
2. THE Scheduler SHALL have integration tests for all API endpoints
3. THE Scheduler SHALL have component tests for all interactive UI components
4. THE Scheduler SHALL have end-to-end tests for critical user flows (login, create entities, generate schedule)
5. WHEN tests run in CI, THE Scheduler SHALL complete all tests within 5 minutes
6. THE Scheduler SHALL use Vitest for unit/integration tests and Playwright or Cypress for E2E tests

---

### Requirement 14: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when things go wrong, so that I know what happened and how to proceed.

#### Acceptance Criteria

1. WHEN an API request fails, THE Scheduler SHALL display a toast notification with the error type
2. WHEN a form validation fails, THE Scheduler SHALL highlight invalid fields with inline error messages
3. WHEN a long operation runs, THE Scheduler SHALL display a progress indicator
4. IF the network connection is lost, THEN THE Scheduler SHALL display an offline indicator and queue operations
5. THE Scheduler SHALL log client-side errors for debugging purposes
6. WHEN an unexpected error occurs, THE Scheduler SHALL display a friendly error page with retry option

---

### Requirement 15: Performance Optimization

**User Story:** As a user, I want the application to be fast and responsive, so that managing schedules is efficient.

#### Acceptance Criteria

1. THE Scheduler SHALL achieve a Lighthouse performance score of 90 or higher
2. THE Scheduler SHALL load the initial page within 2 seconds on a 3G connection
3. THE Scheduler SHALL implement code splitting so that only needed code loads for each route
4. THE Scheduler SHALL lazy-load images and non-critical components
5. WHEN displaying large datasets, THE Scheduler SHALL use virtualization for lists exceeding 100 items
6. THE Scheduler SHALL cache API responses appropriately to reduce redundant requests
