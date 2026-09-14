/**
 * Lazy-loaded page components for route-based code splitting.
 * Each route gets its own chunk, loaded only when visited.
 * Requirements: 15.3
 */
import { lazy } from "react"

export const HomePage = lazy(() => import("./HomePage"))
export const LecturersPage = lazy(() => import("./LecturersPage"))
export const RoomsPage = lazy(() => import("./RoomsPage"))
export const FacultiesPage = lazy(() => import("./FacultiesPage"))
export const SchedulePage = lazy(() => import("./SchedulePage"))
export const LoginPage = lazy(() => import("./LoginPage"))
