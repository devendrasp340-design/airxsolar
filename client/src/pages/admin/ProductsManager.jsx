import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';

const EMPTY_PRODUCT = {
  brand: 'Daikin',
  model: '',
  product_name: '',
  type: 'Split Units',
  capacity_kw: '',
  price_aud: '',
  page_title_seo: '',
  image_path: '',
  image2_path: '',
  image3_path: '',
  image4_path: '',
  image5_path: '',
  is_active: true,
};

export default function ProductsManager() {
  const { hasRole } = useAuth();
  const canAccess = hasRole('owner', 'content');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) fetchProducts();
  }, [canAccess, fetchProducts]);

  if (!canAccess) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="font-heading font-bold text-navy">Access Restricted</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      brand: p.brand || '',
      model: p.model || '',
      product_name: p.product_name || '',
      type: p.type || 'Split Units',
      capacity_kw: p.capacity_kw ?? '',
      price_aud: p.price_aud ?? '',
      page_title_seo: p.page_title_seo || '',
      image_path: p.image_path || '',
      image2_path: p.image2_path || '',
      image3_path: p.image3_path || '',
      image4_path: p.image4_path || '',
      image5_path: p.image5_path || '',
      is_active: Boolean(p.is_active),
    });
    setError('');
    setModalOpen(true);
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    setUploadingSlot(field);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, [field]: data.file.url }));
      } else {
        const data = await res.json();
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      capacity_kw: form.capacity_kw !== '' ? Number(form.capacity_kw) : undefined,
      price_aud: Number(form.price_aud),
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || data.errors?.[0]?.msg || 'Save failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProducts();
  };

  const imageFields = [
    { key: 'image_path', label: 'Primary Image' },
    { key: 'image2_path', label: 'Image 2' },
    { key: 'image3_path', label: 'Image 3' },
    { key: 'image4_path', label: 'Image 4' },
    { key: 'image5_path', label: 'Image 5' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-navy">Products Manager</h1>
          <p className="text-sm text-navy/60">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber/90"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate text-xs font-bold uppercase text-navy/60">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">kW</th>
                <th className="px-4 py-3">Price (+ GST)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-navy/50">Loading...</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate/40">
                    <td className="px-4 py-3">
                      <img
                        src={p.image_path || '/images/placeholder-product.jpg'}
                        alt={p.product_name}
                        loading="lazy"
                        className="w-12 h-10 object-contain bg-slate rounded p-1"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{p.brand}</td>
                    <td className="px-4 py-3 text-navy max-w-[260px] truncate">{p.product_name}</td>
                    <td className="px-4 py-3 text-navy/70">{p.capacity_kw ? `${p.capacity_kw} kW` : '—'}</td>
                    <td className="px-4 py-3 font-bold text-navy">${p.price_aud} + GST</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-navy/70 hover:text-navy mr-1"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-xl text-navy">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-navy/60" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Brand *</label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Model *</label>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Product Name *</label>
                <input
                  required
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Type</label>
                  <input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.capacity_kw}
                    onChange={(e) => setForm({ ...form, capacity_kw: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Price AUD (ex GST) *</label>
                  <input
                    type="number"
                    required
                    value={form.price_aud}
                    onChange={(e) => setForm({ ...form, price_aud: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">SEO Page Title</label>
                <input
                  value={form.page_title_seo}
                  onChange={(e) => setForm({ ...form, page_title_seo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* Up to 5 Images */}
              <div className="space-y-2 pt-2 border-t border-slate">
                <p className="text-xs font-bold text-navy">Product Images (up to 5)</p>
                {imageFields.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={`${label} URL or upload...`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                    <label className="inline-flex items-center gap-1 px-3 py-2 bg-slate hover:bg-amber/20 rounded-lg text-xs font-semibold text-navy cursor-pointer">
                      {uploadingSlot === key ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Upload
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(key, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>Active (visible on website)</span>
              </label>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-navy/60 hover:bg-slate"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber text-navy font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-amber/90"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
