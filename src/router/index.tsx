import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import { SettingsRedirect, LegacySettingsUsersRedirect } from '../components/routing/SettingsRedirect'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage'
import MyProfilePage from '../features/auth/pages/MyProfilePage'
import Forbidden from '../pages/errors/Forbidden'
import NotFound from '../pages/errors/NotFound'
import { DashboardPage } from '../features/auth/dashboard/pages/DashboardPage'

import CustomerServiceMenuPage from '../pages/customers/CustomerServiceMenuPage'
import AllShipmentsPage from '../pages/customers/AllShipments'
import EnquirySheetPage from '../pages/customers/EnquirySheetPage'
import PricingDashboardPage from '../pages/customers/PricingDashboardPage'
import SailingSchedulePage from '../pages/customers/SailingSchedulePage'
import AgentEdiPage from '../pages/customers/AgentEdiPage'
import CostingSearchPage from '../pages/customers/CostingSearchPage'
import ShipmentTrackingPage from '../pages/customers/ShipmentTrackingPage'
import  QuotationsMenuPage  from '../pages/quotations/QuotationsMenuPage'
import QuotationListPage from '../features/quotations/pages/QuotationListPage'
import QuotationCreatePage from '../features/quotations/pages/QuotationCreatePage'
import QuotationDetailPage from '../features/quotations/pages/QuotationDetailPage'
import QuotationEditPage from '../features/quotations/pages/QuotationEditPage'
import QuotationReportsPage from '../features/quotations/pages/QuotationReportsPage'
import {
  OnlineTariffCreatePage,
  OnlineTariffDetailPage,
  OnlineTariffEditPage,
  OnlineTariffListPage,
} from '../pages/quotations/OnlineTariffMasterPage'
import RedirectMastersTariffsToQuotations from '../pages/quotations/RedirectMastersTariffsToQuotations'
import RedirectMastersZipDistancesToQuotations from '../pages/quotations/RedirectMastersZipDistancesToQuotations'
import {
  ZipDistanceCreatePage,
  ZipDistanceDetailPage,
  ZipDistanceEditPage,
  ZipDistanceListPage,
} from '../pages/quotations/ZipDistanceMasterPage'
import JobListPage from '../features/jobs/pages/JobListPage'
import JobCreatePage from '../features/jobs/pages/JobCreatePage'
import JobDetailPage from '../features/jobs/pages/JobDetailPage'
import JobEditPage from '../features/jobs/pages/JobEditPage'
import AwbStockListPage from '../features/awbStock/pages/AwbStockListPage'
import AwbStockCreatePage from '../features/awbStock/pages/AwbStockCreatePage'
import AwbStockDetailPage from '../features/awbStock/pages/AwbStockDetailPage'
import AwbStockEditPage from '../features/awbStock/pages/AwbStockEditPage'
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
import MastersMenuPage from '../pages/masters/MastersMenuPage'
import MasterResourceListPage from '../features/masters/pages/MasterResourceListPage'
import MasterResourceFormPage from '../features/masters/pages/MasterResourceFormPage'
import MasterResourceDetailPage from '../features/masters/pages/MasterResourceDetailPage'

import { SuperAdminProtectedRoute } from '../features/superadmin/components/SuperAdminProtectedRoute/SuperAdminProtectedRoute'
import SuperAdminLoginPage from '../features/superadmin/pages/SuperAdminLoginPage'
import SuperAdminDashboardPage from '../features/superadmin/pages/SuperAdminDashboardPage'
import TenantListPage from '../features/tenants/pages/TenantListPage'
import TenantCreatePage from '../features/tenants/pages/TenantCreatePage'
import TenantEditPage from '../features/tenants/pages/TenantEditPage'
import TenantDetailPage from '../features/tenants/pages/TenantDetailPage'
import CompanyListPage from '../features/companies/pages/CompanyListPage'
import CompanyCreatePage from '../features/companies/pages/CompanyCreatePage'
import CompanyEditPage from '../features/companies/pages/CompanyEditPage'
import CompanyDetailPage from '../features/companies/pages/CompanyDetailPage'
import UserListPage from '../features/users/pages/UserListPage'
import UserCreatePage from '../features/users/pages/UserCreatePage'
import UserDetailPage from '../features/users/pages/UserDetailPage'
import UserEditPage from '../features/users/pages/UserEditPage'
import PartyListPage from '../features/parties/pages/PartyListPage'
import PartyCreatePage from '../features/parties/pages/PartyCreatePage'
import PartyDetailPage from '../features/parties/pages/PartyDetailPage'
import PartyEditPage from '../features/parties/pages/PartyEditPage'
import OrganizationShell from '../features/organization/pages/OrganizationShell'
import OrganizationProfilePage from '../features/organization/pages/OrganizationProfilePage'
import BankAccountsPage from '../features/organization/pages/BankAccountsPage'
import NumberFormatsPage from '../features/organization/pages/NumberFormatsPage'
import { TENANT_USER_MANAGER_ROLE_SLUGS } from '../features/users/constants/userPermissions'
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-base font-semibold text-[var(--color-neutral-700)]">{title}</p>
      <p className="text-sm text-[var(--color-neutral-400)]">Coming soon</p>
    </div>
  )
}

