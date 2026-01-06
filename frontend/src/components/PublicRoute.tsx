import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface PublicRouteProps {
  children: React.ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Render children if not authenticated
  return <>{children}</>
}
