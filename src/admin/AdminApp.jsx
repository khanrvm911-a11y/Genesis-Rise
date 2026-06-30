import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';

const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const AdminUsers = lazy(() => import('./pages/Users'));
const AdminNotifications = lazy(() => import('./pages/Notifications'));
const AdminPremium = lazy(() => import('./pages/Premium'));
const AdminAnalytics = lazy(() => import('./pages/Analytics'));
const AdminContent = lazy(() => import('./pages/Content'));
const AdminReports = lazy(() => import('./pages/Reports'));
const AdminSettings = lazy(() => import('./pages/Settings'));
const AdminSecurity = lazy(() => import('./pages/Security'));

function AdminLoader() {
  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading admin panel...</p>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<AdminLoader />}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="premium" element={<AdminPremium />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}
