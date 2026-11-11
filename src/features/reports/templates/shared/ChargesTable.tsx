import { colors } from './docStyles';
import { SectionTitle } from './SectionTitle';

type Line = { description: string; qty?: string; rate?: string; amount?: string };

type Props = {
  lines?: Line[];
  currencyCode?: string;
  subtotal?: string;
  tax?: string;
  total?: string;
  accent?: string;
  /** Override default "Charges" band (quote/voucher must not look like invoices). */
  sectionTitle?: string;
};

export function ChargesTable({
  lines = [],
  currencyCode,
  subtotal,
  tax,
  total,
  accent = colors.band,
  sectionTitle = 'Charges',
}: Props) {
  return (
    <div>
      <SectionTitle accent={accent}>{sectionTitle}</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr>
            {['Description', 'Qty', 'Rate', 'Amount'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === 'Description' ? 'left' : 'right',
                  border: `1px solid ${colors.line}`,
                  background: colors.wash,
                  padding: '5px 7px',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(lines.length ? lines : [{ description: '—' }]).map((line, i) => (
            <tr key={i}>
              <td style={{ border: `1px solid ${colors.line}`, padding: '5px 7px' }}>
                {line.description}
              </td>
              <td style={{ border: `1px solid ${colors.line}`, padding: '5px 7px', textAlign: 'right' }}>
                {line.qty || '—'}
              </td>
              <td style={{ border: `1px solid ${colors.line}`, padding: '5px 7px', textAlign: 'right' }}>
                {line.rate || '—'}
              </td>
              <td style={{ border: `1px solid ${colors.line}`, padding: '5px 7px', textAlign: 'right' }}>
                {line.amount || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, marginLeft: 'auto', width: 220, fontSize: 10 }}>
        {[
          ['Subtotal', subtotal],
          ['Tax', tax],
          [`Total${currencyCode ? ` (${currencyCode})` : ''}`, total],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.line}`,
              padding: '4px 0',
              fontWeight: label?.toString().startsWith('Total') ? 700 : 400,
            }}
          >
            <span>{label}</span>
            <span>{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
