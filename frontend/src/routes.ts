/**
 * Auth entry points.
 *
 * The sign-in and sign-up pages do not exist yet — these are the single place
 * to repoint once they do (swap for real routes, or a router <Link>).
 */
export const SIGNIN_HREF = '/login';
export const SIGNUP_HREF = '/signup';

/** Dashboard routes, for footer/landing links. */
export const CITIZEN_HREF = '/citizen';

/**
 * Admin panel. Not linked from any public surface by design — reachable only
 * by typing the URL, and gated by <RequireAdmin> plus server-side role checks.
 */
export const ADMIN_LOGIN_HREF = '/admin/login';
export const AUTHORITY_HREF = '/authority';
export const SOCIAL_HREF = '/social';
