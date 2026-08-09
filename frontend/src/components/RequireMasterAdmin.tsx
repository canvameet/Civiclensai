import { Navigate, useLocation } from 'react-router-dom';
import type React from 'react';
import { isMasterAdmin, useAuth } from '../lib/auth';

export default function RequireMasterAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-orange-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isMasterAdmin(user)) {
    return <Navigate to="/authority" replace />;
  }

  return <>{children}</>;
}
