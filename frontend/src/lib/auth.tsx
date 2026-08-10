import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type React from 'react';
import { ApiError } from './api';

const TOKEN_KEY = 'civiclens_token';

export type Role = 'citizen' | 'authority' | 'admin' | 'master-admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedArea?: string | null;
  assignedDept?: string | null;
};

/** Single source of truth for "may see the admin panel". */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'authority' || user?.role === 'master-admin';
}

/** True only for the master admin. */
export function isMasterAdmin(user: User | null): boolean {
  return user?.role === 'master-admin';
}

type AuthState = {
  user: User | null;
  /** True until the stored token has been checked against the server. */
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const BASE = import.meta.env.VITE_API_BASE ?? '';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'Cannot reach the server. Is the backend running on port 5000?',
      0,
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // resolve any stored token once on boot
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled) setUser(d.user);
      })
      .catch(() => {
        // expired or invalid — drop it rather than leaving a dead session
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authRequest<{ token: string; user: User }>(
      '/api/auth/login',
      { email, password },
    );
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const data = await authRequest<{ token: string; user: User }>(
      '/api/auth/admin/login',
      { email, password },
    );
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await authRequest<{ token: string; user: User }>(
        '/api/auth/register',
        { name, email, password },
      );
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, adminLogin, signup, logout }),
    [user, loading, login, adminLogin, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
