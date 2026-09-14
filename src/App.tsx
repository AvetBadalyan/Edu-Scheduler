/**
 * App — routing and top-level composition.
 */
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'
import { useAuthenticatedMode } from '@/hooks/useAuthenticatedMode'
import { useSeedData } from '@/hooks/useSeedData'
import { supabase } from '@/lib/supabase'
import {
  FacultiesPage,
  HomePage,
  LandingPage,
  LecturersPage,
  LoginPage,
  RoomsPage,
  SchedulePage
} from '@/pages'
import { DEMO_USER, setSessionUser } from '@/store/authSlice'
import { useAppDispatch } from '@/store/hooks'
import type { User } from '@/types'
import { Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  useSeedData()
  useSupabaseAuthSync()
  useAuthenticatedMode()

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Suspense fallback={null}><LandingPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard"  element={<HomePage />} />
            <Route path="lecturers"  element={<LecturersPage />} />
            <Route path="rooms"      element={<RoomsPage />} />
            <Route path="faculties"  element={<FacultiesPage />} />
            <Route path="schedule"   element={<SchedulePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  )
}

function useSupabaseAuthSync() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) return
        const sbUser = session.user
        const user: User = {
          id:        sbUser.id,
          email:     sbUser.email ?? '',
          name:      (sbUser.user_metadata?.name as string) ?? sbUser.email?.split('@')[0] ?? 'User',
          createdAt: new Date(sbUser.created_at),
        }
        if (user.id === DEMO_USER.id) return
        dispatch(setSessionUser(user))
      }
    )
    return () => subscription.unsubscribe()
  }, [dispatch])
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <a href="/" className="text-primary underline underline-offset-4">Back to home</a>
    </div>
  )
}