export const router = createBrowserRouter([

  { path: '/', element: <Navigate to="/login" replace /> },
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
          { path: 'companies', element: <CompanyListPage /> },
          { path: 'companies/new', element: <CompanyCreatePage /> },
          { path: 'companies/:id', element: <CompanyDetailPage /> },
          { path: 'companies/:id/edit', element: <CompanyEditPage /> },
          // Super Admin cannot access tenant user management — Tenant Admin owns that in ERP.
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      { path: '/change-password', element: <ChangePasswordPage /> },
      {
        element: <AppShell title="KingFisher Tech Gold" />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/customers', element: <CustomerServiceMenuPage /> },
          { path: '/customers/:id', element: <Placeholder title="Customer Profile" /> },
          {
            element: (
              <ProtectedRoute
                requireAnyRole={[...TENANT_USER_MANAGER_ROLE_SLUGS]}
              />
            ),
            children: [
              { path: '/parties', element: <PartyListPage /> },
              { path: '/parties/new', element: <PartyCreatePage /> },
              { path: '/parties/:id', element: <PartyDetailPage /> },
              { path: '/parties/:id/edit', element: <PartyEditPage /> },
              {
                path: '/organization',
                element: <OrganizationShell />,
                children: [
                  { index: true, element: <OrganizationProfilePage /> },
                  { path: 'bank-accounts', element: <BankAccountsPage /> },
                  { path: 'number-formats', element: <NumberFormatsPage /> },
                ],
              },
            ],
          },
          { path: '/customer-service/shipments', element: <AllShipmentsPage /> },
          { path: '/customer-service/enquiry-sheet', element: <EnquirySheetPage /> },
          { path: '/customer-service/pricing-dashboard', element: <PricingDashboardPage /> },
          { path: '/customer-service/sailing-schedule', element: <SailingSchedulePage /> },
          { path: '/customer-service/agent-edi', element: <AgentEdiPage /> },
          { path: '/customer-service/costing-search', element: <CostingSearchPage /> },
          { path: '/customer-service/tracking', element: <ShipmentTrackingPage /> },
          { path: '/quotations', element: <QuotationsMenuPage /> },
          { path: '/quotations/all', element: <QuotationListPage /> },
          { path: '/quotations/new', element: <QuotationCreatePage /> },
          { path: '/quotations/reports', element: <QuotationReportsPage /> },
          { path: '/quotations/tariff-master', element: <OnlineTariffListPage /> },
          { path: '/quotations/tariff-master/new', element: <OnlineTariffCreatePage /> },
          { path: '/quotations/tariff-master/:id/edit', element: <OnlineTariffEditPage /> },
          { path: '/quotations/tariff-master/:id', element: <OnlineTariffDetailPage /> },
          { path: '/quotations/zip-distance-master', element: <ZipDistanceListPage /> },
          { path: '/quotations/zip-distance-master/new', element: <ZipDistanceCreatePage /> },
          { path: '/quotations/zip-distance-master/:id/edit', element: <ZipDistanceEditPage /> },
          { path: '/quotations/zip-distance-master/:id', element: <ZipDistanceDetailPage /> },
          { path: '/quotations/:id/edit', element: <QuotationEditPage /> },
          { path: '/quotations/:id', element: <QuotationDetailPage /> },
          { path: '/jobs/new', element: <JobCreatePage /> },
          { path: '/jobs/air-export', element: <JobListPage /> },
          { path: '/jobs/air-export/new', element: <JobCreatePage /> },
          { path: '/jobs/air-export/:id/edit', element: <JobEditPage /> },
          { path: '/jobs/air-export/:id', element: <JobDetailPage /> },
          { path: '/jobs/sea-export', element: <JobListPage /> },
          { path: '/jobs/sea-export/new', element: <JobCreatePage /> },
          { path: '/jobs/sea-export/:id/edit', element: <JobEditPage /> },
          { path: '/jobs/sea-export/:id', element: <JobDetailPage /> },
          { path: '/jobs/sea-import', element: <JobListPage /> },
          { path: '/jobs/sea-import/new', element: <JobCreatePage /> },
          { path: '/jobs/sea-import/:id/edit', element: <JobEditPage /> },
          { path: '/jobs/sea-import/:id', element: <JobDetailPage /> },
          { path: '/documentation', element: <DocumentationMenuPage /> },
          {path: '/documentation/all-jobs', element: <AllJobsPageDocumentation />},
          {path: '/documentation/boe-dashboard', element: <BoeDashboardPage />},
          {path: '/documentation/bayan-edi-job-list', element: <BayanEdiJobListPage />},
          {path: '/documentation/bayan-edi-shipment-house-list', element: <BayanEdiShipmentHouseListPage />},
          {path: '/documentation/bulk-cost-entry', element: <BulkCostEntryPage />},
          {path: '/documentation/ccn-fwb-fhl-edi-job-list', element: <CcnFwbFhlEdiJobListPage />},
          {path: '/documentation/cgm-edi-vessel-list', element: <CgmEdiVesselListPage />},
          {path: '/documentation/cargo-tracking-air', element: <AirCargoTrackingPage />},
          

          {
            element: (
              <ProtectedRoute
                requireAnyRole={[...TENANT_USER_MANAGER_ROLE_SLUGS]}
              />
            ),
            children: [
              { path: '/masters', element: <MastersMenuPage /> },
              { path: '/masters/awb-stock-master', element: <AwbStockListPage /> },
              { path: '/masters/awb-stock-master/new', element: <AwbStockCreatePage /> },
              { path: '/masters/awb-stock-master/:id/edit', element: <AwbStockEditPage /> },
              { path: '/masters/awb-stock-master/:id', element: <AwbStockDetailPage /> },
              { path: '/masters/tariffs/new', element: <RedirectMastersTariffsToQuotations /> },
              { path: '/masters/tariffs/:id/edit', element: <RedirectMastersTariffsToQuotations /> },
              { path: '/masters/tariffs/:id', element: <RedirectMastersTariffsToQuotations /> },
              { path: '/masters/tariffs', element: <RedirectMastersTariffsToQuotations /> },
              { path: '/masters/zip-distances/new', element: <RedirectMastersZipDistancesToQuotations /> },
              { path: '/masters/zip-distances/:id/edit', element: <RedirectMastersZipDistancesToQuotations /> },
              { path: '/masters/zip-distances/:id', element: <RedirectMastersZipDistancesToQuotations /> },
              { path: '/masters/zip-distances', element: <RedirectMastersZipDistancesToQuotations /> },
              { path: '/masters/:resourceKey', element: <MasterResourceListPage /> },
              { path: '/masters/:resourceKey/new', element: <MasterResourceFormPage /> },
              { path: '/masters/:resourceKey/:id', element: <MasterResourceDetailPage /> },
              { path: '/masters/:resourceKey/:id/edit', element: <MasterResourceFormPage /> },
            ],
          },

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
          { path: '/settings', element: <SettingsRedirect /> },
          {
            element: (
              <ProtectedRoute
                requireAnyRole={[...TENANT_USER_MANAGER_ROLE_SLUGS]}
              />
            ),
            children: [
              { path: '/admin/users', element: <UserListPage /> },
              { path: '/admin/users/new', element: <UserCreatePage /> },
              { path: '/admin/users/:id', element: <UserDetailPage /> },
              { path: '/admin/users/:id/edit', element: <UserEditPage /> },
            ],
          },
          // Legacy: Users used to live under Settings — send to Admin Users
          {
            path: '/settings/users/*',
            element: <LegacySettingsUsersRedirect />,
          },
          { path: '/profile', element: <MyProfilePage /> },
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
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])