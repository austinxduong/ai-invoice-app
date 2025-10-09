import { Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from './landing/layout/DashboardLayout'

const ProtectedRoute = ({children}) => {
    const isAuthenticated = true
    const loading = false

    if (loading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

  return (
    <DashboardLayout>{children ? children : <Outlet/>}</DashboardLayout>
  )
}

export default ProtectedRoute