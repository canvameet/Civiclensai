import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  AREAS,
  ApiError,
  listComplaints,
  submitComplaint,
  type Complaint,
} from '../lib/api';
import {
  BTN_PRIMARY,
  DashboardShell,
  EmptyState,
  ErrorNote,
  FIELD,
  LABEL,
  Panel,
  SeverityBadge,
  Spinner,
  StatusStepper,
  StatusBadge,
} from '../components/dashboard/Shell';

export default function CitizenPage() {
  const [rawText, setRawText] = useState('');
  const [area, setArea] = useState(AREAS[0]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Complaint | null>(null);

  const [mine, setMine] = useState<Complaint[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadMine() {
    setLoadingList(true);
    setListError(null);
    try {
      const { complaints } = await listComplaints({ source: 'citizen' });
      setMine(complaints);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Could not load reports.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMine();
  }, []);

  // object URLs must be revoked or they leak for the life of the tab
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;

    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const { complaint } = await submitComplaint({
        rawText: rawText.trim(),
        area,
        image,
      });
      setResult(complaint);
      setRawText('');
      setImage(null);
      if (fileInput.current) fileInput.current.value = '';
      loadMine();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell
      eyebrow="Citizen Portal"
      title={
        <>
          Report a <span className="text-gradient-accent">civic issue</span>
        </>
      }
      intro="Describe the problem, choose your area, and optionally attach a photo. CivicLens classifies it, assesses severity, and routes it to the right department in seconds."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ---------- form ---------- */}
        <Panel className="p-7 lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <h2 className="mb-6 text-xl font-black tracking-tighter text-white">
              New complaint
            </h2>

            <label htmlFor="desc" className={LABEL}>
              Description
            </label>
            <textarea
              id="desc"
              rows={4}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Describe what you observed, when, and exactly where…"
              className={`${FIELD} resize-y`}
            />

            <label htmlFor="area" className={`${LABEL} mt-5`}>
              Area
            </label>
            <select
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={FIELD}
            >
              {AREAS.map((a) => (
                <option key={a} value={a} className="bg-ink">
                  {a}
                </option>
              ))}
            </select>

            <label htmlFor="photo" className={`${LABEL} mt-5`}>
              Photo evidence <span className="text-gray-700">(optional)</span>
            </label>
            <input
              id="photo"
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="block w-full text-xs font-light text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20"
            />

            {preview && (
              <div className="relative mt-4 inline-block">
                <img
                  src={preview}
                  alt="Selected evidence preview"
                  className="h-28 w-auto rounded-xl border border-white/10 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Remove photo"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-ink text-gray-300 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5">
                <ErrorNote>{error}</ErrorNote>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !rawText.trim()}
              className={`${BTN_PRIMARY} mt-6 w-full`}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Analyzing…
                </>
              ) : (
                <>
                  Submit Report <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </Panel>

        {/* ---------- AI result + history ---------- */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {result && <AiResultCard complaint={result} />}

          <Panel className="p-7">
            <h2 className="mb-6 text-xl font-black tracking-tighter text-white">
              Your reports
            </h2>

            {loadingList ? (
              <Spinner label="Loading your reports…" />
            ) : listError ? (
              <ErrorNote>{listError}</ErrorNote>
            ) : mine.length === 0 ? (
              <EmptyState>
                No reports yet — submit one on the left and it will appear here.
              </EmptyState>
            ) : (
              <ul className="flex flex-col gap-4">
                {mine.map((c) => (
                  <li
                    key={c._id}
                    className="rounded-2xl border border-white/10 bg-black/40 p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={c.severity} />
                        <span className="font-mono text-[11px] text-gray-500">
                          {c.category} · {c.location?.area}
                        </span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    <p className="text-sm font-light leading-relaxed text-gray-200">
                      {c.summary || c.rawText}
                    </p>

                    {c.department && (
                      <p className="mt-2 text-[11px] font-light text-gray-600">
                        Routed to {c.department}
                      </p>
                    )}

                    <details className="group mt-4">
                      <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
                        Track progress
                      </summary>
                      <div className="mt-4 border-t border-white/5 pt-4">
                        <StatusStepper
                          status={c.status}
                          history={c.statusHistory}
                        />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ---------------- AI verdict ---------------- */

function AiResultCard({ complaint }: { complaint: Complaint }) {
  const isDuplicate = Boolean(complaint.duplicateOf);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Panel className="border-white/20 bg-gradient-to-br from-amber-500/10 via-white/5 to-orange-500/10 p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />

        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={14} className="text-orange-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
              AI Analysis
            </span>
          </div>

          {isDuplicate && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
              <TriangleAlert
                size={15}
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
                  Possible duplicate
                </p>
                <p className="mt-1 text-xs font-light leading-relaxed text-amber-100/80">
                  {complaint.similarityReason ||
                    'A similar issue was already reported in this area.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <Row label="Category" value={complaint.category} />
              <Row
                label="Severity"
                value={<SeverityBadge severity={complaint.severity} />}
              />
              <Row label="Department" value={complaint.department || '—'} />
              <Row
                label="Area"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={11} className="text-orange-400" />
                    {complaint.location?.area}
                  </span>
                }
              />
            </div>

            <div className="flex flex-col gap-4">
              {complaint.summary && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <span className={LABEL}>Summary</span>
                  <p className="text-sm font-light leading-relaxed text-gray-200">
                    {complaint.summary}
                  </p>
                </div>
              )}
              {complaint.routingExplanation && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <span className={LABEL}>Why this department?</span>
                  <p className="text-sm font-light italic leading-relaxed text-gray-300">
                    “{complaint.routingExplanation}”
                  </p>
                </div>
              )}
            </div>
          </div>

          {complaint.imageUrl && (
            <div className="mt-5 flex items-center gap-2 text-[11px] font-light text-gray-500">
              <ImageIcon size={12} /> Photo analyzed with the report
            </div>
          )}
        </div>
      </Panel>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <span className="text-right font-mono text-xs font-semibold text-white">
        {value}
      </span>
    </div>
  );
}
