import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import LoginPage from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/auth/dashboard/pages/DashboardPage';
import { MasterListPage } from '../components/layout/MasterListPage';
import QuotationList from '../pages/quotations/QuotationList';
import QuotationDetail from '../pages/quotations/QuotationDetail';
import CreateQuotationForm from '../pages/quotations/CreateQuotationForm';
import JobList from '../pages/jobs/JobList';
import AirExportJobDetail from '../pages/jobs/AirExportJobDetail';
import SeaFCLJobDetail from '../pages/jobs/SeaFCLJobDetail';
import CreateJobForm from '../pages/jobs/CreateJobForm';
import CustomerList from '../pages/customers/CustomerList';
import CustomerProfile from '../pages/customers/CustomerProfile';
import DocumentLibrary from '../pages/documents/DocumentLibrary';
import InvoiceList from '../pages/invoices/InvoiceList';
import InvoiceDetail from '../pages/invoices/InvoiceDetail';
import FinancialDashboard from '../pages/finance/FinancialDashboard';
import WMSDashboard from '../pages/wms/WMSDashboard';
import EmployeeList from '../pages/hr/EmployeeList';
import EmployeeProfile from '../pages/hr/EmployeeProfile';
import LeaveCalendar from '../pages/hr/LeaveCalendar';
import ManagementDashboard from '../pages/management/ManagementDashboard';
import SettingsCompany from '../pages/settings/SettingsCompany';
import SettingsUsers from '../pages/settings/SettingsUsers';
import ReportsList from '../pages/reports/ReportsList';
import NotificationsCenter from '../pages/notifications/NotificationsCenter';

// ── Marketing pages (public, no auth guard) ─────────────────────────────
import Home         from '../pages/marketing/Home';
import FeaturesPage from '../pages/marketing/FeaturesPage';
import PricingPage  from '../pages/marketing/PricingPage';
import ContactPage  from '../pages/marketing/ContactPage';
import ModulesPage  from '../pages/marketing/ModulesPage';
import Forbidden from '../pages/errors/Forbidden';
import NotFound  from '../pages/errors/NotFound';

export const router = createBrowserRouter([
  // ── Public marketing routes ───────────────────────────────────────────
  { path: '/',      element: <Home /> },
  { path: '/features',  element: <FeaturesPage /> },
  { path: '/pricing',   element: <PricingPage /> },
  { path: '/contact',   element: <ContactPage /> },
  { path: '/modules',   element: <ModulesPage /> },

  // ── Auth ───────────────────────────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },

  // ── Error pages — top-level, NOT nested under /dashboard ───────────────
  { path: '/403', element: <Forbidden /> },

  // ── Protected app routes (unchanged) ────────────────────────────────────
  {
    path: '/dashboard',
    element: <AppShell title='Fresa Gold' />,
    children: [
      { index: true,                        element: <DashboardPage /> },
      { path: 'quotations',                 element: <QuotationList /> },
      { path: 'quotations/new',             element: <CreateQuotationForm /> },
      { path: 'quotations/:id',             element: <QuotationDetail /> },
      { path: 'jobs',                       element: <JobList /> },
      { path: 'jobs/new',                   element: <CreateJobForm /> },
      { path: 'jobs/air-export/:id',        element: <AirExportJobDetail /> },
      { path: 'jobs/sea-fcl/:id',           element: <SeaFCLJobDetail /> },
      { path: 'customers',                  element: <CustomerList /> },
      { path: 'customers/:id',              element: <CustomerProfile /> },
      { path: 'documents',                  element: <DocumentLibrary /> },
      { path: 'invoices',                   element: <InvoiceList /> },
      { path: 'invoices/:id',               element: <InvoiceDetail /> },
      { path: 'finance',                    element: <FinancialDashboard /> },
      { path: 'wms',                        element: <WMSDashboard /> },
      { path: 'hr/employees',               element: <EmployeeList /> },
      { path: 'hr/employees/:id',           element: <EmployeeProfile /> },
      { path: 'hr/leave',                   element: <LeaveCalendar /> },
      { path: 'management',                 element: <ManagementDashboard /> },
      { path: 'settings',                   element: <SettingsCompany /> },
      { path: 'settings/users',             element: <SettingsUsers /> },
      { path: 'reports',                    element: <ReportsList /> },
      { path: 'notifications',              element: <NotificationsCenter /> },
      { path: 'masters/airlines',           element: <MasterListPage title='Airlines' columns={[{key:'code',label:'Code',mono:true},{key:'name',label:'Name'},{key:'country',label:'Country'},{key:'iata',label:'IATA',mono:true}]} rows={[{code:'EK',name:'Emirates',country:'UAE',iata:'EK'},{code:'QR',name:'Qatar Airways',country:'Qatar',iata:'QR'}]} /> },
    ],
  },

  // ── Catch-all 404 — must be LAST top-level route ────────────────────────
  { path: '*', element: <NotFound /> },
]);