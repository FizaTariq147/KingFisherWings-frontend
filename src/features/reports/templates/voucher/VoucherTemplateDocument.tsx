/**
 * Finance voucher — payment / receipt / journal faces with Dr/Cr entries.
 * Not a commercial invoice charge table.
 */
import type { VoucherViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  SectionTitle,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: VoucherViewModel };

function kindChrome(kind: VoucherViewModel['voucherKind']) {
  if (kind === 'payment') {
    return { accent: colors.bandWarn, title: 'Payment voucher', band: 'PAYMENT VOUCHER' };
  }
  if (kind === 'receipt') {
    return { accent: colors.bandAlt, title: 'Receipt voucher', band: 'RECEIPT VOUCHER' };
  }
  return { accent: colors.band, title: 'Journal voucher', band: 'JOURNAL VOUCHER' };
}

export function VoucherTemplateDocument({ model }: Props) {
  const chrome = kindChrome(model.voucherKind);
  const entryHeaders =
    model.entryHeaders && model.entryHeaders.length
      ? model.entryHeaders
      : ['Account', 'Particulars', 'Debit', 'Credit'];
  const entryRows = model.entryRows && model.entryRows.length ? model.entryRows : undefined;

  return (
    <DocPageChrome data-report-template={`voucher.${model.voucherKind}`}>
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={chrome.accent}
        subtitle={chrome.title}
      />

      <div
        style={{
          background: chrome.accent,
          color: '#fff',
          padding: '8px 10px',
          fontWeight: 700,
          letterSpacing: 0.5,
          marginBottom: 12,
        }}
      >
        {chrome.band}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>{model.formatCode}</div>

      <KeyValueGrid
        columns={3}
        items={[
          { label: 'Voucher no.', value: model.voucherNumber },
          { label: 'Date', value: model.voucherDate },
          { label: 'Party', value: model.partyName },
          { label: 'Currency', value: model.currencyCode },
          { label: 'Document total', value: model.total },
          { label: 'Type', value: model.voucherKind },
        ]}
      />

      <SectionTitle accent={chrome.accent}>Accounting entries</SectionTitle>
      {entryRows ? (
        <DataTable headers={entryHeaders} rows={entryRows} dense />
      ) : model.lines.length ? (
        <DataTable
          headers={['Particulars', 'Amount']}
          rows={model.lines.map((l) => [l.description, l.amount || '—'])}
          dense
        />
      ) : (
        <div
          style={{
            fontSize: 10,
            color: colors.muted,
            padding: 8,
            border: `1px dashed ${colors.line}`,
          }}
        >
          {model.entityBound
            ? 'No accounting lines in bound context (N/A) — balances are not invented.'
            : 'No entry lines in fixture / demo context.'}
        </div>
      )}

      <SignatureBlock labels={['Prepared by', 'Checked by', 'Approved by']} />
    </DocPageChrome>
  );
}
