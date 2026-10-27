/**
 * Shared cross-slice reset action.
 *
 * Dispatched on logout (and any other full-session teardown) so every slice
 * can clear its own state. Slices listen for this in their extraReducers.
 * Kept in its own module so slices can import it without creating import
 * cycles between them.
 */
import { createAction } from '@reduxjs/toolkit'

/** Clears all per-session data (entities, schedule, edit history, university). */
export const resetAppState = createAction('app/resetAll')
