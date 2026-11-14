import React, { useState } from 'react';
import { Phone, Download, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLeadNotification } from '../../hooks/useLeadNotification';
import { apiFetch } from '../../utils/api';

const STATUS_OPTIONS = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'];

const STATUS_BADGES = {
  New: 'bg-amber/20 text-amber-800 border-amber/40',
  Contacted: 'bg-blue-100 text-blue-800 border-blue-200',
  Quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  Won: 'bg-green-100 text-green-800 border-green-200',
  Lost: 'bg-red-100 text-red-800 border-red-200',
};

export default function LeadsManager() {
  const { hasRole } = useAuth();
  const isOwner = hasRole('owner');
  const canAccess = hasRole('owner', 'sales');
  const { leads, refetch } = useLeadNotification(canAccess, 10000);
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  if (!canAccess) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="font-heading font-bold text-navy">Access Restricted</p>
        <p className="text-sm text-navy/60 mt-1">Your role does not have permission to view leads.</p>
      </div>
    );
  }

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await apiFetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await refetch();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/admin/leads/export';
  };

  const filteredLeads =
    filterStatus === 'All' ? leads : leads.filter((l) => l.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-navy">Leads Manager</h1>
          <p className="text-sm text-navy/60">
            Real-time polling active (every 10s) · {filteredLeads.length} leads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-navy"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-navy hover:bg-slate"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>

          {isOwner && (
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-navy/90"
            >
              <Download className="w-4 h-4 text-amber" /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate text-xs font-bold uppercase text-navy/60">
              <tr>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Suburb</th>
                <th className="px-4 py-3.5">Product / Service</th>
                <th className="px-4 py-3.5">Source</th>
                <th className="px-4 py-3.5">Floor Plan</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-navy/50">
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate/40">
                    <td className="px-4 py-3.5 text-xs text-navy/60 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString('en-AU', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-navy">{lead.full_name}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 font-bold text-navy hover:text-amber"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-navy/70">{lead.suburb || '—'}</td>
                    <td className="px-4 py-3.5 text-navy/80 max-w-[200px] truncate">
                      {lead.product_or_service || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-navy/60">{lead.source_page || '—'}</td>
                    <td className="px-4 py-3.5">
                      {lead.floor_plan_url ? (
                        lead.floor_plan_url.startsWith('/') ? (
                          <a
                            href={lead.floor_plan_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-navy/60">{lead.floor_plan_url}</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                          STATUS_BADGES[lead.status] || 'bg-slate text-navy'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white text-navy">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
