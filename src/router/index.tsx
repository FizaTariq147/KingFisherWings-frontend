import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import Forbidden from '../pages/errors/Forbidden'
import NotFound from '../pages/errors/NotFound'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import Home         from '../pages/marketing/Home'
import FeaturesPage from '../pages/marketing/FeaturesPage'
import PricingPage  from '../pages/marketing/PricingPage'
import ContactPage  from '../pages/marketing/ContactPage'
import ModulesPage  from '../pages/marketing/ModulesPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-base font-semibold text-[var(--color-neutral-700)]">{title}</p>
      <p className="text-sm text-[var(--color-neutral-400)]">Coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/',      element: <Home /> },
  { path: '/features',  element: <FeaturesPage /> },
  { path: '/pricing',   element: <PricingPage /> },
  { path: '/contact',   element: <ContactPage /> },
  { path: '/modules',   element: <ModulesPage /> },
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password',  element: <ResetPasswordPage /> },
  { path: '/403',             element: <Forbidden /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell title="Fresa Gold" />,
        children: [
          { path: '/dashboard',         element: <DashboardLayout /> },
          { path: '/customers',         element: <Placeholder title="Customers" /> },
          { path: '/customers/:id',     element: <Placeholder title="Customer Profile" /> },
          { path: '/quotations',        element: <Placeholder title="Quotations" /> },
          { path: '/quotations/new',    element: <Placeholder title="New Quotation" /> },
          { path: '/quotations/:id',    element: <Placeholder title="Quotation Detail" /> },
          { path: '/jobs/air-export',      element: <Placeholder title="Air Export Jobs" /> },
          { path: '/jobs/air-export/new',  element: <Placeholder title="New Air Export" /> },
          { path: '/jobs/air-export/:id',  element: <Placeholder title="Air Export Detail" /> },
          { path: '/jobs/sea-export',      element: <Placeholder title="Sea Export Jobs" /> },
          { path: '/jobs/sea-export/new',  element: <Placeholder title="New Sea Export" /> },
          { path: '/jobs/sea-export/:id',  element: <Placeholder title="Sea Export Detail" /> },
          { path: '/jobs/sea-import',      element: <Placeholder title="Sea Import Jobs" /> },
          { path: '/jobs/sea-import/new',  element: <Placeholder title="New Sea Import" /> },
          { path: '/jobs/sea-import/:id',  element: <Placeholder title="Sea Import Detail" /> },
          { path: '/documentation',     element: <Placeholder title="Documentation" /> },
          { path: '/nvocc',             element: <Placeholder title="NVOCC" /> },
          { path: '/nvocc/:id',         element: <Placeholder title="NVOCC Detail" /> },
          { path: '/hr',                element: <Placeholder title="HR & Payroll" /> },
          { path: '/hr/employees',      element: <Placeholder title="Employees" /> },
          { path: '/hr/employees/:id',  element: <Placeholder title="Employee Profile" /> },
          { path: '/hr/leave',          element: <Placeholder title="Leave Calendar" /> },
          { path: '/reports',           element: <Placeholder title="Reports" /> },
          { path: '/settings',          element: <Placeholder title="Settings" /> },
          { path: '/settings/users',    element: <Placeholder title="Users" /> },
          { path: '/profile',           element: <Placeholder title="My Profile" /> },
          { path: '/notifications',     element: <Placeholder title="Notifications" /> },
          { path: '/wms',               element: <Placeholder title="Warehouse" /> },
          {
            element: <ProtectedRoute requirePermissions={['menu_finance']} />,
            children: [
              { path: '/finance',      element: <Placeholder title="Finance Dashboard" /> },
              { path: '/invoices',     element: <Placeholder title="Invoices" /> },
              { path: '/invoices/:id', element: <Placeholder title="Invoice Detail" /> },
            ],
          },
          {
            element: <ProtectedRoute requireRole="admin" />,
            children: [
              { path: '/masters',          element: <Placeholder title="Masters" /> },
              { path: '/masters/airlines', element: <Placeholder title="Airlines" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])