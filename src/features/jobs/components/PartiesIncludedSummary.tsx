import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { erpTable } from '@/lib/erpTypography';
import type { CostingPartyIncluded } from '../utils/normalizeCostingParties';

function money(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

interface PartiesIncludedSummaryProps {
  parties: CostingPartyIncluded[];
  /** When true, table is derived client-side (API omitted parties_included). */
  derived?: boolean;
}

/**
 * Costing rollup below the charge grid — “these parties are included in this job/shipment”.
 */
export function PartiesIncludedSummary({
  parties,
  derived = false,
}: PartiesIncludedSummaryProps) {
  if (!parties.length) return null;

  return (
    <Card
      padding="none"
      className="kf-section-enter border-[var(--fresa-border,#C9D3DF)] shadow-none overflow-hidden"
    >
      <CardHeader className="mb-0 border-b border-[var(--fresa-border,#C9D3DF)] bg-white px-4 py-2.5">
        <CardTitle className="flex items-center gap-2 text-[#0f172a]">
          <Users className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
          Parties included
        </CardTitle>
        <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
          Sale and cost parties on this costing
          {derived ? ' (from charge lines)' : ''}.
        </p>
      </CardHeader>
      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr>
              <th className={erpTable.th}>Party</th>
              <th className={erpTable.th}>Role</th>
              <th className={erpTable.th}>Type</th>
              <th className={`${erpTable.th} text-right`}>Sale</th>
              <th className={`${erpTable.th} text-right`}>Cost</th>
              <th className={`${erpTable.th} text-right`}>Lines</th>
              <th className={erpTable.th}>Currencies</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => {
              const ccy =
                p.currency_breakdown
                  ?.map((b) => {
                    const bits = [b.currency];
                    if (b.sale_total != null) bits.push(`S ${money(b.sale_total)}`);
                    if (b.cost_total != null) bits.push(`C ${money(b.cost_total)}`);
                    return bits.join(' ');
                  })
                  .join(' · ') || '—';
              return (
                <tr key={`${p.role ?? ''}:${p.party_id}`} className={erpTable.row}>
                  <td className={`${erpTable.td} font-medium`}>{p.party_name}</td>
                  <td className={erpTable.td}>{p.role || '—'}</td>
                  <td className={erpTable.td}>{p.party_type || '—'}</td>
                  <td className={`${erpTable.td} text-right tabular-nums`}>
                    {money(p.sale_total)}
                  </td>
                  <td className={`${erpTable.td} text-right tabular-nums`}>
                    {money(p.cost_total)}
                  </td>
                  <td className={`${erpTable.td} text-right tabular-nums`}>
                    {p.line_count}
                  </td>
                  <td className={`${erpTable.td} text-[12px] text-[var(--color-neutral-600)]`}>
                    {ccy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
