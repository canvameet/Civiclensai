import type React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Severity, Status } from '../../lib/api';
import { STATUSES } from '../../lib/api';
import { isAdmin, isMasterAdmin, useAuth } from '../../lib/auth';

/* ---------------- chrome ---------------- */

const CITIZEN_TABS = [{ to: '/citizen', label: 'Citizen' }];

/** Authority and Social Intelligence live behind the admin panel only. */
const ADMIN_TABS = [
  { to: '/authority', label: 'Authority' },
  { to: '/social', label: 'Social Intelligence' },
];

const MASTER_ADMIN_TABS = [
  { to: '/authority', label: 'Authority' },
  { to: '/social', label: 'Social Intelligence' },
  { to: '/master-admin', label: 'Manage Admins' },
];

export function DashboardShell({
  eyebrow,
  title,
  intro,
  actions,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const admin = isAdmin(user);
  const master = isMasterAdmin(user);
  const tabs = master ? MASTER_ADMIN_TABS : admin ? ADMIN_TABS : CITIZEN_TABS;

  return (
    <div className="min-h-screen w-full bg-ink text-white selection:bg-orange-500/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-black tracking-tighter text-white">
            CivicLens<span className="text-gradient-accent">AI</span>
            {admin && (
              <span className="ml-2 rounded-md border border-orange-400/25 bg-orange-500/10 px-2 py-0.5 align-middle font-mono text-[10px] font-bold uppercase tracking-widest text-orange-300">
                Admin
              </span>
            )}
          </Link>

          <nav aria-label="Dashboards" className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
            <Link
              to="/"
              className="ml-2 rounded-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
            >
              &larr; Home
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-xs font-light text-gray-400 sm:block">
                  {user.name}
                  <span className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-gray-400 transition-colors hover:border-white/30 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
              {eyebrow}
            </span>
            <h1 className="text-4xl font-black leading-tight tracking-tighter text-white sm:text-5xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-gray-400">
                {intro}
              </p>
            )}
          </div>
          {actions}
        </motion.div>

        {children}
      </main>
    </div>
  );
}

/* ---------------- primitives ---------------- */

export const PANEL =
  'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_0_35px_rgba(255,255,255,0.12)]';

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`${PANEL} ${className}`}>{children}</section>;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: 'bg-red-500/15 text-red-300 border-red-400/25',
  High: 'bg-orange-500/15 text-orange-300 border-orange-400/25',
  Medium: 'bg-amber-500/15 text-amber-200 border-amber-400/25',
  Low: 'bg-white/5 text-gray-400 border-white/15',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
        SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.Low
      }`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const resolved = status === 'Resolved';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        resolved
          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
          : 'border-white/10 bg-white/5 text-gray-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          resolved ? 'bg-emerald-400' : 'bg-orange-400'
        }`}
      />
      {status}
    </span>
  );
}

/** The 5-stage pipeline, filled up to the current status. */
export function StatusStepper({
  status,
  history,
}: {
  status: Status;
  history?: { status: string; changedAt: string; note?: string }[];
}) {
  const activeIndex = STATUSES.indexOf(status);
  return (
    <ol className="flex flex-col gap-2.5">
      {STATUSES.map((stage, i) => {
        const done = i <= activeIndex;
        const entry = history?.find((h) => h.status === stage);
        return (
          <li key={stage} className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                done ? 'bg-orange-400' : 'border border-white/20'
              }`}
            />
            <span className="flex flex-col">
              <span
                className={`text-xs ${
                  done ? 'font-medium text-white' : 'font-light text-gray-600'
                }`}
              >
                {stage}
              </span>
              {entry && (
                <span className="text-[10px] font-light text-gray-600">
                  {new Date(entry.changedAt).toLocaleString()}
                  {entry.note ? ` — ${entry.note}` : ''}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- states ---------------- */

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-light text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-orange-400" />
      {label ?? 'Loading…'}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm font-light text-gray-600">
      {children}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm font-light text-red-200"
    >
      {children}
    </div>
  );
}

/* form primitives, shared so the three pages stay visually identical */
export const FIELD =
  'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-light text-white outline-none transition-colors placeholder:text-gray-600 focus:border-orange-400/50';

export const LABEL =
  'mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-500';

export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100';

export const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100';
