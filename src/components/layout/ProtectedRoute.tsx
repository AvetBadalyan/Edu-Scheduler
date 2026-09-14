import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/authSlice'

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location        = useLocation()
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export default ProtectedRoute
