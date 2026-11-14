import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Bold,
  Heading2,
  List,
  Image as ImageIcon,
  Youtube,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';

const EMPTY_BLOG = {
  title: '',
  slug: '',
  excerpt: '',
  featured_image: '',
  youtube_url: '',
  content: '',
  is_published: false,
};

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function BlogManager() {
  const { hasRole } = useAuth();
  const canAccess = hasRole('owner', 'content');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BLOG);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) fetchBlogs();
  }, [canAccess, fetchBlogs]);

  if (!canAccess) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="font-heading font-bold text-navy">Access Restricted</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_BLOG);
    setError('');
    setModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = '';
    }, 0);
  };

  const openEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      featured_image: post.featured_image || '',
      youtube_url: post.youtube_url || '',
      content: post.content || '',
      is_published: Boolean(post.is_published),
    });
    setError('');
    setModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = post.content || '';
    }, 0);
  };

  const execCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const insertImageInEditor = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      execCmd('insertImage', data.file.url);
    }
  };

  const insertYouTubeLink = () => {
    const url = window.prompt('Paste YouTube URL (will also embed at top of post if set in YouTube field):');
    if (!url) return;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match) {
      const iframeHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
      execCmd('insertHTML', iframeHtml);
    } else {
      setError('Invalid YouTube URL');
    }
  };

  const uploadFeatured = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((prev) => ({ ...prev, featured_image: data.file.url }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const htmlContent = editorRef.current?.innerHTML || form.content;
    if (!htmlContent.trim()) {
      setError('Post content is required');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      content: htmlContent,
    };

    try {
      const url = editingId ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchBlogs();
      } else {
        const data = await res.json();
        setError(data.error || data.errors?.[0]?.msg || 'Failed to save blog post');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    const res = await apiFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    if (res.ok) fetchBlogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-navy">Blog Manager</h1>
          <p className="text-sm text-navy/60">{blogs.length} total articles</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber/90"
        >
          <Plus className="w-4 h-4" /> Write Article
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate text-xs font-bold uppercase text-navy/60">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-navy/50">Loading...</td>
                </tr>
              ) : (
                blogs.map((post) => (
                  <tr key={post.id} className="hover:bg-slate/40">
                    <td className="px-4 py-3 font-semibold text-navy">{post.title}</td>
                    <td className="px-4 py-3 text-xs text-navy/60">/blog/{post.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          post.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber/20 text-navy'
                        }`}
                      >
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy/60">
                      {new Date(post.created_at).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(post)} className="p-1.5 text-navy/70 hover:text-navy mr-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 text-red-500 hover:text-red-700">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-xl text-navy">
                {editingId ? 'Edit Article' : 'New Article'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-navy/60" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug: editingId ? prev.slug : slugify(title),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">URL Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Excerpt</label>
                <input
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Featured Image</label>
                  <div className="flex gap-2">
                    <input
                      value={form.featured_image}
                      onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                      placeholder="/uploads/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                    <label className="inline-flex items-center gap-1 px-3 py-2 bg-slate rounded-lg text-xs font-semibold text-navy cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => uploadFeatured(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">YouTube Video URL</label>
                  <input
                    value={form.youtube_url}
                    onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Simple ContentEditable Rich Text Editor */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Content *</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-slate px-3 py-2 border-b border-gray-200 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => execCmd('bold')}
                      className="p-1.5 bg-white rounded hover:bg-amber/20 text-navy"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('formatBlock', 'h2')}
                      className="p-1.5 bg-white rounded hover:bg-amber/20 text-navy"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('insertUnorderedList')}
                      className="p-1.5 bg-white rounded hover:bg-amber/20 text-navy"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <label
                      className="p-1.5 bg-white rounded hover:bg-amber/20 text-navy cursor-pointer"
                      title="Insert Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => insertImageInEditor(e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={insertYouTubeLink}
                      className="p-1.5 bg-white rounded hover:bg-amber/20 text-navy"
                      title="Embed YouTube Video"
                    >
                      <Youtube className="w-4 h-4" />
                    </button>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[220px] p-4 text-sm text-navy focus:outline-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                <span>Publish immediately</span>
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
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
