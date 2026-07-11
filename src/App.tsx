import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import ProtectedRoute from './components/routing/ProtectedRoute'
import LoginPage from './features/auth/pages/LoginPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import Forbidden from './pages/errors/Forbidden'
import NotFound from './pages/errors/NotFound'
import { DashboardPage } from './features/auth/dashboard/pages/DashboardPage'

import AuditLogPage from './pages/audit/AuditLogPage'



function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-lg font-semibold text-[var(--color-neutral-700)]">{title}</p>
      <p className="text-sm text-[var(--color-neutral-400)]">Coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([
 { path: '/', element: <Navigate to="/login" replace /> },

  // ── Auth routes ────────────────────────────────────────────────────────
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password',  element: <ResetPasswordPage /> },
  { path: '/403',             element: <Forbidden /> },
{ path: '/dashboard', element: <DashboardPage /> },

  // ── Protected app routes ───────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell title="KingFisher Tech Gold" />,
        children: [

          // Dashboard
          // { path: '/dashboard', element: <DashboardLayout /> },

          // Customers
          { path: '/customers',     element: <Placeholder title="Customers" /> },
          { path: '/customers/:id', element: <Placeholder title="Customer Profile" /> },

          // Quotations
          { path: '/quotations',     element: <Placeholder title="Quotations" /> },
          { path: '/quotations/new', element: <Placeholder title="New Quotation" /> },
          { path: '/quotations/:id', element: <Placeholder title="Quotation Detail" /> },

          // Jobs
          { path: '/jobs/air-export',        element: <Placeholder title="Air Export Jobs" /> },
          { path: '/jobs/air-export/new',    element: <Placeholder title="New Air Export Job" /> },
          { path: '/jobs/air-export/:id',    element: <Placeholder title="Air Export Job Detail" /> },
          { path: '/jobs/sea-export',        element: <Placeholder title="Sea Export Jobs" /> },
          { path: '/jobs/sea-export/new',    element: <Placeholder title="New Sea Export Job" /> },
          { path: '/jobs/sea-export/:id',    element: <Placeholder title="Sea Export Job Detail" /> },
          { path: '/jobs/sea-import',        element: <Placeholder title="Sea Import Jobs" /> },
          { path: '/jobs/sea-import/new',    element: <Placeholder title="New Sea Import Job" /> },
          { path: '/jobs/sea-import/:id',    element: <Placeholder title="Sea Import Job Detail" /> },

          // Documentation
          { path: '/documentation', element: <Placeholder title="Documentation" /> },

          // Finance (permission-gated)
          {
            element: <ProtectedRoute requirePermissions={['menu_finance']} />,
            children: [
              { path: '/finance',          element: <Placeholder title="Finance Dashboard" /> },
              { path: '/finance/invoices', element: <Placeholder title="Invoices" /> },
              { path: '/invoices',         element: <Placeholder title="Invoices" /> },
              { path: '/invoices/:id',     element: <Placeholder title="Invoice Detail" /> },
            ],
          },

          // NVOCC
          { path: '/nvocc',     element: <Placeholder title="NVOCC" /> },
          { path: '/nvocc/:id', element: <Placeholder title="NVOCC Detail" /> },

          // HR
          { path: '/hr',               element: <Placeholder title="HR & Payroll" /> },
          { path: '/hr/employees',     element: <Placeholder title="Employees" /> },
          { path: '/hr/employees/:id', element: <Placeholder title="Employee Profile" /> },
          { path: '/hr/leave',         element: <Placeholder title="Leave Calendar" /> },

          // Admin-only routes
          {
            element: <ProtectedRoute requireRole="admin" />,
            children: [
              { path: '/masters',          element: <Placeholder title="Masters" /> },
              { path: '/masters/airlines', element: <Placeholder title="Airlines" /> },
              { path: '/audit-log',        element: <AuditLogPage /> },
            ],
          },

          // Reports
          { path: '/reports', element: <Placeholder title="Reports" /> },

          // Settings
          { path: '/settings',       element: <Placeholder title="Settings" /> },
         

          // Profile & notifications
          { path: '/profile',       element: <Placeholder title="My Profile" /> },
          { path: '/notifications', element: <Placeholder title="Notifications" /> },

          // WMS
          { path: '/sales', element: <Placeholder title="Sales" /> },
        ],
      },
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────────
  { path: '*', element: <NotFound /> },
])