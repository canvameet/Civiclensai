import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Check,
  Database,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Radio,
  Sparkles,
} from 'lucide-react';

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
} as const;

const CARD =
  'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(255,255,255,0.18)]';

/* scale lives in framer-motion (it owns the card transforms), shadow in CSS;
   the inner transition keeps hover snappy instead of inheriting the 0.8s entrance */
const CARD_HOVER = {
  scale: 1.02,
  transition: { duration: 0.25, ease: 'easeOut' },
} as const;

function StepLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-6">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
        {n}
      </span>
      <h3 className="mt-2 text-2xl font-black tracking-tighter text-white">
        {title}
      </h3>
    </div>
  );
}

/* a labelled node in a vertical flow diagram */
function FlowNode({
  label,
  Icon,
  accent = false,
}: {
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
        accent
          ? 'border-orange-400/30 bg-orange-500/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <Icon size={15} className={accent ? 'text-orange-300' : 'text-gray-400'} />
      <span className="text-xs font-semibold tracking-tight text-gray-200">
        {label}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1.5">
      <ArrowDown size={14} className="text-gray-600" />
    </div>
  );
}

/* one row of the AI analysis readout */
function DataRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'critical';
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <span
        className={`text-right font-mono text-xs font-semibold ${
          tone === 'critical'
            ? 'rounded-md bg-red-500/15 px-2 py-1 text-red-300'
            : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
        <Check size={10} className="text-emerald-400" />
      </span>
      <span className="text-xs font-light text-gray-300">{children}</span>
    </li>
  );
}

/* the 5-stage complaint pipeline */
const STAGES = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

function Stepper({ activeUpTo }: { activeUpTo: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {STAGES.map((stage, i) => {
        const done = i <= activeUpTo;
        return (
          <li key={stage} className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                done ? 'bg-orange-400' : 'border border-white/20 bg-transparent'
              }`}
            />
            <span
              className={`text-xs ${
                done ? 'font-medium text-white' : 'font-light text-gray-600'
              }`}
            >
              {stage}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function HowItWorks() {
  return (
    <section id="work" className="relative w-full py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          {...reveal}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md">
            How It Works
          </span>
          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tighter text-white sm:text-5xl lg:text-6xl">
            From complaint{' '}
            <span className="text-gray-600">&rarr;</span> intelligence{' '}
            <span className="text-gray-600">&rarr;</span>{' '}
            <span className="text-gradient-accent">action</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* ---------- 01 REPORT ---------- */}
          <motion.article
            {...reveal}
            whileHover={CARD_HOVER}
            transition={{ duration: 0.8 }}
            className={`${CARD} md:col-span-1`}
          >
            <StepLabel n="01 — Report" title="Citizen reports an issue" />

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                New Complaint
              </span>

              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-light text-gray-200">
                Road damage on CG Road
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-gray-300">
                  <MapPin size={11} className="text-orange-400" />
                  Navrangpura
                </span>
                <span className="inline-flex h-[26px] w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <ImageIcon size={12} className="text-gray-500" />
                </span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-[11px] font-bold text-black">
                Submit Report
                <ArrowRight size={12} />
              </div>
            </div>

            <p className="mt-5 text-xs font-light leading-relaxed text-gray-500">
              Describe the problem, choose your area, and optionally attach a
              photo.
            </p>
          </motion.article>

          {/* ---------- 02 AI ANALYSIS (hero card) ---------- */}
          <motion.article
            {...reveal}
            whileHover={CARD_HOVER}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`${CARD} border-white/20 bg-gradient-to-br from-amber-500/10 via-white/5 to-orange-500/10 md:col-span-2`}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />

            <div className="relative">
              <StepLabel n="02 — AI Analyzes" title="CivicLens understands it" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={13} className="text-orange-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
                      AI Analysis
                    </span>
                  </div>

                  <DataRow label="Category" value="ROADS" />
                  <DataRow label="Severity" value="CRITICAL" tone="critical" />
                  <DataRow label="Department" value="AMC ROADS DEPT." />
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Why?
                    </span>
                    <p className="text-sm font-light italic leading-relaxed text-gray-200">
                      &ldquo;Pothole + high traffic area&rdquo;
                    </p>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    <CheckLine>Duplicate check</CheckLine>
                    <CheckLine>Image analyzed</CheckLine>
                    <CheckLine>Issue summarized</CheckLine>
                  </ul>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ---------- 03 CONNECT ---------- */}
          <motion.article
            {...reveal}
            whileHover={CARD_HOVER}
            transition={{ duration: 0.8 }}
            className={`${CARD} md:col-span-1`}
          >
            <StepLabel n="03 — Connect" title="Issues become actionable" />

            <div className="mb-5">
              <FlowNode label="CivicLens AI" Icon={Sparkles} accent />
              <Arrow />
              <FlowNode label="MongoDB" Icon={Database} />
              <Arrow />
              <FlowNode label="Authority Dashboard" Icon={LayoutDashboard} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <span className="inline-block rounded-md bg-red-500/15 px-2 py-1 font-mono text-[10px] font-bold text-red-300">
                CRITICAL
              </span>
              <h4 className="mt-2.5 text-sm font-bold tracking-tight text-white">
                Pothole &mdash; CG Road
              </h4>
              <p className="mt-1 text-[11px] font-light text-gray-500">
                Navrangpura &middot; AMC Roads Department
              </p>
              <div className="mt-4 border-t border-white/5 pt-4">
                <Stepper activeUpTo={0} />
              </div>
            </div>
          </motion.article>

          {/* ---------- 04 RESOLVE ---------- */}
          <motion.article
            {...reveal}
            whileHover={CARD_HOVER}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`${CARD} flex flex-col md:col-span-2`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <StepLabel n="04 — Resolve" title="Authorities act. Citizens track." />
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Live &middot; updated just now
                </span>
              </span>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <span className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <Activity size={11} /> Authority
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-200">
                    Status updated
                  </span>
                  <Arrow />
                  <span className="text-xs font-medium text-gray-200">
                    Assigned
                  </span>
                  <Arrow />
                  <span className="text-xs font-medium text-gray-200">
                    In Progress
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <span className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <Radio size={11} /> Citizen
                </span>
                <Stepper activeUpTo={3} />
              </div>
            </div>
          </motion.article>

          {/* ---------- 05 PROACTIVE (full width) ---------- */}
          <motion.article
            {...reveal}
            whileHover={CARD_HOVER}
            transition={{ duration: 0.8 }}
            className={`${CARD} md:col-span-3`}
          >
            <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[90px]" />

            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Proactive Civic Intelligence
                </span>
                <h3 className="max-w-md text-3xl font-black leading-tight tracking-tighter text-white sm:text-4xl">
                  CivicLens doesn&apos;t wait for reports.{' '}
                  <span className="text-gradient-accent">It finds them.</span>
                </h3>
                <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-gray-400">
                  We monitor X for civic complaints in your area, classify them
                  with AI, and let authorities turn a post into a formal
                  complaint in one click.
                </p>
              </div>

              {/* social signal -> formal complaint chain */}
              <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
                      X
                    </span>
                    <span className="text-[11px] font-semibold text-gray-300">
                      @cityuser
                    </span>
                  </div>
                  <p className="text-xs font-light text-gray-200">
                    &ldquo;Huge pothole on CG Road, been like this for weeks
                    @AMC_Ahmedabad&rdquo;
                  </p>
                </div>

                <ArrowDown size={14} className="text-gray-600" />

                <div className="inline-flex items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2">
                  <Sparkles size={13} className="text-orange-300" />
                  <span className="text-xs font-bold tracking-tight text-orange-200">
                    Gemini AI
                  </span>
                </div>

                <ArrowDown size={14} className="text-gray-600" />

                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-xs font-bold tracking-tight text-emerald-300">
                    Civic issue detected
                  </span>
                </div>

                <ArrowDown size={14} className="text-gray-600" />

                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  Convert to Complaint
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
