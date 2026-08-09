import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';
import { ApiError } from '../lib/api';
import { isAdmin, useAuth } from '../lib/auth';

const FIELD =
  'w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm font-light text-white outline-none transition-colors placeholder:text-gray-600 focus:border-orange-400/50';
const LABEL =
  'mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500';

/**
 * The admin door. Deliberately unlinked from the public site — there is no
 * sign-up path and no link from the landing page or citizen portal.
 */
export default function AdminLoginPage() {
  const { user, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // already signed in — send them wherever they actually belong
  if (user) {
    return <Navigate to={isAdmin(user) ? '/authority' : '/citizen'} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminLogin(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/authority', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="liquid-blob liquid-blob-a" />
        <div className="liquid-blob liquid-blob-b" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Link
          to="/"
          className="mb-8 block text-center text-xl font-black tracking-tighter text-white"
        >
          CivicLens<span className="text-gradient-accent">AI</span>
        </Link>

        <div className="rounded-3xl border border-orange-400/20 bg-white/5 p-8 backdrop-blur-xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-300">
            <ShieldAlert size={11} />
            Restricted
          </span>

          <h1 className="mb-2 text-3xl font-black leading-tight tracking-tighter text-white">
            Admin <span className="text-gradient-accent">panel</span>
          </h1>
          <p className="mb-7 text-sm font-light leading-relaxed text-gray-400">
            Sign in to reach the authority dashboard and social intelligence
            feed. Citizen accounts cannot access this area.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="admin-email" className={LABEL}>
                Admin email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@civiclens.local"
                  className={FIELD}
                />
              </div>
            </div>

            <div className="mb-2">
              <label htmlFor="admin-password" className={LABEL}>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={FIELD}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs font-light text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Signing in…
                </>
              ) : (
                <>
                  Enter admin panel
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] font-light text-gray-600">
          Looking for the citizen portal?{' '}
          <Link
            to="/login"
            className="font-semibold text-gray-400 underline-offset-4 hover:text-white hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
