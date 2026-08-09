import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ExternalLink, RadioTower, Sparkles } from 'lucide-react';
import {
  AREAS,
  ApiError,
  convertPost,
  getSocialFeed,
  triggerScrape,
  type SocialPost,
} from '../lib/api';
import { XIcon } from '../components/BrandIcons';
import {
  BTN_GHOST,
  DashboardShell,
  EmptyState,
  ErrorNote,
  FIELD,
  LABEL,
  Panel,
  Spinner,
} from '../components/dashboard/Shell';

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { posts } = await getSocialFeed(area ? { area } : {});
      setPosts(posts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, [area]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleScrape() {
    setScraping(true);
    setError(null);
    setNotice(null);
    try {
      const res = await triggerScrape();
      setNotice(`${res.message} — ${res.civicPostsTotal} civic posts stored.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Scrape failed.');
    } finally {
      setScraping(false);
    }
  }

  async function handleConvert(post: SocialPost) {
    setConverting(post.postId);
    setError(null);
    try {
      await convertPost(post.postId);
      // reflect immediately; the feed refetch confirms it
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === post.postId ? { ...p, convertedToComplaint: true } : p,
        ),
      );
      setNotice('Converted to a formal complaint — visible on the Authority dashboard.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Conversion failed.');
    } finally {
      setConverting(null);
    }
  }

  return (
    <DashboardShell
      eyebrow="Social Intelligence"
      title={
        <>
          CivicLens doesn&apos;t wait.{' '}
          <span className="text-gradient-accent">It finds them.</span>
        </>
      }
      intro="We monitor X for civic complaints in your area, classify them with AI, and let you turn a post into a formal complaint in one click."
      actions={
        <button
          type="button"
          onClick={handleScrape}
          disabled={scraping}
          className={BTN_GHOST}
        >
          {scraping ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Scraping…
            </>
          ) : (
            <>
              <RadioTower size={14} /> Trigger scrape
            </>
          )}
        </button>
      }
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-56">
          <label className={LABEL}>Filter by area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={`${FIELD} py-2.5 text-xs`}
            aria-label="Filter by area"
          >
            <option value="" className="bg-ink">
              All areas
            </option>
            {AREAS.map((a) => (
              <option key={a} value={a} className="bg-ink">
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
      {notice && (
        <div className="mb-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-sm font-light text-emerald-200">
          {notice}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading social signals…" />
      ) : posts.length === 0 ? (
        <EmptyState>
          No civic posts captured yet. Hit <strong>Trigger scrape</strong> to sweep
          X for complaints in your area.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post._id || post.postId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Panel className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-black text-black">
                      <XIcon size={11} />
                    </span>
                    <span className="text-xs font-semibold text-gray-300">
                      {post.author ? `@${post.author.replace(/^@/, '')}` : 'unknown'}
                    </span>
                  </div>
                  {post.category && (
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                      {post.category}
                    </span>
                  )}
                </div>

                <p className="mb-4 flex-1 text-sm font-light leading-relaxed text-gray-200">
                  “{post.text}”
                </p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Media attached to the social post"
                    loading="lazy"
                    className="mb-4 h-36 w-full rounded-xl border border-white/10 object-cover"
                  />
                )}

                <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-light text-gray-600">
                  {post.area && <span>📍 {post.area}</span>}
                  <span>{new Date(post.scrapedAt).toLocaleDateString()}</span>
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 transition-colors hover:text-white"
                    >
                      Source <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-2">
                  <Sparkles size={12} className="text-orange-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
                    Detected as civic issue
                  </span>
                </div>

                {post.convertedToComplaint ? (
                  <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300">
                    <Check size={14} /> Converted
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConvert(post)}
                    disabled={converting === post.postId}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {converting === post.postId ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Converting…
                      </>
                    ) : (
                      <>
                        Convert to Complaint <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </Panel>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
