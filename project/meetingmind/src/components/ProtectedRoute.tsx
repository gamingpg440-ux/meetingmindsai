import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../context/useAuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}