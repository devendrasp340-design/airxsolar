import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  FileText,
  UserCog,
  LogOut,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLeadNotification } from '../../hooks/useLeadNotification';

export default function AdminLayout() {
  const { user, loading, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const canViewLeads = hasRole('owner', 'sales');
  const { newLeadCount, hasNewLead, dismissNotification } = useLeadNotification(
    Boolean(user && canViewLeads),
    10000
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true, roles: ['owner', 'sales', 'content'] },
    { label: 'Leads', path: '/admin/leads', icon: Users, badge: newLeadCount, roles: ['owner', 'sales'] },
    { label: 'Products', path: '/admin/products', icon: Package, roles: ['owner', 'content'] },
    { label: 'Offers', path: '/admin/offers', icon: Tag, roles: ['owner', 'content'] },
    { label: 'Blog', path: '/admin/blog', icon: FileText, roles: ['owner', 'content'] },
    { label: 'Users', path: '/admin/users', icon: UserCog, roles: ['owner'] },
  ].filter((item) => item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.png" alt="AirXSolar" className="w-9 h-9 object-contain" />
              <div>
                <p className="font-heading font-bold text-base leading-tight">AirXSolar</p>
                <p className="text-xs text-amber uppercase font-semibold">{user.role} Portal</p>
              </div>
            </Link>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber text-navy'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-2 py-1">
            <p className="text-sm font-semibold truncate">{user.full_name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {hasNewLead && canViewLeads && (
          <div className="bg-amber text-navy px-4 py-3 flex items-center justify-between shadow-md animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>New Lead Received! Check the Leads tab now.</span>
            </div>
            <button
              onClick={dismissNotification}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
