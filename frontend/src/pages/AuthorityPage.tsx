import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, RefreshCw } from 'lucide-react';
import {
  ApiError,
  CATEGORIES,
  SEVERITIES,
  STATUSES,
  getAnalytics,
  getHotspots,
  listComplaints,
  subscribeToComplaints,
  updateStatus,
  type Analytics,
  type Complaint,
  type ComplaintFilters,
  type Hotspot,
  type Status,
} from '../lib/api';
import {
  BTN_GHOST,
  DashboardShell,
  EmptyState,
  ErrorNote,
  FIELD,
  LABEL,
  Panel,
  SeverityBadge,
  Spinner,
  StatusBadge,
  StatusStepper,
} from '../components/dashboard/Shell';

export default function AuthorityPage() {
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, stats, spots] = await Promise.all([
        listComplaints(filters),
        getAnalytics(),
        getHotspots(),
      ]);
      setComplaints(list.complaints);
      setAnalytics(stats);
      setHotspots(spots.hotspots);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not load dashboard data.',
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  // live updates — the stream only tells us *that* something changed, so refetch
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToComplaints(() => {
      if (!active) return;
      setLive(true);
      load();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [load]);

  async function handleStatus(id: string, status: Status) {
    // optimistic — the row updates before the round trip, SSE reconciles after
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status } : c)),
    );
    try {
      await updateStatus(id, status);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Status update failed.');
      load();
    }
  }

  const setFilter = (key: keyof ComplaintFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value || undefined }));

  return (
    <DashboardShell
      eyebrow="Authority Dashboard"
      title={
        <>
          Manage &amp; <span className="text-gradient-accent">resolve</span>
        </>
      }
      intro="Every report, sorted by severity and routed by AI. Status changes propagate to citizens instantly."
      actions={
        <div className="flex items-center gap-3">
          {live && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Live
              </span>
            </span>
          )}
          <button type="button" onClick={load} className={BTN_GHOST}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* ---------- stats ---------- */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total reports" value={analytics?.total ?? '—'} />
        <Stat
          label="Critical"
          value={
            analytics?.bySeverity.find((s) => s._id === 'Critical')?.count ?? 0
          }
          tone="critical"
        />
        <Stat label="Open" value={analytics?.open ?? '—'} />
        <Stat label="Resolved" value={analytics?.resolved ?? '—'} tone="good" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ---------- list ---------- */}
        <div className="lg:col-span-3">
          <Panel className="p-7">
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Select
                label="Category"
                value={filters.category ?? ''}
                options={CATEGORIES}
                onChange={(v) => setFilter('category', v)}
              />
              <Select
                label="Severity"
                value={filters.severity ?? ''}
                options={SEVERITIES}
                onChange={(v) => setFilter('severity', v)}
              />
              <Select
                label="Status"
                value={filters.status ?? ''}
                options={STATUSES}
                onChange={(v) => setFilter('status', v)}
              />
              <Select
                label="Source"
                value={filters.source ?? ''}
                options={['citizen', 'twitter', 'reddit']}
                onChange={(v) => setFilter('source', v)}
              />
            </div>

            {loading ? (
              <Spinner label="Loading complaints…" />
            ) : complaints.length === 0 ? (
              <EmptyState>
                No complaints match these filters. Seed the database or clear the
                filters.
              </EmptyState>
            ) : (
              <ul className="flex flex-col gap-3">
                {complaints.map((c) => (
                  <ComplaintRow
                    key={c._id}
                    complaint={c}
                    open={openId === c._id}
                    onToggle={() =>
                      setOpenId((id) => (id === c._id ? null : c._id))
                    }
                    onStatus={handleStatus}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ---------- hotspots ---------- */}
        <Panel className="h-fit p-7">
          <div className="mb-5 flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Area hotspots
            </h2>
          </div>

          {hotspots.length === 0 ? (
            <p className="text-xs font-light text-gray-600">No data yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {hotspots.slice(0, 6).map((h, i) => {
                const max = hotspots[0]?.count || 1;
                return (
                  <li key={h._id ?? i}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold tracking-tight text-white">
                        {h._id || 'Unknown'}
                      </span>
                      <span className="font-mono text-[11px] text-gray-500">
                        {h.count} · {h.open} open
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(h.count / max) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}

/* ---------------- pieces ---------------- */

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  tone?: 'default' | 'critical' | 'good';
}) {
  const color =
    tone === 'critical'
      ? 'text-red-300'
      : tone === 'good'
        ? 'text-emerald-300'
        : 'text-white';
  return (
    <Panel className="p-6">
      <span className={`block text-4xl font-black tracking-tighter ${color}`}>
        {value}
      </span>
      <span className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
    </Panel>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} py-2.5 text-xs`}
        aria-label={label}
      >
        <option value="" className="bg-ink">
          All
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ComplaintRow({
  complaint: c,
  open,
  onToggle,
  onStatus,
}: {
  complaint: Complaint;
  open: boolean;
  onToggle: () => void;
  onStatus: (id: string, status: Status) => void;
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition-colors hover:border-white/20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={c.severity} />
            <span className="font-mono text-[11px] text-gray-500">
              {c.category} · {c.location?.area}
            </span>
            {c.source !== 'citizen' && (
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                {c.source}
              </span>
            )}
            {c.duplicateOf && (
              <span className="rounded-md border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-200">
                Duplicate
              </span>
            )}
          </div>
          <p className="truncate text-sm font-light text-gray-200">
            {c.summary || c.rawText}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden border-t border-white/5"
        >
          <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
            <div>
              <span className={LABEL}>Full report</span>
              <p className="mb-4 text-sm font-light leading-relaxed text-gray-300">
                {c.rawText}
              </p>

              {c.routingExplanation && (
                <>
                  <span className={LABEL}>AI routing</span>
                  <p className="mb-4 text-sm font-light italic leading-relaxed text-gray-400">
                    “{c.routingExplanation}”
                  </p>
                </>
              )}
              {c.severityReason && (
                <>
                  <span className={LABEL}>Severity reason</span>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-400">
                    {c.severityReason}
                  </p>
                </>
              )}
              {c.department && (
                <p className="text-xs font-light text-gray-500">
                  Assigned to{' '}
                  <span className="text-white">{c.department}</span>
                </p>
              )}
              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt="Evidence submitted with the complaint"
                  loading="lazy"
                  className="mt-4 h-40 w-auto rounded-xl border border-white/10 object-cover"
                />
              )}
            </div>

            <div>
              <span className={LABEL}>Pipeline</span>
              <div className="mb-5">
                <StatusStepper status={c.status} history={c.statusHistory} />
              </div>

              <span className={LABEL}>Advance status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={s === c.status}
                    onClick={() => onStatus(c._id, s)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      s === c.status
                        ? 'cursor-default border-orange-400/40 bg-orange-500/15 text-orange-200'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </li>
  );
}
