import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({
  children,
  requireTutor = false,
  requireStudent = false,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session is being verified from local storage / API
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for Tutor role restriction
  if (requireTutor && !user?.is_tutor) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for Student role restriction
  if (requireStudent && !user?.is_student) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};