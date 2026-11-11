import type { LedgerViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  SectionTitle,
  colors,
} from '../shared';

type Props = { model: LedgerViewModel };

export function FinancialStatementTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="financial_statement.standard">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.ink}
        subtitle="Financial statement"
      />
      <div style={{ fontSize: 15, fontWeight: 700 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>{model.formatCode}</div>
      <SectionTitle accent={colors.ink}>Statement lines</SectionTitle>
      <DataTable headers={model.tableHeaders} rows={model.tableRows} />
      <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, fontWeight: 700 }}>
        Closing: {model.closingBalance || '—'}
      </div>
    </DocPageChrome>
  );
}
