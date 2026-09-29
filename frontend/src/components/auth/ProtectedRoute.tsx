import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { token, user, initialized, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    if (!initialized && token) {
      checkAuth();
    }
  }, [initialized, token, checkAuth]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!initialized && loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (initialized && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
