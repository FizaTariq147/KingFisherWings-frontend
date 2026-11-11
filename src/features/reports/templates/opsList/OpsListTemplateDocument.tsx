import type { OpsListViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  colors,
} from '../shared';

type Props = { model: OpsListViewModel };

/** Dense operational list — not invoice chrome. */
export function OpsListTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome orientation="landscape" data-report-template="ops_list.dense">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.ink}
        subtitle="Operational list"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
        </div>
        <div style={{ fontSize: 9, color: colors.muted }}>
          Prefer XLSX from backend pack when bound · PDF dense preview
        </div>
      </div>
      <DataTable headers={model.tableHeaders} rows={model.tableRows} dense />
    </DocPageChrome>
  );
}
