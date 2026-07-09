import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import Forbidden from '../pages/errors/Forbidden'
import NotFound from '../pages/errors/NotFound'
import { DashboardPage } from '../features/auth/dashboard/pages/DashboardPage'
import Home from '../pages/marketing/Home'
import FeaturesPage from '../pages/marketing/FeaturesPage'
import PricingPage from '../pages/marketing/PricingPage'
import ContactPage from '../pages/marketing/ContactPage'
import ModulesPage from '../pages/marketing/ModulesPage'
import CustomerServiceMenuPage from '../pages/customers/CustomerServiceMenuPage'
import AllShipmentsPage from '../pages/customers/AllShipments'
import EnquirySheetPage from '../pages/customers/EnquirySheetPage'
import PricingDashboardPage from '../pages/customers/PricingDashboardPage'
import SailingSchedulePage from '../pages/customers/SailingSchedulePage'
import AgentEdiPage from '../pages/customers/AgentEdiPage'
import CostingSearchPage from '../pages/customers/CostingSearchPage'
import ShipmentTrackingPage from '../pages/customers/ShipmentTrackingPage'
import  QuotationsMenuPage  from '../pages/quotations/QuotationsMenuPage'
import AllQuotationsPage from '../pages/quotations/AllQuotationsPage'
import OnlineTariffMasterPage from '../pages/quotations/OnlineTariffMasterPage'
import ZipDistanceMasterPage from '../pages/quotations/ZipDistanceMasterPage'
import SalesMenuPage from '../pages/sales/SalesMenuPage'
import CallSheetPage from '../pages/sales/CallSheetPage'
import ClientRequestListPage from '../pages/sales/ClientRequestListPage'
import SalesLeadPage from '../pages/sales/SalesLeadPage'
import RateChargesPage from '../pages/sales/RateChargesPage'
import SalesBudgetPage from '../pages/sales/SalesBudgetPage'
import SalesDashboardPage from '../pages/sales/SalesDashboardPage'
import ShipmentsListSalesPage from '../pages/sales/ShipmentsListSalesPage'
import VisitingCardListPage from '../pages/sales/VisitingCardListPage'
import HrMenuPage from '../pages/hr/HrMenuPage'
import EmployeesListPage from '../pages/hr/EmployeesListPage'
import LeaveRequestPage from '../pages/hr/LeaveRequestPage'
import PayRollPage from '../pages/hr/PayRollPage'
import SalaryLedgerPage from '../pages/hr/SalaryLedgerPage'
import NvoccMenuPage from '../pages/nvocc/NvoccMenuPage'
import AllJobsPage from '../pages/nvocc/AllJobsPage'
import BookingListPage from '../pages/nvocc/BookingListPage'
import EnquiryListPage from '../pages/nvocc/EnquiryListPage'
import LoadListPage from '../pages/nvocc/LoadListPage'
import VesselVoyageMasterPage from '../pages/nvocc/VesselVoyageMasterPage'
import ManagementMenuPage from '../pages/management/ManagementMenuPage'
import AllJobMisPage from '../pages/management/AllJobsMisPage'
import ComplaintsPage from '../pages/management/ComplaintsPage'
import DataBackupExportPage from '../pages/management/DataBackupExportPage'
import ManagementDashboardPage from '../pages/management/ManagementDashboardPage'
import ManagementDashboardReportsPage from '../pages/management/ManagementDashboardReportsPage'
import UserAccessPage from '../pages/management/UserAccessPage'
import UserWisePerformancePage from '../pages/management/UserWisePerformancePage'
import DocumentationMenuPage from '../pages/documentation/DocumentationMenuPage'
import AllJobsPageDocumentation from '../pages/documentation/AllJobsPage'
import BoeDashboardPage from '../pages/documentation/BoeDashboardPage'
import BayanEdiJobListPage from '../pages/documentation/BayanEdiJobListPage'
import BayanEdiShipmentHouseListPage from '../pages/documentation/BayanEdiShipmentHouseListPage'
import BulkCostEntryPage from '../pages/documentation/BulkCostEntryPage'
import CcnFwbFhlEdiJobListPage from '../pages/documentation/CcnFwbFhlEdiJobListPage'
import CgmEdiVesselListPage from '../pages/documentation/CgmEdiVesselListPage'
import AirCargoTrackingPage from '../pages/documentation/AirCargoTrackingPage'


