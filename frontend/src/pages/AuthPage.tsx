import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { ApiError } from '../lib/api';
import { isAdmin, useAuth } from '../lib/auth';

const FIELD =
  'w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm font-light text-white outline-none transition-colors placeholder:text-gray-600 focus:border-orange-400/50';
const LABEL =
  'mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500';

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // already signed in — don't show the form again
  if (user) {
    return <Navigate to={isAdmin(user) ? '/authority' : '/citizen'} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // this door only ever issues citizen sessions — the server rejects
      // privileged accounts here and points them at the admin portal
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/citizen', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink px-4 py-16">
      {/* same molten wash as the landing cards, so auth doesn't feel bolted on */}
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

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Citizen Access
          </span>

          <h1 className="mb-2 text-3xl font-black leading-tight tracking-tighter text-white">
            {isSignup ? (
              <>
                Create your <span className="text-gradient-accent">account</span>
              </>
            ) : (
              <>
                Welcome <span className="text-gradient-accent">back</span>
              </>
            )}
          </h1>
          <p className="mb-7 text-sm font-light leading-relaxed text-gray-400">
            {isSignup
              ? 'Sign up to report civic issues and track them through to resolution.'
              : 'Sign in to submit reports and follow their progress.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="mb-4">
                <label htmlFor="name" className={LABEL}>
                  Full name
                </label>
                <div className="relative">
                  <UserIcon
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                  />
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={FIELD}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className={LABEL}>
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={FIELD}
                />
              </div>
            </div>

            <div className="mb-2">
              <label htmlFor="password" className={LABEL}>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={isSignup ? 8 : undefined}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={FIELD}
                />
              </div>
              {isSignup && (
                <p className="mt-2 text-[11px] font-light text-gray-600">
                  At least 8 characters.
                </p>
              )}
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
                  {isSignup ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                <>
                  {isSignup ? 'Create account' : 'Sign in'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-light text-gray-500">
            {isSignup ? 'Already have an account? ' : 'New to CivicLens? '}
            <Link
              to={isSignup ? '/login' : '/signup'}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-light text-gray-600">
          <ShieldCheck size={12} />
          Citizen accounts only. Authority access is provisioned internally.
        </p>
      </motion.div>
    </div>
  );
}
