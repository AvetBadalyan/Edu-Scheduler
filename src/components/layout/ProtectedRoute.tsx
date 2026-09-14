/**
 * ProtectedRoute — guards authenticated sections of the app.
 *
 * Redirects unauthenticated users to the login page, preserving the
 * originally requested location so they can be returned to it after login.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
