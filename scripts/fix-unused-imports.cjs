const fs = require('fs');

const files = [
  'src/features/portal-credit-notes/utils/normalizePortalCreditNotes.ts',
  'src/features/portal-credit-requests/utils/normalizePortalCreditRequests.ts',
  'src/features/portal-credit/utils/normalizePortalCredit.ts',
  'src/features/portal-disputes/utils/normalizePortalDisputes.ts',
  'src/features/portal-invoices/utils/normalizePortalInvoices.ts',
  'src/features/portal-messages/utils/normalizePortalMessages.ts',
  'src/features/portal-payments/utils/normalizePortalPayments.ts',
  'src/features/public-track/utils/normalizePublicTrack.ts',
];

const all = [
  'asRecord',
  'normalizeMeta',
  'pickBoolean',
  'pickNumber',
  'pickString',
  'unwrapData',
  'unwrapList',
];

for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  const used = all.filter((name) => {
    const re = new RegExp(`\\b${name}\\b`, 'g');
    const matches = text.match(re) || [];
    return matches.length > 1;
  });
  const importBlock =
    'import {\n  ' + used.join(',\n  ') + "\n} from '@/features/portal-shared/normalize';";
  text = text.replace(
    /import \{[\s\S]*?\} from '@\/features\/portal-shared\/normalize';/,
    importBlock,
  );
  fs.writeFileSync(f, text);
  console.log(f, '->', used.join(','));
}
