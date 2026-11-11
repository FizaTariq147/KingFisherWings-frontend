import type { LedgerViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  SectionTitle,
  colors,
} from '../shared';

type Props = { model: LedgerViewModel };

export function LedgerTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="ledger.chronological">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.band}
        subtitle="Account ledger"
      />
      <div style={{ fontSize: 15, fontWeight: 700 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>{model.formatCode}</div>
      <KeyValueGrid
        columns={3}
        items={[
          { label: 'Party', value: model.partyName },
          { label: 'Opening balance', value: model.openingBalance },
          { label: 'Closing balance', value: model.closingBalance },
        ]}
      />
      <SectionTitle>Transactions</SectionTitle>
      <DataTable headers={model.tableHeaders} rows={model.tableRows} dense />
    </DocPageChrome>
  );
}
