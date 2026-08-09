import { Navigate, useLocation } from 'react-router-dom';
import type React from 'react';
import { useAuth } from '../lib/auth';

/**
 * Gate for citizen-facing routes. While the stored token is being verified we
 * render nothing rather than the login page, otherwise a signed-in user sees a
 * flash of the form on every refresh.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
