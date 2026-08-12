import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import { LegacySettingsUsersRedirect } from '../components/routing/SettingsRedirect'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage'
import MyProfilePage from '../features/auth/pages/MyProfilePage'
import SessionManagementPage from '../pages/settings/SessionManagementPage'
import SettingsMenuPage from '../pages/settings/SettingsMenuPage'
import LoginSecurityPage from '../pages/settings/LoginSecurityPage'
import Forbidden from '../pages/errors/Forbidden'
import NotFound from '../pages/errors/NotFound'
import { DashboardPage } from '../features/auth/dashboard/pages/DashboardPage'

import CustomerServiceMenuPage from '../pages/customers/CustomerServiceMenuPage'
import VendorServiceMenuPage from '../pages/vendors/VendorServiceMenuPage'
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
import QuotationOnlineQuotePage from '../features/quotations/pages/QuotationOnlineQuotePage'
import FinanceMenuPage from '../pages/finance/FinanceMenuPage'
import AccountsMenuPage from '../pages/accounts/AccountsMenuPage'
import InvoiceListPage from '../features/invoices/pages/InvoiceListPage'
import InvoiceCreatePage from '../features/invoices/pages/InvoiceCreatePage'
import InvoiceDetailPage from '../features/invoices/pages/InvoiceDetailPage'
import InvoiceEditPage from '../features/invoices/pages/InvoiceEditPage'
import InvoiceOverduePage from '../features/invoices/pages/InvoiceOverduePage'
import CreditNoteListPage from '../features/creditNotes/pages/CreditNoteListPage'
import CreditNoteCreatePage from '../features/creditNotes/pages/CreditNoteCreatePage'
import CreditNoteDetailPage from '../features/creditNotes/pages/CreditNoteDetailPage'
import PurchaseInvoiceListPage from '../features/purchaseInvoices/pages/PurchaseInvoiceListPage'
import PurchaseInvoiceCreatePage from '../features/purchaseInvoices/pages/PurchaseInvoiceCreatePage'
import PurchaseInvoiceEditPage from '../features/purchaseInvoices/pages/PurchaseInvoiceEditPage'
import PurchaseInvoiceDetailPage from '../features/purchaseInvoices/pages/PurchaseInvoiceDetailPage'
import PaymentRequestListPage from '../features/paymentRequests/pages/PaymentRequestListPage'
import PaymentRequestCreatePage from '../features/paymentRequests/pages/PaymentRequestCreatePage'
import PaymentRequestDetailPage from '../features/paymentRequests/pages/PaymentRequestDetailPage'
import PaymentRequestEditPage from '../features/paymentRequests/pages/PaymentRequestEditPage'
import ChartOfAccountListPage from '../features/chartOfAccounts/pages/ChartOfAccountListPage'
import ChartOfAccountCreatePage from '../features/chartOfAccounts/pages/ChartOfAccountCreatePage'
import ChartOfAccountDetailPage from '../features/chartOfAccounts/pages/ChartOfAccountDetailPage'
import ChartOfAccountEditPage from '../features/chartOfAccounts/pages/ChartOfAccountEditPage'
import ChartOfAccountTreePage from '../features/chartOfAccounts/pages/ChartOfAccountTreePage'
import TrialBalancePage from '../features/chartOfAccounts/pages/TrialBalancePage'
import VoucherListPage from '../features/vouchers/pages/VoucherListPage'
import VoucherCreatePage from '../features/vouchers/pages/VoucherCreatePage'
import VoucherDetailPage from '../features/vouchers/pages/VoucherDetailPage'
import VoucherEditPage from '../features/vouchers/pages/VoucherEditPage'
import GlPaymentListPage from '../features/glPayments/pages/GlPaymentListPage'
import GlPaymentCreatePage from '../features/glPayments/pages/GlPaymentCreatePage'
import GlPaymentDetailPage from '../features/glPayments/pages/GlPaymentDetailPage'
import GlPaymentEditPage from '../features/glPayments/pages/GlPaymentEditPage'
import ChequeListPage from '../features/glCheques/pages/ChequeListPage'
import ChequeCreatePage from '../features/glCheques/pages/ChequeCreatePage'
import ChequeDetailPage from '../features/glCheques/pages/ChequeDetailPage'
import ChequeEditPage from '../features/glCheques/pages/ChequeEditPage'
import PdcDueReportPage from '../features/glCheques/pages/PdcDueReportPage'
import BankReconciliationListPage from '../features/glBankReconciliation/pages/BankReconciliationListPage'
import BankReconciliationCreatePage from '../features/glBankReconciliation/pages/BankReconciliationCreatePage'
import BankReconciliationDetailPage from '../features/glBankReconciliation/pages/BankReconciliationDetailPage'
import BankTransferCreatePage from '../features/glBankReconciliation/pages/BankTransferCreatePage'
import FinancialReportsPage from '../features/glFinancialReports/pages/FinancialReportsPage'
import GlMisDashboardPage from '../features/glMisDashboard/pages/GlMisDashboardPage'
import SavedReportListPage from '../features/glSavedReports/pages/SavedReportListPage'
import SavedReportCreatePage from '../features/glSavedReports/pages/SavedReportCreatePage'
import SavedReportDetailPage from '../features/glSavedReports/pages/SavedReportDetailPage'
import SavedReportEditPage from '../features/glSavedReports/pages/SavedReportEditPage'
import ArAgingPage from '../features/arApAging/pages/ArAgingPage'
import ApAgingPage from '../features/arApAging/pages/ApAgingPage'
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
import { PortalShell } from '../features/portal-auth/layout/PortalShell'
import { PortalProtectedRoute } from '../features/portal-auth/components/PortalProtectedRoute'
import PortalLoginPage from '../features/portal-auth/pages/PortalLoginPage'
import PortalHomePage from '../features/portal-auth/pages/PortalHomePage'
import PortalAlertsPage from '../features/portal-auth/pages/PortalAlertsPage'
import PortalAccountPage from '../features/portal-auth/pages/PortalAccountPage'
import PortalBookPage from '../features/portal-quotations/pages/PortalBookPage'
import PortalQuotesPage from '../features/portal-quotations/pages/PortalQuotesPage'
import PortalQuoteDetailPage from '../features/portal-quotations/pages/PortalQuoteDetailPage'
import PortalTrackPage from '../features/portal-shipments/pages/PortalTrackPage'
import PortalShipmentsPage from '../features/portal-shipments/pages/PortalShipmentsPage'
import PortalShipmentDetailPage from '../features/portal-shipments/pages/PortalShipmentDetailPage'
import PortalDocumentsPage from '../features/portal-documents/pages/PortalDocumentsPage'
import PortalInvoicesPage from '../features/portal-invoices/pages/PortalInvoicesPage'
import PortalInvoiceDetailPage from '../features/portal-invoices/pages/PortalInvoiceDetailPage'
import PortalCreditNotesPage from '../features/portal-credit-notes/pages/PortalCreditNotesPage'
import PortalCreditNoteDetailPage from '../features/portal-credit-notes/pages/PortalCreditNoteDetailPage'
import PortalPaymentsPage from '../features/portal-payments/pages/PortalPaymentsPage'
import PortalCreditPage from '../features/portal-credit/pages/PortalCreditPage'
import PortalCreditRequestsPage from '../features/portal-credit-requests/pages/PortalCreditRequestsPage'
import PortalMessagesPage from '../features/portal-messages/pages/PortalMessagesPage'
import PortalDisputesPage from '../features/portal-disputes/pages/PortalDisputesPage'
import PortalAdminInboxPage from '../features/portal-admin-inbox/pages/PortalAdminInboxPage'
import PortalUsersAdminPage from '../features/portal-admin/pages/PortalUsersAdminPage'
import VendorAdminDisputesPage from '../features/vendor-admin-disputes/pages/VendorAdminDisputesPage'
import VendorUsersAdminPage from '../features/vendor-users-admin/pages/VendorUsersAdminPage'
import { VendorShell } from '../features/vendor-auth/layout/VendorShell'
import { VendorProtectedRoute } from '../features/vendor-auth/components/VendorProtectedRoute'
import VendorLoginPage from '../features/vendor-auth/pages/VendorLoginPage'
import VendorHomePage from '../features/vendor-auth/pages/VendorHomePage'
import VendorAccountPage from '../features/vendor-auth/pages/VendorAccountPage'
import VendorInvoicesPage from '../features/vendor-invoices/pages/VendorInvoicesPage'
import VendorInvoiceDetailPage from '../features/vendor-invoices/pages/VendorInvoiceDetailPage'
import VendorPaymentsPage from '../features/vendor-payments/pages/VendorPaymentsPage'
import VendorAdvancesPage from '../features/vendor-payments/pages/VendorAdvancesPage'
import VendorCreditNotesPage from '../features/vendor-credit-notes/pages/VendorCreditNotesPage'
import VendorCreditPage from '../features/vendor-credit/pages/VendorCreditPage'
import VendorSchedulePage from '../features/vendor-schedule/pages/VendorSchedulePage'
import VendorPaymentRequestsPage from '../features/vendor-payment-requests/pages/VendorPaymentRequestsPage'
import VendorDisputesPage from '../features/vendor-disputes/pages/VendorDisputesPage'
import VendorTdsPage from '../features/vendor-tds/pages/VendorTdsPage'
import PublicTrackPage from '../features/public-track/pages/PublicTrackPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
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

  { path: '/portal/login', element: <PortalLoginPage /> },
  { path: '/portal/accept-invite', element: <PortalLoginPage /> },
  { path: '/track', element: <PublicTrackPage /> },
  {
    path: '/portal',
    element: <PortalProtectedRoute />,
    children: [
      {
        element: <PortalShell />,
        children: [
          { index: true, element: <PortalHomePage /> },
          { path: 'book', element: <PortalBookPage /> },
          { path: 'track', element: <PortalTrackPage /> },
          { path: 'shipments', element: <PortalShipmentsPage /> },
          { path: 'shipments/:id', element: <PortalShipmentDetailPage /> },
          { path: 'quotes', element: <PortalQuotesPage /> },
          { path: 'quotes/:id', element: <PortalQuoteDetailPage /> },
          { path: 'invoices', element: <PortalInvoicesPage /> },
          { path: 'invoices/:id', element: <PortalInvoiceDetailPage /> },
          { path: 'credit-notes', element: <PortalCreditNotesPage /> },
          { path: 'credit-notes/:id', element: <PortalCreditNoteDetailPage /> },
          { path: 'debit-notes', element: <PortalCreditNotesPage /> },
          { path: 'debit-notes/:id', element: <PortalCreditNoteDetailPage /> },
          { path: 'payments', element: <PortalPaymentsPage /> },
          { path: 'credit', element: <PortalCreditPage /> },
          { path: 'credit-requests', element: <PortalCreditRequestsPage /> },
          { path: 'documents', element: <PortalDocumentsPage /> },
          { path: 'messages', element: <PortalMessagesPage /> },
          { path: 'disputes', element: <PortalDisputesPage /> },
          { path: 'alerts', element: <PortalAlertsPage /> },
          { path: 'account', element: <PortalAccountPage /> },
        ],
      },
    ],
  },

  { path: '/vendor/login', element: <VendorLoginPage /> },
  { path: '/vendor/accept-invite', element: <VendorLoginPage /> },
  {
    path: '/vendor',
    element: <VendorProtectedRoute />,
    children: [
      {
        element: <VendorShell />,
        children: [
          { index: true, element: <VendorHomePage /> },
          { path: 'invoices', element: <VendorInvoicesPage /> },
          { path: 'invoices/:id', element: <VendorInvoiceDetailPage /> },
          { path: 'payments', element: <VendorPaymentsPage /> },
          { path: 'advances', element: <VendorAdvancesPage /> },
          { path: 'credit-notes', element: <VendorCreditNotesPage /> },
          { path: 'schedule', element: <VendorSchedulePage /> },
          { path: 'credit', element: <VendorCreditPage /> },
          { path: 'payment-requests', element: <VendorPaymentRequestsPage /> },
          { path: 'disputes', element: <VendorDisputesPage /> },
          { path: 'tds', element: <VendorTdsPage /> },
          { path: 'account', element: <VendorAccountPage /> },
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
          { path: '/vendors', element: <VendorServiceMenuPage /> },
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
          {
            element: <ProtectedRoute requirePermissions={['menu_quotations']} />,
            children: [
              { path: '/quotations', element: <QuotationsMenuPage /> },
              { path: '/quotations/all', element: <QuotationListPage /> },
              { path: '/quotations/new', element: <QuotationCreatePage /> },
              { path: '/quotations/online-quote', element: <QuotationOnlineQuotePage /> },
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
            ],
          },
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
          { path: '/settings', element: <SettingsMenuPage /> },
          { path: '/settings/sessions', element: <SessionManagementPage /> },
          { path: '/settings/login-security', element: <LoginSecurityPage /> },
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
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/portal-admin/inbox', element: <PortalAdminInboxPage /> },
          { path: '/portal-users', element: <PortalUsersAdminPage /> },
          { path: '/vendor-users', element: <VendorUsersAdminPage /> },
          {
            element: (
              <ProtectedRoute requireAnyPermission={['menu_finance', 'menu_customers']} />
            ),
            children: [{ path: '/vendor-admin/disputes', element: <VendorAdminDisputesPage /> }],
          },
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
              { path: '/finance', element: <FinanceMenuPage /> },
              { path: '/invoices', element: <InvoiceListPage /> },
              { path: '/invoices/new', element: <InvoiceCreatePage /> },
              { path: '/invoices/overdue', element: <InvoiceOverduePage /> },
              { path: '/invoices/:id/edit', element: <InvoiceEditPage /> },
              { path: '/invoices/:id', element: <InvoiceDetailPage /> },
              { path: '/purchase-invoices', element: <PurchaseInvoiceListPage /> },
              { path: '/purchase-invoices/new', element: <PurchaseInvoiceCreatePage /> },
              { path: '/purchase-invoices/:id/edit', element: <PurchaseInvoiceEditPage /> },
              { path: '/purchase-invoices/:id', element: <PurchaseInvoiceDetailPage /> },
              { path: '/credit-notes', element: <CreditNoteListPage /> },
              { path: '/credit-notes/new', element: <CreditNoteCreatePage /> },
              { path: '/credit-notes/:id', element: <CreditNoteDetailPage /> },
              { path: '/payment-requests', element: <PaymentRequestListPage /> },
              { path: '/payment-requests/new', element: <PaymentRequestCreatePage /> },
              { path: '/payment-requests/:id/edit', element: <PaymentRequestEditPage /> },
              { path: '/payment-requests/:id', element: <PaymentRequestDetailPage /> },
            ],
          },
          {
            element: (
              <ProtectedRoute requireAnyPermission={['menu_accounts', 'menu_finance']} />
            ),
            children: [
              { path: '/accounts', element: <AccountsMenuPage /> },
              { path: '/gl/accounts', element: <ChartOfAccountListPage /> },
              { path: '/gl/accounts/new', element: <ChartOfAccountCreatePage /> },
              { path: '/gl/accounts/tree', element: <ChartOfAccountTreePage /> },
              { path: '/gl/accounts/trial-balance', element: <TrialBalancePage /> },
              { path: '/gl/accounts/:id/edit', element: <ChartOfAccountEditPage /> },
              { path: '/gl/accounts/:id', element: <ChartOfAccountDetailPage /> },
              { path: '/gl/vouchers', element: <VoucherListPage /> },
              { path: '/gl/vouchers/new', element: <VoucherCreatePage /> },
              { path: '/gl/vouchers/:id/edit', element: <VoucherEditPage /> },
              { path: '/gl/vouchers/:id', element: <VoucherDetailPage /> },
              { path: '/gl/payments', element: <GlPaymentListPage /> },
              { path: '/gl/payments/new', element: <GlPaymentCreatePage /> },
              { path: '/gl/payments/:id/edit', element: <GlPaymentEditPage /> },
              { path: '/gl/payments/:id', element: <GlPaymentDetailPage /> },
              { path: '/gl/cheques', element: <ChequeListPage /> },
              { path: '/gl/cheques/new', element: <ChequeCreatePage /> },
              { path: '/gl/cheques/reports/pdc-due', element: <PdcDueReportPage /> },
              { path: '/gl/cheques/:id/edit', element: <ChequeEditPage /> },
              { path: '/gl/cheques/:id', element: <ChequeDetailPage /> },
              { path: '/gl/bank-reconciliations', element: <BankReconciliationListPage /> },
              { path: '/gl/bank-reconciliations/new', element: <BankReconciliationCreatePage /> },
              { path: '/gl/bank-reconciliations/:id', element: <BankReconciliationDetailPage /> },
              { path: '/gl/bank-transfers/new', element: <BankTransferCreatePage /> },
              { path: '/gl/reports', element: <FinancialReportsPage /> },
              { path: '/gl/mis/dashboard', element: <GlMisDashboardPage /> },
              { path: '/gl/saved-reports', element: <SavedReportListPage /> },
              { path: '/gl/saved-reports/new', element: <SavedReportCreatePage /> },
              { path: '/gl/saved-reports/:id/edit', element: <SavedReportEditPage /> },
              { path: '/gl/saved-reports/:id', element: <SavedReportDetailPage /> },
              { path: '/gl/ar/aging', element: <ArAgingPage /> },
              { path: '/gl/ap/aging', element: <ApAgingPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])