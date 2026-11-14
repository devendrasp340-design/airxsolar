import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';

const EMPTY_USER = {
  full_name: '',
  email: '',
  password: '',
  role: 'sales',
};

export default function UsersManager() {
  const { user: currentUser, hasRole } = useAuth();
  const isOwner = hasRole('owner');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) fetchUsers();
  }, [isOwner, fetchUsers]);

  if (!isOwner) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="font-heading font-bold text-navy">Owner Access Only</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_USER);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      full_name: u.full_name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'sales',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: form.role,
    };
    if (form.password) {
      payload.password = form.password;
    }

    try {
      const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || data.errors?.[0]?.msg || 'Failed to save user');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-navy">Users Manager</h1>
          <p className="text-sm text-navy/60">Manage Owner, Sales &amp; Content staff accounts</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber/90"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate text-xs font-bold uppercase text-navy/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-navy/50">Loading...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate/40">
                    <td className="px-4 py-3 font-semibold text-navy">{u.full_name}</td>
                    <td className="px-4 py-3 text-navy/70">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-navy/10 text-navy">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy/60">
                      {new Date(u.created_at).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-navy/70 hover:text-navy mr-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl text-navy">
                {editingId ? 'Edit User' : 'Add Staff User'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-navy/60" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Full Name *</label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Password {editingId ? '(leave blank to keep current)' : '* (min 8 chars)'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={editingId ? undefined : 8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="owner">Owner (Full Access)</option>
                  <option value="sales">Sales (Leads Only)</option>
                  <option value="content">Content (Products, Offers, Blog)</option>
                </select>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-navy/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber text-navy font-bold px-6 py-2.5 rounded-lg text-sm"
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
