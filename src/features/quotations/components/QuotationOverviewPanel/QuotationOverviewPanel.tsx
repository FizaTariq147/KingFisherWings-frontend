import { JOB_TYPE_LABELS } from '../../constants/quotation.constants';
import type { Quotation } from '../../types/quotation.types';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <dt className="text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="col-span-2 text-[var(--color-neutral-800)]">{value || '—'}</dd>
    </div>
  );
}

interface QuotationOverviewPanelProps {
  quotation: Quotation;
}

export function QuotationOverviewPanel({ quotation: q }: QuotationOverviewPanelProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] mb-2">
          Basic information
        </h3>
        <dl>
          <Row label="Quote no" value={quotationDisplayNumber(q)} />
          <Row label="Date" value={q.quotation_date || q.created_at?.slice(0, 10)} />
          <Row label="Valid until" value={q.valid_until} />
          <Row label="Status" value={q.status} />
          <Row label="Job type" value={JOB_TYPE_LABELS[q.job_type] ?? q.job_type} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] mb-2">
          Customer information
        </h3>
        <dl>
          <Row label="Customer" value={q.customer_name || q.customer_id} />
          <Row label="Contact" value={q.contact_name} />
          <Row label="Email" value={q.contact_email} />
          <Row label="Phone" value={q.contact_phone} />
          <Row label="Salesperson" value={q.salesperson_name || q.salesperson_id} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] mb-2">
          Shipment information
        </h3>
        <dl>
          <Row
            label="Origin"
            value={
              [q.origin_port_code, q.origin_port_name].filter(Boolean).join(' — ') ||
              q.origin_port_id
            }
          />
          <Row
            label="Destination"
            value={
              [q.dest_port_code, q.dest_port_name].filter(Boolean).join(' — ') || q.dest_port_id
            }
          />
          <Row label="Incoterm" value={q.incoterm} />
          <Row label="Commodity" value={q.commodity} />
          <Row label="HS code" value={q.hs_code} />
          <Row label="Pieces" value={q.pieces} />
          <Row label="Gross weight" value={q.gross_weight} />
          <Row label="Volume CBM" value={q.volume_cbm} />
          <Row label="DG" value={q.is_dg ? `Yes${q.dg_class ? ` (${q.dg_class})` : ''}` : 'No'} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] mb-2">
          Additional information
        </h3>
        <dl>
          <Row label="Remarks" value={q.remarks} />
          <Row label="Internal notes" value={q.internal_notes} />
          <Row label="Special requirements" value={q.special_requirements} />
          <Row label="Routing notes" value={q.routing_notes} />
        </dl>
      </section>
    </div>
  );
}
