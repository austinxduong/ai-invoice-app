import { Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({children}) => {
const { isAuthenticated, loading } = useAuth();

console.log('Protected Route Check:', {isAuthenticated, loading});

console.log('🛡️ ProtectedRoute check:', {
  isAuthenticated,
  loading,
  currentPath:window.location.pathname
})


    if (loading) {
      console.log('🛡️ SHOWING LOADING STATE')
        return (            
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>)
    }

    if (!isAuthenticated) {
      console.log('🛡️ User not authenticated, redirecting to login');
      console.log('🛡️ Current location before redirect:', window.location.pathname);
        // return <Navigate to="/login" replace />;
    }

  console.log("🛡️User authenticated, rendering protected content");
  return (
    <DashboardLayout>{children ? children : <Outlet/>}</DashboardLayout>
  )
}

export default ProtectedRoute