/**
 * Distinct HAWB layouts by kind — not a shared invoice charge-table shell.
 */
import type { HawbViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  PartyTriple,
  SectionTitle,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: HawbViewModel };

function kindChrome(kind: string): { accent: string; badge: string; gridLabel: string } {
  if (kind.includes('draft_format_1') || kind === 'hawb_draft_format_1') {
    return { accent: '#0e7490', badge: 'HAWB Draft · Format-1', gridLabel: 'IATA draft grid A' };
  }
  if (kind.includes('draft_format_2') || kind === 'hawb_draft_format_2') {
    return { accent: '#1d4ed8', badge: 'HAWB Draft · Format-2', gridLabel: 'IATA draft grid B' };
  }
  if (kind.includes('original_pre_printed_1') || kind === 'hawb_original_pre_printed_1') {
    return { accent: '#7c2d12', badge: 'HAWB Original · Pre-printed 1', gridLabel: 'Pre-printed face' };
  }
  if (kind.includes('original_pre_printed_2') || kind === 'hawb_original_pre_printed_2') {
    return { accent: '#9a3412', badge: 'HAWB Original · Pre-printed 2', gridLabel: 'Pre-printed copy' };
  }
  return { accent: colors.bandAlt, badge: 'HAWB Draft', gridLabel: 'Standard airway draft' };
}

export function HawbTemplateDocument({ model }: Props) {
  const chrome = kindChrome(model.hawbKind);
  const isOriginal = /original|pre_printed|final/i.test(model.hawbKind);
  return (
    <DocPageChrome data-report-template={`hawb.${model.hawbKind}`}>
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={chrome.accent}
        subtitle={chrome.badge}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isOriginal ? '1.2fr 1fr' : '1fr 1.1fr',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
          <div style={{ fontSize: 9, marginTop: 4, color: chrome.accent, fontWeight: 600 }}>
            {chrome.gridLabel}
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${chrome.accent}`,
            background: isOriginal ? '#fff7ed' : '#ecfeff',
            padding: 8,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, color: colors.muted }}>AIR WAYBILL NO.</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            {model.awbNumber || '— — —'}
          </div>
          {isOriginal ? (
            <div style={{ fontSize: 8, marginTop: 4, color: colors.bandWarn }}>
              Original — for consignee / carrier copy set
            </div>
          ) : (
            <div style={{ fontSize: 8, marginTop: 4, color: colors.accent }}>Draft — not for carriage</div>
          )}
        </div>
      </div>

      <PartyTriple
        shipper={model.shipper}
        consignee={model.consignee}
        notify={model.notify}
        accent={chrome.accent}
      />

      <SectionTitle accent={chrome.accent}>Routing</SectionTitle>
      <KeyValueGrid
        columns={isOriginal ? 3 : 4}
        items={[
          { label: 'Airport of departure', value: model.pol },
          { label: 'Airport of destination', value: model.pod },
          { label: 'Flight', value: model.vesselFlight },
          { label: 'ETD', value: model.etd },
          ...(isOriginal ? [] : [{ label: 'ETA', value: model.eta }]),
          { label: 'Job', value: model.jobNumber },
        ]}
      />

      <SectionTitle accent={chrome.accent}>Nature and quantity of goods</SectionTitle>
      {model.commodity ? (
        <div style={{ fontSize: 10, marginBottom: 6 }}>{model.commodity}</div>
      ) : null}
      <DataTable headers={model.tableHeaders} rows={model.tableRows} dense />

      {model.sampleIsFallback || model.verificationNote ? (
        <div style={{ fontSize: 8, color: colors.bandWarn, marginTop: 8 }}>
          {model.verificationNote ||
            'Internal design — no distinct public Fresa sample for this format code'}
        </div>
      ) : null}

      <SignatureBlock
        labels={
          isOriginal
            ? ['Shipper certification', 'Carrier', 'Issuing agent']
            : ['Prepared by', 'Checked by']
        }
      />
    </DocPageChrome>
  );
}
