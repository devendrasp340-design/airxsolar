import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';

const EMPTY_OFFER = {
  title: '',
  description: '',
  price_display: '',
  image_url: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
};

export default function OffersManager() {
  const { hasRole } = useAuth();
  const canAccess = hasRole('owner', 'content');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_OFFER);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/offers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) fetchOffers();
  }, [canAccess, fetchOffers]);

  if (!canAccess) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="font-heading font-bold text-navy">Access Restricted</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_OFFER);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      price_display: offer.price_display || '',
      image_url: offer.image_url || '',
      is_active: Boolean(offer.is_active),
      starts_at: offer.starts_at ? offer.starts_at.slice(0, 10) : '',
      ends_at: offer.ends_at ? offer.ends_at.slice(0, 10) : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, image_url: data.file.url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || undefined,
      price_display: form.price_display || undefined,
      image_url: form.image_url || undefined,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : undefined,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : undefined,
    };

    try {
      const url = editingId ? `/api/admin/offers/${editingId}` : '/api/admin/offers';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchOffers();
      } else {
        const data = await res.json();
        setError(data.error || data.errors?.[0]?.msg || 'Failed to save offer');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    const res = await apiFetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
    if (res.ok) fetchOffers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-navy">Offers Manager</h1>
          <p className="text-sm text-navy/60">Remember: always display prices as "$X + GST"</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber/90"
        >
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-navy/50 text-sm">Loading...</p>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      offer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(offer)} className="p-1 text-navy/60 hover:text-navy">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(offer.id)} className="p-1 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-heading font-bold text-lg text-navy">{offer.title}</h3>
                {offer.price_display && (
                  <p className="font-heading font-extrabold text-amber text-xl mt-1">
                    {offer.price_display}
                  </p>
                )}
                {offer.description && (
                  <p className="text-xs text-navy/70 mt-2 line-clamp-3">{offer.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl text-navy">
                {editingId ? 'Edit Offer' : 'Create Offer'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-navy/60" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Offer Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Daikin 10.0 kW + AirTouch 5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Price Display (+ GST)</label>
                <input
                  value={form.price_display}
                  onChange={(e) => setForm({ ...form, price_display: e.target.value })}
                  placeholder="e.g. $9,500 + GST Fully Installed"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Banner Image</label>
                <div className="flex gap-2">
                  <input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="/uploads/..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-2 bg-slate rounded-lg text-xs font-semibold text-navy cursor-pointer">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Starts At</label>
                  <input
                    type="date"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Ends At</label>
                  <input
                    type="date"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>Active Offer</span>
              </label>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="flex justify-end gap-3">
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
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
