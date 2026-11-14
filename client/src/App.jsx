import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ChatWidget from './components/shared/ChatWidget';
import ScrollToTop from './components/shared/ScrollToTop';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DuctedSystemsPage = lazy(() => import('./pages/DuctedSystemsPage'));
const InstallationPage = lazy(() => import('./pages/InstallationPage'));
const RepairMaintenancePage = lazy(() => import('./pages/RepairMaintenancePage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const LeadsManager = lazy(() => import('./pages/admin/LeadsManager'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const OffersManager = lazy(() => import('./pages/admin/OffersManager'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <img src="/logo-icon.png" alt="AirXSolar" className="w-12 h-12 object-contain animate-bounce" />
      <p className="text-navy/60 font-medium text-sm">Loading AirXSolar...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public pages with layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Navigate to="/#products" replace />} />
            <Route path="/products/:id" element={<Navigate to="/#products" replace />} />
            <Route path="/installation" element={<InstallationPage />} />
            <Route path="/repair-maintenance" element={<RepairMaintenancePage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Route>

          {/* Ducted systems - landing page (minimal nav) */}
          <Route path="/ducted-systems" element={<DuctedSystemsPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<LeadsManager />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="offers" element={<OffersManager />} />
            <Route path="blog" element={<BlogManager />} />
            <Route path="users" element={<UsersManager />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Global chat widget - visible on public pages */}
      <ChatWidget />
    </>
  );
}
