import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import NavShell from '@/components/layout/NavShell';
import { useApplyTheme } from '@/hooks/useApplyTheme'

// ── Protected route wrapper ────────────────────────────────────────────────
function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// ── Public route wrapper (redirect if already logged in) ──────────────────
function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// ── Placeholder pages (replace as you build each module) ──────────────────
function DashboardPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[var(--color-primary-700)] font-semibold text-lg">
        Dashboard — coming Week 1
      </p>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { theme } = useUIStore();
 useApplyTheme(); 
  // Theme switching — your existing logic preserved exactly
  useEffect(() => {
    document.documentElement.classList.remove('theme-blue', 'theme-red');
    if (theme !== 'default') {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (unauthenticated only) ── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* ── Protected routes (authenticated only) ── */}
        <Route element={<PrivateRoute />}>
          <Route element={<NavShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add module routes here as you build each week:   */}
            {/* <Route path="/jobs"       element={<JobsPage />} />        */}
            {/* <Route path="/quotations" element={<QuotationsPage />} />  */}
            {/* <Route path="/accounts"   element={<AccountsPage />} />    */}
            {/* <Route path="/settings"   element={<SettingsPage />} />    */}
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}