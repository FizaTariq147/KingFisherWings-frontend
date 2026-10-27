import fs from 'node:fs';

const files = [
  'src/features/awbStock/pages/AwbStockDetailPage.tsx',
  'src/features/chartOfAccounts/pages/ChartOfAccountDetailPage.tsx',
  'src/features/creditNotes/pages/CreditNoteDetailPage.tsx',
  'src/features/debitNotes/pages/DebitNoteDetailPage.tsx',
  'src/features/glCheques/pages/ChequeDetailPage.tsx',
  'src/features/glPayments/pages/GlPaymentDetailPage.tsx',
  'src/features/invoices/pages/InvoiceDetailPage.tsx',
  'src/features/parties/pages/PartyDetailPage.tsx',
  'src/features/paymentRequests/pages/PaymentRequestDetailPage.tsx',
  'src/features/purchaseInvoices/pages/PurchaseInvoiceDetailPage.tsx',
  'src/features/quotations/pages/QuotationDetailPage.tsx',
  'src/features/tariffs/pages/TariffDetailPage.tsx',
  'src/features/tenants/pages/TenantDetailPage.tsx',
  'src/features/vouchers/pages/VoucherDetailPage.tsx',
  'src/features/zipDistances/pages/ZipDistanceDetailPage.tsx',
  'src/features/users/pages/UserDetailPage.tsx',
];

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;
  s = s.replace(/onBack=\{\(\)\s*=>\s*navigate\(([^)]+)\)\}/g, 'backTo={$1}');
  if (s === before) {
    console.log('NO CHANGE', file);
  } else {
    fs.writeFileSync(file, s);
    console.log('OK', file);
  }
}
