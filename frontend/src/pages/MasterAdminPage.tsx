import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, ShieldCheck, User as UserIcon, Mail, Lock, MapPin, Building2 } from 'lucide-react';
import {
  ApiError,
  AREAS,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
  type CreateAdminInput,
} from '../lib/api';
import {
  BTN_GHOST,
  BTN_PRIMARY,
  DashboardShell,
  EmptyState,
  ErrorNote,
  FIELD,
  LABEL,
  Panel,
  Spinner,
} from '../components/dashboard/Shell';

const ROLES = ['admin', 'authority'] as const;
type RoleOption = typeof ROLES[number];

const ROLE_LABELS: Record<RoleOption, string> = {
  admin: 'Admin (full dashboard)',
  authority: 'Authority (legacy dashboard)',
};

const DEPARTMENTS = ['Roads', 'Water', 'Sanitation', 'Electricity', 'General'];

/* ------------ blank form state ------------ */
type FormState = {
  name: string;
  email: string;
  password: string;
  role: RoleOption;
  assignedArea: string;
  assignedDept: string;
};

const BLANK: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'admin',
  assignedArea: '',
  assignedDept: '',
};

/* ============================================================
   Page
   ============================================================ */
export default function MasterAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // delete confirmation
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { users } = await listAdminUsers();
      setUsers(users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load admin accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- open modals ---------- */
  function openCreate() {
    setForm(BLANK);
    setFormError(null);
    setModal('create');
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: (u.role === 'master-admin' ? 'admin' : u.role) as RoleOption,
      assignedArea: u.assignedArea ?? '',
      assignedDept: u.assignedDept ?? '',
    });
    setFormError(null);
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
  }

  /* ---------- save ---------- */
  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (modal === 'create') {
        const payload: CreateAdminInput = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          assignedArea: form.assignedArea || undefined,
          assignedDept: form.assignedDept || undefined,
        };
        await createAdminUser(payload);
      } else if (modal === 'edit' && editing) {
        const payload: Partial<CreateAdminInput> = {
          name: form.name.trim(),
          role: form.role,
          assignedArea: form.assignedArea || undefined,
          assignedDept: form.assignedDept || undefined,
        };
        if (form.password) payload.password = form.password;
        await updateAdminUser(editing.id, payload);
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  /* ---------- delete ---------- */
  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAdminUser(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  }

  /* ---------- render ---------- */
  return (
    <DashboardShell
      eyebrow="Master Admin"
      title={
        <>
          Manage <span className="text-gradient-accent">admin accounts</span>
        </>
      }
      intro="Create, configure, and remove admin and authority accounts. Assign each account to an area and department to scope their access."
      actions={
        <button type="button" onClick={openCreate} className={BTN_PRIMARY}>
          <Plus size={14} /> New admin
        </button>
      }
    >
      {error && (
        <div className="mb-6">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading admin accounts…" />
      ) : users.length === 0 ? (
        <EmptyState>No admin accounts yet. Create one above.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onEdit={() => openEdit(u)}
              onDelete={() => {
                setDeleteError(null);
                setDeleting(u);
              }}
            />
          ))}
        </div>
      )}

      {/* ====== Create / Edit Modal ====== */}
      <AnimatePresence>
        {modal && (
          <ModalBackdrop onClose={closeModal}>
            <ModalCard>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter text-white">
                  {modal === 'create' ? 'New admin account' : 'Edit account'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-colors hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className={LABEL}>Full name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    className={`${FIELD} pl-10`}
                    placeholder="Display name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>

              {/* Email — only on create */}
              {modal === 'create' && (
                <div className="mb-4">
                  <label className={LABEL}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="email"
                      className={`${FIELD} pl-10`}
                      placeholder="admin@example.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="mb-4">
                <label className={LABEL}>
                  Password
                  {modal === 'edit' && (
                    <span className="ml-2 normal-case text-gray-600">(leave blank to keep current)</span>
                  )}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password"
                    className={`${FIELD} pl-10`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>

              {/* Role */}
              <div className="mb-4">
                <label className={LABEL}>Role</label>
                <div className="flex gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r }))}
                      className={`flex-1 rounded-xl border px-4 py-3 text-left text-xs transition-colors ${
                        form.role === r
                          ? 'border-orange-400/40 bg-orange-500/15 text-orange-200'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold capitalize">{r}</span>
                      <span className="block font-light text-[10px] mt-0.5 opacity-70">{ROLE_LABELS[r]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Area */}
              <div className="mb-4">
                <label className={LABEL}>
                  <MapPin size={11} className="mr-1 inline-block" />
                  Assigned area
                </label>
                <select
                  className={`${FIELD} py-2.5 text-xs`}
                  value={form.assignedArea}
                  onChange={(e) => setForm((f) => ({ ...f, assignedArea: e.target.value }))}
                >
                  <option value="" className="bg-ink">All areas (no restriction)</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a} className="bg-ink">{a}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Department */}
              <div className="mb-6">
                <label className={LABEL}>
                  <Building2 size={11} className="mr-1 inline-block" />
                  Assigned department
                </label>
                <select
                  className={`${FIELD} py-2.5 text-xs`}
                  value={form.assignedDept}
                  onChange={(e) => setForm((f) => ({ ...f, assignedDept: e.target.value }))}
                >
                  <option value="" className="bg-ink">All departments (no restriction)</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="bg-ink">{d}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="mb-4">
                  <ErrorNote>{formError}</ErrorNote>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className={`${BTN_GHOST} flex-1`}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`${BTN_PRIMARY} flex-1`}
                >
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      Saving…
                    </>
                  ) : modal === 'create' ? (
                    'Create account'
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </ModalCard>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* ====== Delete Confirmation ====== */}
      <AnimatePresence>
        {deleting && (
          <ModalBackdrop onClose={() => setDeleting(null)}>
            <ModalCard className="max-w-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
                  <Trash2 size={16} className="text-red-400" />
                </span>
                <div>
                  <h2 className="font-black tracking-tight text-white">Delete account</h2>
                  <p className="text-xs font-light text-gray-400">This cannot be undone.</p>
                </div>
              </div>

              <p className="mb-6 text-sm font-light text-gray-300">
                Remove <span className="font-semibold text-white">{deleting.name}</span>{' '}
                ({deleting.email}) from the system?
              </p>

              {deleteError && (
                <div className="mb-4">
                  <ErrorNote>{deleteError}</ErrorNote>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleting(null)} className={`${BTN_GHOST} flex-1`}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleteLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Deleting…
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </ModalCard>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: AdminUser;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isMaster = user.role === 'master-admin';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Panel className="flex flex-col gap-4 p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[11px] font-light text-gray-500">{user.email}</p>
            </div>
          </div>
          {!isMaster && (
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={onEdit}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-colors hover:border-white/25 hover:text-white"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-400/20 text-red-400/60 transition-colors hover:border-red-400/50 hover:text-red-300"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* role badge */}
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={user.role} />
          {isMaster && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <ShieldCheck size={10} /> You
            </span>
          )}
        </div>

        {/* assignments */}
        <div className="flex flex-wrap gap-3 border-t border-white/5 pt-4 text-[11px] font-light text-gray-500">
          <span>
            <span className="font-bold text-gray-400">Area: </span>
            {user.assignedArea || 'All'}
          </span>
          <span>
            <span className="font-bold text-gray-400">Dept: </span>
            {user.assignedDept || 'All'}
          </span>
        </div>
      </Panel>
    </motion.div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    'master-admin': 'border-purple-400/25 bg-purple-500/10 text-purple-300',
    admin: 'border-orange-400/25 bg-orange-500/10 text-orange-300',
    authority: 'border-blue-400/25 bg-blue-500/10 text-blue-300',
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${styles[role] ?? 'border-white/10 bg-white/5 text-gray-400'}`}
    >
      {role}
    </span>
  );
}

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </motion.div>
  );
}

function ModalCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25 }}
      className={`w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
