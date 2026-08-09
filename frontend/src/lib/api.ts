/**
 * Typed client for the CivicLens Express backend.
 *
 * Requests go to same-origin paths; Vite proxies /api and /uploads to :5000
 * in dev (see vite.config.ts). Set VITE_API_BASE to point elsewhere in prod.
 */

const BASE = import.meta.env.VITE_API_BASE ?? '';

export type Category = 'Roads' | 'Water' | 'Sanitation' | 'Electricity' | 'Other';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status =
  | 'Submitted'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export const STATUSES: Status[] = [
  'Submitted',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
];
export const CATEGORIES: Category[] = [
  'Roads',
  'Water',
  'Sanitation',
  'Electricity',
  'Other',
];
export const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

export const AREAS = [
  'Navrangpura',
  'Bopal',
  'Satellite',
  'Vastrapur',
  'Kalupur',
  'Prahladnagar',
  'Other',
];

export type StatusEntry = {
  status: Status;
  changedAt: string;
  note?: string;
};

export type Complaint = {
  _id: string;
  source: 'citizen' | 'reddit' | 'twitter';
  rawText: string;
  imageUrl: string | null;
  location: { area: string; city: string };
  category: Category;
  severity: Severity;
  severityReason?: string;
  department?: string;
  routingExplanation?: string;
  summary?: string;
  duplicateOf?: string | { _id: string; summary?: string } | null;
  similarityReason?: string;
  status: Status;
  statusHistory: StatusEntry[];
  socialPostRef?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SocialPost = {
  _id: string;
  platform: 'reddit' | 'twitter';
  postId: string;
  text: string;
  author?: string;
  url?: string;
  area?: string;
  imageUrl?: string;
  isCivicIssue: boolean;
  category?: string;
  convertedToComplaint: boolean;
  linkedComplaint?: string | null;
  scrapedAt: string;
};

export type Analytics = {
  byCategory: { _id: string; count: number }[];
  bySeverity: { _id: string; count: number }[];
  byStatus: { _id: string; count: number }[];
  total: number;
  resolved: number;
  open: number;
};

export type Hotspot = { _id: string; count: number; open: number };

/** Surfaces the backend's JSON `error` field instead of a bare "500". */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Attaches the stored session token, if any, without clobbering other headers. */
function withAuth(init?: RequestInit): RequestInit {
  const token = localStorage.getItem('civiclens_token');
  if (!token) return init ?? {};
  return {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, withAuth(init));
  } catch {
    throw new ApiError(
      'Cannot reach the API. Is the backend running on port 5000?',
      0,
    );
  }

  const isJson = res.headers
    .get('content-type')
    ?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(
      body?.error || body?.message || `Request failed (${res.status})`,
      res.status,
    );
  }
  return body as T;
}

/* ---------------- complaints ---------------- */

export type ComplaintFilters = {
  category?: string;
  severity?: string;
  status?: string;
  area?: string;
  source?: string;
};

export function listComplaints(filters: ComplaintFilters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  );
  const qs = params.toString();
  return request<{ complaints: Complaint[]; total: number }>(
    `/api/complaints${qs ? `?${qs}` : ''}`,
  );
}

export function getComplaint(id: string) {
  return request<{ complaint: Complaint }>(`/api/complaints/${id}`);
}

export function submitComplaint(input: {
  rawText: string;
  area: string;
  city?: string;
  image?: File | null;
}) {
  const form = new FormData();
  form.append('rawText', input.rawText);
  form.append('area', input.area);
  if (input.city) form.append('city', input.city);
  // never set Content-Type by hand — the browser adds the multipart boundary
  if (input.image) form.append('image', input.image);

  return request<{ success: boolean; complaint: Complaint }>(
    '/api/complaints',
    { method: 'POST', body: form },
  );
}

export function updateStatus(id: string, status: Status, note = '') {
  return request<{ complaint: Complaint }>(`/api/complaints/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
}

/** SSE stream of complaint inserts/updates. Returns a cleanup function. */
export function subscribeToComplaints(onChange: () => void) {
  const es = new EventSource(`${BASE}/api/complaints/stream/live`);
  es.onmessage = () => onChange();
  es.onerror = () => es.close();
  return () => es.close();
}

/* ---------------- social ---------------- */

export function getSocialFeed(filters: { area?: string; platform?: string } = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  );
  const qs = params.toString();
  return request<{ posts: SocialPost[]; total: number; page: number }>(
    `/api/social/feed${qs ? `?${qs}` : ''}`,
  );
}

export function triggerScrape() {
  return request<{ success: boolean; message: string; civicPostsTotal: number }>(
    '/api/social/scrape',
    { method: 'POST' },
  );
}

export function convertPost(postId: string) {
  return request<{ success: boolean; complaint: Complaint }>(
    `/api/social/${postId}/convert`,
    { method: 'POST' },
  );
}

/* ---------------- analytics ---------------- */

export function getAnalytics() {
  return request<Analytics>('/api/analytics');
}

export function getHotspots() {
  return request<{ hotspots: Hotspot[] }>('/api/analytics/area');
}
