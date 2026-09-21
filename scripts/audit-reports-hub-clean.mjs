import fs from 'node:fs';

const router = fs.readFileSync('src/router/index.tsx', 'utf8');
const menu = fs.readFileSync('src/features/reports/config/reportsMenu.ts', 'utf8');

const expected = [
  '/reports/catalog',
  '/quotations/reports',
  '/sales/reports',
  '/hr/reports',
  '/management/reports',
  '/nvocc/reports',
  '/documentation/reports',
  '/management/management-dashboard/reports',
  '/gl/reports',
  '/gl/mis/dashboard',
  '/gl/saved-reports',
  '/gl/cheques/reports/pdc-due',
  '/gl/ar/aging',
  '/gl/ap/aging',
  '/invoices/overdue',
  '/warehouse/stock',
  '/masters/awb-stock-master',
  '/masters/custom-reports',
  '/customer-service/pricing-dashboard',
];

const removed = [
  '/gl/ar/open-items',
  '/gl/ap/open-items',
  '/gl/accounts/trial-balance',
];

console.log(
  JSON.stringify(
    {
      menuHasCatalog: menu.includes('REPORT_CATALOG_ROUTE') || menu.includes('/reports/catalog'),
      expectedRoutes: expected.map((p) => ({
        path: p,
        inRouter: router.includes(`'${p}'`) || router.includes(`"${p}"`),
      })),
      removedFromMenu: removed.map((p) => ({
        path: p,
        stillInMenu: menu.includes(p),
      })),
    },
    null,
    2,
  ),
);
