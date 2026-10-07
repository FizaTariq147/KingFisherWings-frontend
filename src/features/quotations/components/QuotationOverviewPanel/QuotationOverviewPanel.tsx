import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useUsers } from '@/features/users/hooks/useUsers';
import { isUuid } from '@/lib/isUuid';
import { useMemo } from 'react';
import { JOB_TYPE_LABELS } from '../../constants/quotation.constants';
import { useQuotationResolvedLabels } from '../../hooks/useQuotationResolvedLabels';
import type { Quotation } from '../../types/quotation.types';
import { formatQuotationRemarks } from '../../utils/formatQuotationRemarks';
import { quotationDisplayNumber } from '../../utils/normalizeQuotation';
import { quotationIdNameLabel } from '../../utils/quotationDisplay';

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
  const { customerLabel, originLabel, destinationLabel } = useQuotationResolvedLabels(q);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: usersResult } = useUsers({
    tenantId: '',
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departments) {
      const id = String(d.id ?? '');
      if (!isUuid(id)) continue;
      const label = String(d.name ?? d.code ?? '').trim();
      if (label && !isUuid(label)) map.set(id, label);
    }
    return map;
  }, [departments]);
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of usersResult?.users ?? []) {
      if (!isUuid(u.id)) continue;
      const label =
        u.full_name?.trim() ||
        [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
        u.email?.trim() ||
        '';
      if (label && !isUuid(label)) map.set(u.id, label);
    }
    return map;
  }, [usersResult?.users]);

  const remarks = formatQuotationRemarks(q.remarks, {
    contactName: q.contact_name,
    createdByName: q.created_by_name,
  });

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
          <Row label="Customer" value={customerLabel} />
          <Row label="Contact" value={q.contact_name} />
          <Row label="Email" value={q.contact_email} />
          <Row label="Phone" value={q.contact_phone} />
          <Row
            label="Department"
            value={quotationIdNameLabel(q.department_name, q.department_id, departmentMap)}
          />
          <Row
            label="Salesperson"
            value={quotationIdNameLabel(q.salesperson_name, q.salesperson_id, userMap)}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)] mb-2">
          Shipment information
        </h3>
        <dl>
          <Row label="Origin" value={originLabel} />
          <Row label="Destination" value={destinationLabel} />
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
          <Row label="Remarks" value={remarks} />
          <Row label="Internal notes" value={q.internal_notes} />
          <Row label="Special requirements" value={q.special_requirements} />
          <Row label="Routing notes" value={q.routing_notes} />
        </dl>
      </section>
    </div>
  );
}
