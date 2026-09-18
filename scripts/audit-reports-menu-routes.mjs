import fs from 'node:fs';

const router = fs.readFileSync('src/router/index.tsx', 'utf8');
const accounts = fs.readFileSync('src/features/chartOfAccounts/config/accountsMenu.ts', 'utf8');

const glIds = [
  'ar-aging',
  'ap-aging',
  'ar-open-items',
  'ap-open-items',
  'pdc-due-report',
  'financial-reports',
  'mis-dashboard',
  'my-reports',
  'trial-balance',
];

const paths = [];
for (const id of glIds) {
  const re = new RegExp(`id: '${id}'[\\s\\S]*?path: '([^']+)'`);
  const m = accounts.match(re);
  paths.push({ id, path: m ? m[1] : null });
}

const modulePaths = [
  '/reports/catalog',
  '/quotations/reports',
  '/sales/reports',
  '/hr/reports',
  '/management/reports',
  '/nvocc/reports',
  '/documentation/reports',
  '/management/management-dashboard/reports',
  '/gl/ar/aging',
  '/gl/ap/aging',
  '/gl/ar/open-items',
  '/gl/ap/open-items',
  '/gl/cheques/reports/pdc-due',
  '/gl/reports',
  '/gl/mis/dashboard',
  '/gl/saved-reports',
  '/gl/accounts/trial-balance',
];

console.log(
  JSON.stringify(
    {
      glTiles: paths,
      routes: modulePaths.map((p) => ({
        path: p,
        inRouter: router.includes(`'${p}'`) || router.includes(`"${p}"`),
      })),
    },
    null,
    2,
  ),
);
