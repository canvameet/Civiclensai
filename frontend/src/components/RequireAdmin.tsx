import { Navigate, useLocation } from 'react-router-dom';
import type React from 'react';
import { isAdmin, useAuth } from '../lib/auth';

/**
 * Gate for the admin panel (authority dashboard + social intelligence).
 *
 * A signed-in citizen is sent to their own portal rather than the admin login
 * — bouncing them to a form they can never satisfy just looks broken. Anyone
 * else goes to the admin door, which is a separate route from /login.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
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
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  if (!isAdmin(user)) {
    return <Navigate to="/citizen" replace />;
  }

  return <>{children}</>;
}
