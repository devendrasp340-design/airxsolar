import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Tag, FileText, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLeadNotification } from '../../hooks/useLeadNotification';

export default function AdminDashboard() {
  const { user, hasRole } = useAuth();
  const canViewLeads = hasRole('owner', 'sales');
  const canViewContent = hasRole('owner', 'content');

  const { leads, newLeadCount } = useLeadNotification(canViewLeads, 10000);
  const [stats, setStats] = useState({
    products: 0,
    offers: 0,
    blogs: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [prodRes, offerRes, blogRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/offers'),
          fetch('/api/blogs'),
        ]);
        const prodData = prodRes.ok ? await prodRes.json() : { total: 0 };
        const offerData = offerRes.ok ? await offerRes.json() : { total: 0 };
        const blogData = blogRes.ok ? await blogRes.json() : { total: 0 };

        setStats({
          products: prodData.total ?? (prodData.products?.length || 0),
          offers: offerData.total ?? (offerData.offers?.length || 0),
          blogs: blogData.total ?? (blogData.blogs?.length || 0),
        });
      } catch {
        // ignore
      }
    };
    loadStats();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const newLeadsToday = leads.filter(
    (l) => (l.created_at || '').slice(0, 10) === todayStr
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-3xl text-navy">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-navy/60 text-sm mt-1">
            AirXSolar Perth Operations Overview
          </p>
        </div>

        {canViewLeads && newLeadCount > 0 && (
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm hover:bg-amber/90"
          >
            <Bell className="w-4 h-4" />
            {newLeadCount} Unactioned New {newLeadCount === 1 ? 'Lead' : 'Leads'}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {canViewLeads && (
          <Link
            to="/admin/leads"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-navy/50">New Leads Today</span>
              <Users className="w-5 h-5 text-amber" />
            </div>
            <p className="font-heading font-extrabold text-3xl text-navy">{newLeadsToday}</p>
            <p className="text-xs text-navy/60 mt-1">{newLeadCount} pending in New status</p>
          </Link>
        )}

        {canViewContent && (
          <>
            <Link
              to="/admin/products"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-navy"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-navy/50">Total Products</span>
                <Package className="w-5 h-5 text-navy" />
              </div>
              <p className="font-heading font-extrabold text-3xl text-navy">{stats.products}</p>
              <p className="text-xs text-navy/60 mt-1">Active catalog units</p>
            </Link>

            <Link
              to="/admin/offers"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-navy/50">Active Offers</span>
                <Tag className="w-5 h-5 text-amber" />
              </div>
              <p className="font-heading font-extrabold text-3xl text-navy">{stats.offers}</p>
              <p className="text-xs text-navy/60 mt-1">Live promotions</p>
            </Link>

            <Link
              to="/admin/blog"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-navy"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-navy/50">Published Blogs</span>
                <FileText className="w-5 h-5 text-navy" />
              </div>
              <p className="font-heading font-extrabold text-3xl text-navy">{stats.blogs}</p>
              <p className="text-xs text-navy/60 mt-1">SEO articles live</p>
            </Link>
          </>
        )}
      </div>

      {/* Recent Leads Preview (owner & sales) */}
      {canViewLeads && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-navy">Recent Quote Enquiries</h2>
            <Link
              to="/admin/leads"
              className="text-sm font-bold text-amber hover:underline inline-flex items-center gap-1"
            >
              Manage All Leads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-navy/50 py-4">No leads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-navy/50 uppercase border-b border-slate">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Product / Service</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate">
                  {leads.slice(0, 5).map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-3 pr-4 font-semibold text-navy">{lead.full_name}</td>
                      <td className="py-3 pr-4">
                        <a href={`tel:${lead.phone}`} className="text-amber font-semibold hover:underline">
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-navy/70">{lead.product_or_service || '—'}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate text-navy">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
