import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="center-note">Carregando...</p>
  if (!isAuthenticated) {
    return <Navigate to="/entrar" state={{ from: location }} replace />
  }
  return <>{children}</>
}