import { SuperAdminProtectedRoute } from '../features/superadmin/components/SuperAdminProtectedRoute/SuperAdminProtectedRoute'
import SuperAdminLoginPage from '../features/superadmin/pages/SuperAdminLoginPage'
import SuperAdminDashboardPage from '../features/superadmin/pages/SuperAdminDashboardPage'
import TenantListPage from '../features/tenants/pages/TenantListPage'
import TenantCreatePage from '../features/tenants/pages/TenantCreatePage'
import TenantEditPage from '../features/tenants/pages/TenantEditPage'
import TenantDetailPage from '../features/tenants/pages/TenantDetailPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-base font-semibold text-[var(--color-neutral-700)]">{title}</p>
      <p className="text-sm text-[var(--color-neutral-400)]">Coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/features', element: <FeaturesPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/modules', element: <ModulesPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/403', element: <Forbidden /> },

  { path: '/superadmin/login', element: <SuperAdminLoginPage /> },
  {
    path: '/superadmin',
    element: <SuperAdminProtectedRoute />,
    children: [
      {
        element: <AppShell title="KingFisher Tech Gold — Platform Admin" />,
        children: [
          { index: true, element: <Navigate to="/superadmin/dashboard" replace /> },
          { path: 'dashboard', element: <SuperAdminDashboardPage /> },
          { path: 'tenants', element: <TenantListPage /> },
          { path: 'tenants/new', element: <TenantCreatePage /> },
          { path: 'tenants/:id', element: <TenantDetailPage /> },
          { path: 'tenants/:id/edit', element: <TenantEditPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell title="KingFisher Tech Gold" />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/customers', element: <CustomerServiceMenuPage /> },
          { path: '/customers/:id', element: <Placeholder title="Customer Profile" /> },
          { path: '/customer-service/shipments', element: <AllShipmentsPage /> },
          { path: '/customer-service/enquiry-sheet', element: <EnquirySheetPage /> },
          { path: '/customer-service/pricing-dashboard', element: <PricingDashboardPage /> },
          { path: '/customer-service/sailing-schedule', element: <SailingSchedulePage /> },
          { path: '/customer-service/agent-edi', element: <AgentEdiPage /> },
          { path: '/customer-service/costing-search', element: <CostingSearchPage /> },
          { path: '/customer-service/tracking', element: <ShipmentTrackingPage /> },
          { path: '/quotations', element: <QuotationsMenuPage /> },
          { path: '/quotations/all', element: <AllQuotationsPage /> },
          { path: '/quotations/tariff-master', element: <OnlineTariffMasterPage /> },
          { path: '/quotations/zip-distance-master', element: <ZipDistanceMasterPage /> },
          { path: '/jobs/air-export', element: <Placeholder title="Air Export Jobs" /> },
          { path: '/jobs/air-export/new', element: <Placeholder title="New Air Export" /> },
          { path: '/jobs/air-export/:id', element: <Placeholder title="Air Export Detail" /> },
          { path: '/jobs/sea-export', element: <Placeholder title="Sea Export Jobs" /> },
          { path: '/jobs/sea-export/new', element: <Placeholder title="New Sea Export" /> },
          { path: '/jobs/sea-export/:id', element: <Placeholder title="Sea Export Detail" /> },
          { path: '/jobs/sea-import', element: <Placeholder title="Sea Import Jobs" /> },
          { path: '/jobs/sea-import/new', element: <Placeholder title="New Sea Import" /> },
          { path: '/jobs/sea-import/:id', element: <Placeholder title="Sea Import Detail" /> },
          { path: '/documentation', element: <DocumentationMenuPage /> },
          {path: '/documentation/all-jobs', element: <AllJobsPageDocumentation />},
          {path: '/documentation/boe-dashboard', element: <BoeDashboardPage />},
          {path: '/documentation/bayan-edi-job-list', element: <BayanEdiJobListPage />},
          {path: '/documentation/bayan-edi-shipment-house-list', element: <BayanEdiShipmentHouseListPage />},
          {path: '/documentation/bulk-cost-entry', element: <BulkCostEntryPage />},
          {path: '/documentation/ccn-fwb-fhl-edi-job-list', element: <CcnFwbFhlEdiJobListPage />},
          {path: '/documentation/cgm-edi-vessel-list', element: <CgmEdiVesselListPage />},
          {path: '/documentation/cargo-tracking-air', element: <AirCargoTrackingPage />},

          { path: '/management', element: <ManagementMenuPage /> },
          {path: '/management/all-jobs-mis', element: <AllJobMisPage />},
          {path: '/management/complaints', element: <ComplaintsPage />},
          {path: '/management/data-backup-export', element: <DataBackupExportPage />},
          {path: '/management/management-dashboard', element: <ManagementDashboardPage />},
          {path: '/management/management-dashboard/reports', element: <ManagementDashboardReportsPage />},
          {path: '/management/user-access', element: <UserAccessPage />},
          {path: '/management/user-wise-performance', element: <UserWisePerformancePage />},
          { path: '/nvocc', element: <NvoccMenuPage /> },
          { path: '/nvocc/all-jobs', element: <AllJobsPage /> },
          { path: '/nvocc/booking-list', element: <BookingListPage /> },
          { path: '/nvocc/enquiry-list', element: <EnquiryListPage /> },
          { path: '/nvocc/load-list', element: <LoadListPage /> },
          {path: '/nvocc/vessel-voyage-master', element: <VesselVoyageMasterPage />},
          { path: '/nvocc/:id', element: <Placeholder title="NVOCC Detail" /> },
          { path: '/hr', element: <HrMenuPage /> },
          { path: '/hr/employee-master', element: <EmployeesListPage /> },
          { path: '/hr/leave-request', element: <LeaveRequestPage /> },
          { path: '/hr/pay-roll', element: <PayRollPage /> },
          { path: '/hr/salary-upload', element: <SalaryLedgerPage /> },
          { path: '/reports', element: <Placeholder title="Reports" /> },
          { path: '/settings', element: <Placeholder title="Settings" /> },
          { path: '/settings/users', element: <Placeholder title="Users" /> },
          { path: '/profile', element: <Placeholder title="My Profile" /> },
          { path: '/notifications', element: <Placeholder title="Notifications" /> },
          { path: '/sales', element: <SalesMenuPage /> },
          {path: '/sales/call-sheet', element: <CallSheetPage />},
          {path: '/sales/client-request-list', element: <ClientRequestListPage />},
          {path: '/sales/lead', element: <SalesLeadPage />},
          {path: '/sales/rate-charges', element: <RateChargesPage />},
          {path: '/sales/sales-budget', element: <SalesBudgetPage />},
          {path: '/sales/sales-dashboard', element: <SalesDashboardPage />},
          {path: '/sales/shipments-list', element: <ShipmentsListSalesPage />},
          {path: '/sales/visiting-card-list', element: <VisitingCardListPage />},



          {
            element: <ProtectedRoute requirePermissions={['menu_finance']} />,
            children: [
              { path: '/finance', element: <Placeholder title="Finance Dashboard" /> },
              { path: '/invoices', element: <Placeholder title="Invoices" /> },
              { path: '/invoices/:id', element: <Placeholder title="Invoice Detail" /> },
            ],
          },
          {
            element: <ProtectedRoute requireRole="admin" />,
            children: [
              { path: '/masters', element: <Placeholder title="Masters" /> },
              { path: '/masters/airlines', element: <Placeholder title="Airlines" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])