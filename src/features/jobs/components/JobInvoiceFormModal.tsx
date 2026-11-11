import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { invoiceKeys } from '@/features/invoices/hooks/useInvoices';
import { purchaseInvoiceKeys } from '@/features/purchaseInvoices/hooks/usePurchaseInvoices';
import { PartySearchSelect } from '@/features/shared/entity-search';
import { isUuid } from '@/lib/isUuid';
import { jobService } from '../services/job.service';
import type {
  JobInvoiceFormLineDto,
  JobInvoiceFormPreview,
  JobInvoiceFormSaveDto,
} from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareJobInvoiceFormSave } from '../utils/prepareJobInvoiceFormSave';

export type JobInvoiceFormKind = 'sale' | 'purchase';
export type JobInvoiceFormSource = 'job' | 'quotation' | 'auto';

type Props = {
  open: boolean;
  onClose: () => void;
  jobId: string;
  kind: JobInvoiceFormKind;
  chargeIds?: string[];
  onSaved?: () => void;
  /** Optional PDF (purchase / vendor upload). */
  allowPdf?: boolean;
  /**
   * Sale form amount source. Costing Sales button should pass `job`.
   * Only use `auto` (or omit) when there is no explicit user choice.
   */
  source?: JobInvoiceFormSource;
};

function asSaveDto(
  raw: JobInvoiceFormPreview | null,
  source?: JobInvoiceFormSource,
  kind: JobInvoiceFormKind = 'sale',
): JobInvoiceFormSaveDto {
  if (!raw || typeof raw !== 'object') {
    return {
      lines: [],
      exchange_rate: 1,
      voucher_type: kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE',
      ...(kind === 'sale' && source ? { source } : {}),
    };
  }
  const defaultDrCr = kind === 'purchase' ? 'DR' : 'CR';
  const lines = Array.isArray(raw.lines)
    ? raw.lines.map((line) => ({
        job_charge_id: isUuid(String(line.job_charge_id ?? '').trim())
          ? String(line.job_charge_id).trim()
          : undefined,
        charge_code_id: isUuid(String(line.charge_code_id ?? '').trim())
          ? String(line.charge_code_id).trim()
          : undefined,
        description: line.description ?? '',
        shipment_no: line.shipment_no ?? '',
        unit: line.unit ?? '',
        quantity: Number(line.quantity ?? 1) || 1,
        currency_code: line.currency_code ?? raw.currency_code ?? 'AED',
        exchange_rate: Number(line.exchange_rate ?? raw.exchange_rate ?? 1) || 1,
        dr_cr:
          line.dr_cr === 'DR' || line.dr_cr === 'CR' ? line.dr_cr : defaultDrCr,
        amount: Number(line.amount ?? 0) || 0,
        fcy_amount: line.fcy_amount != null ? Number(line.fcy_amount) : undefined,
        tax_rate_id: isUuid(String(line.tax_rate_id ?? '').trim())
          ? String(line.tax_rate_id).trim()
          : undefined,
        pp_cc: line.pp_cc === 'PP' || line.pp_cc === 'CC' ? line.pp_cc : undefined,
      }))
    : [];
  const partyId = isUuid(String(raw.party_id ?? '').trim())
    ? String(raw.party_id).trim()
    : undefined;
  // Purchase: only use explicit cost_party_id — do not copy customer party_id as vendor.
  const costPartyId = isUuid(String(raw.cost_party_id ?? '').trim())
    ? String(raw.cost_party_id).trim()
    : kind === 'purchase'
      ? undefined
      : partyId;
  const resolvedSource =
    kind === 'sale'
      ? source ||
        (raw.source === 'job' || raw.source === 'quotation' || raw.source === 'auto'
          ? raw.source
          : undefined)
      : undefined;
  return {
    charge_ids: Array.isArray(raw.charge_ids)
      ? raw.charge_ids.map(String).filter((id) => isUuid(id.trim()))
      : undefined,
    organization_id: isUuid(String(raw.organization_id ?? '').trim())
      ? String(raw.organization_id).trim()
      : undefined,
    party_id: partyId,
    cost_party_id: costPartyId,
    source: resolvedSource,
    branch_id: isUuid(String(raw.branch_id ?? '').trim())
      ? String(raw.branch_id).trim()
      : undefined,
    company_id: isUuid(String(raw.company_id ?? '').trim())
      ? String(raw.company_id).trim()
      : undefined,
    voucher_type:
      raw.voucher_type ||
      (raw as { voucherType?: string }).voucherType ||
      (kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE'),
    v_date: String(raw.v_date ?? raw.invoice_date ?? '').slice(0, 10) || undefined,
    gl_date: String(raw.gl_date ?? '').slice(0, 10) || undefined,
    exchange_rate: Number(raw.exchange_rate ?? 1) || 1,
    bill_amount:
      raw.bill_amount != null
        ? Number(raw.bill_amount)
        : lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
    remarks: raw.remarks != null ? String(raw.remarks) : undefined,
    books: raw.books != null ? String(raw.books) : undefined,
    address: raw.address != null ? String(raw.address) : undefined,
    currency_code: String(raw.currency_code ?? 'AED')
      .trim()
      .toUpperCase()
      .slice(0, 3),
    narration: raw.narration != null ? String(raw.narration) : undefined,
    ref_no: raw.ref_no != null ? String(raw.ref_no) : undefined,
    vendor_quote_id: isUuid(String(raw.vendor_quote_id ?? '').trim())
      ? String(raw.vendor_quote_id).trim()
      : undefined,
    lines,
  };
}

function updateLine(
  lines: JobInvoiceFormLineDto[],
  index: number,
  patch: Partial<JobInvoiceFormLineDto>,
): JobInvoiceFormLineDto[] {
  return lines.map((line, i) =>
    i === index ? { ...line, ...patch, amount: Number(patch.amount ?? line.amount) || 0 } : line,
  );
}

function costingEntrySummary(entry: unknown): string[] {
  if (entry == null) return [];
  if (typeof entry === 'string') return [entry];
  if (Array.isArray(entry)) {
    return entry
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const rec = item as Record<string, unknown>;
          return (
            String(rec.description ?? rec.name ?? rec.field ?? rec.key ?? '').trim() ||
            JSON.stringify(item)
          );
        }
        return String(item);
      })
      .filter(Boolean)
      .slice(0, 12);
  }
  if (typeof entry === 'object') {
    const rec = entry as Record<string, unknown>;
    if (typeof rec.message === 'string' && rec.message.trim()) {
      return [rec.message.trim()];
    }
    if (Array.isArray(rec.fields)) {
      return costingEntrySummary(rec.fields);
    }
    if (Array.isArray(rec.required)) {
      return costingEntrySummary(rec.required);
    }
    return Object.keys(rec)
      .slice(0, 12)
      .map((key) => {
        const val = rec[key];
        if (val == null || typeof val === 'object') return key;
        return `${key}: ${String(val)}`;
      });
  }
  return [String(entry)];
}

export function JobInvoiceFormModal({
  open,
  onClose,
  jobId,
  kind,
  chargeIds = [],
  onSaved,
  allowPdf,
  source,
}: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobInvoiceFormSaveDto>(() =>
    asSaveDto(null, source, kind),
  );
  const [pdf, setPdf] = useState<File | null>(null);
  const [needsCosting, setNeedsCosting] = useState(false);
  const [costingEntry, setCostingEntry] = useState<unknown>(null);
  const showPdf = allowPdf ?? kind === 'purchase';
  const saleSource: JobInvoiceFormSource | undefined =
    kind === 'sale' ? source ?? undefined : undefined;

  useEffect(() => {
    if (!open || !jobId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdf(null);
    setNeedsCosting(false);
    setCostingEntry(null);
    void (async () => {
      try {
        const preview =
          kind === 'sale'
            ? await jobService.getSaleInvoiceForm(jobId, chargeIds, saleSource)
            : await jobService.getPurchaseInvoiceForm(jobId, chargeIds);
        if (cancelled) return;
        const next = asSaveDto(preview, saleSource, kind);
        if (!next.voucher_type) {
          next.voucher_type = kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE';
        }
        if (kind === 'sale' && saleSource) {
          next.source = saleSource;
        }
        setForm(next);
        setNeedsCosting(Boolean(preview.needs_costing));
        setCostingEntry(preview.costing_entry ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setForm(
            asSaveDto(
              {
                voucher_type: kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE',
                currency_code: 'AED',
                exchange_rate: 1,
                lines: [],
              },
              saleSource,
              kind,
            ),
          );
          setNeedsCosting(false);
          setCostingEntry(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, jobId, kind, chargeIds.join(','), saleSource]);

  const patch = (partial: Partial<JobInvoiceFormSaveDto>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (kind === 'purchase') {
        const vendorId = (form.cost_party_id || form.party_id || '').trim();
        if (!vendorId || !isUuid(vendorId)) {
          setError(
            'Vendor (cost_party_id) is required for purchase invoices. Pick a vendor party before saving.',
          );
          setSaving(false);
          return;
        }
      }
      if (kind === 'sale' && saleSource === 'job' && needsCosting) {
        setError(
          'Costing sale amounts are required before generating a job-source sales invoice. Open the Costing tab, enter sale amounts, then try again.',
        );
        setSaving(false);
        return;
      }

      const dto = prepareJobInvoiceFormSave(form, kind, saleSource);

      if (kind === 'sale') {
        await jobService.createSaleInvoiceFromJob(jobId, dto, pdf);
        void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      } else {
        await jobService.createPurchaseInvoiceFromJob(jobId, dto, pdf);
        void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.all });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const title =
    kind === 'sale' ? 'Sales invoice form' : 'Purchase / vendor invoice form';

  const helpCopy =
    kind === 'sale'
      ? saleSource === 'job'
        ? 'Prefills from job costing sale amounts only (no quotation fallback). Saves as DRAFT with display status CREATE.'
        : saleSource === 'quotation'
          ? 'Prefills from quotation revenue lines. Saves as DRAFT with display status CREATE.'
          : 'Prefills from sale charges → quotation when available (legacy auto). Saves as DRAFT with display status CREATE.'
      : 'Prefills from vendor offer → costing when available. Vendor (cost_party_id) is required before save. Saves as DRAFT with display status CREATE.';

  const costingHints = costingEntrySummary(costingEntry);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="full"
      footer={
        <>
          <Button type="button" variant="danger" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="create"
            disabled={loading || saving || (kind === 'sale' && saleSource === 'job' && needsCosting)}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save as DRAFT'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-neutral-500)]">{helpCopy}</p>
        {needsCosting ? (
          <div className="space-y-2 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2.5">
            <p className="text-sm font-medium text-amber-900">
              Costing required before generating from job
            </p>
            <p className="text-xs text-amber-800">
              This job has no costing sale amounts yet. Open the{' '}
              <span className="font-medium">Costing</span> tab (?tab=costing), enter sale amounts,
              then generate again with source=job. Quotation amounts are not used as a fallback.
            </p>
            {costingHints.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-900">Costing entry schema</p>
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-900">
                  {costingHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
        ) : null}
        {loading ? (
          <p className="text-sm text-[var(--color-neutral-500)]">Loading form…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <PartySearchSelect
                name={kind === 'purchase' ? 'cost_party_id' : 'party_id'}
                label={kind === 'purchase' ? 'Vendor' : 'Organization / party'}
                value={
                  kind === 'purchase'
                    ? form.cost_party_id || form.party_id || ''
                    : form.organization_id || form.party_id || ''
                }
                required={kind === 'purchase'}
                placeholder={
                  kind === 'purchase' ? 'Search vendor by name…' : 'Search party by name…'
                }
                onChange={(partyId) => {
                  const value = partyId.trim() || undefined;
                  if (kind === 'purchase') {
                    patch({
                      cost_party_id: value,
                      party_id: value,
                    });
                  } else {
                    patch({
                      organization_id: value,
                      party_id: value,
                    });
                  }
                }}
              />
              <Input
                label="Voucher type"
                value={form.voucher_type || ''}
                onChange={(e) => patch({ voucher_type: e.target.value })}
              />
              <Input
                label="V Date"
                type="date"
                value={form.v_date || ''}
                onChange={(e) => patch({ v_date: e.target.value || undefined })}
              />
              <Input
                label="GL Date"
                type="date"
                value={form.gl_date || ''}
                onChange={(e) => patch({ gl_date: e.target.value || undefined })}
              />
              <Input
                label="Currency"
                value={form.currency_code || ''}
                onChange={(e) =>
                  patch({
                    currency_code: e.target.value.trim().toUpperCase().slice(0, 3),
                  })
                }
              />
              <Input
                label="Exchange rate"
                type="number"
                value={form.exchange_rate != null ? String(form.exchange_rate) : '1'}
                onChange={(e) =>
                  patch({ exchange_rate: Number(e.target.value) || 1 })
                }
              />
              <Input
                label="Bill amount"
                type="number"
                value={form.bill_amount != null ? String(form.bill_amount) : ''}
                onChange={(e) =>
                  patch({
                    bill_amount: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
              <Input
                label="Books"
                value={form.books || ''}
                onChange={(e) => patch({ books: e.target.value || undefined })}
              />
              <Input
                label="Ref No / LPO"
                value={form.ref_no || ''}
                onChange={(e) => patch({ ref_no: e.target.value || undefined })}
              />
              <Input
                label="Remarks"
                value={form.remarks || ''}
                onChange={(e) => patch({ remarks: e.target.value || undefined })}
                className="sm:col-span-2"
              />
              <Input
                label="Narration"
                value={form.narration || ''}
                onChange={(e) => patch({ narration: e.target.value || undefined })}
                className="sm:col-span-2"
              />
              <Input
                label="Address"
                value={form.address || ''}
                onChange={(e) => patch({ address: e.target.value || undefined })}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>

            {showPdf ? (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                  Vendor invoice PDF (optional)
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="block w-full text-[13px] file:mr-2 file:rounded-sm file:border-0 file:bg-[var(--color-primary,#0A2942)] file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
                  onChange={(e) => {
                    const next = e.target.files?.[0] ?? null;
                    e.target.value = '';
                    setPdf(next);
                  }}
                />
                {pdf ? (
                  <span className="text-[12px] text-[var(--color-neutral-600)]">
                    Selected: {pdf.name}
                  </span>
                ) : null}
              </label>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                  Pricing lines
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    patch({
                      lines: [
                        ...(form.lines ?? []),
                        {
                          description: '',
                          quantity: 1,
                          amount: 0,
                          currency_code: form.currency_code || 'AED',
                          exchange_rate: form.exchange_rate || 1,
                          dr_cr: kind === 'sale' ? 'CR' : 'DR',
                        },
                      ],
                    })
                  }
                >
                  Add line
                </Button>
              </div>
              {(form.lines ?? []).length === 0 ? (
                <p className="text-xs text-[var(--color-neutral-400)]">
                  No lines yet — add manually or rely on backend prefill.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="bg-[var(--fresa-page-bg,#F4F6F9)] text-[var(--color-neutral-600)]">
                      <tr>
                        <th className="px-2 py-1.5 font-medium">Description</th>
                        <th className="px-2 py-1.5 font-medium">Qty</th>
                        <th className="px-2 py-1.5 font-medium">Amount</th>
                        <th className="px-2 py-1.5 font-medium">CCY</th>
                        <th className="px-2 py-1.5 font-medium">Dr/Cr</th>
                        <th className="px-2 py-1.5 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {(form.lines ?? []).map((line, index) => (
                        <tr
                          key={`${line.job_charge_id || 'line'}-${index}`}
                          className="border-t border-[var(--color-neutral-100)]"
                        >
                          <td className="px-2 py-1">
                            <input
                              className="h-8 w-full min-w-[160px] rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2"
                              value={line.description || ''}
                              onChange={(e) =>
                                patch({
                                  lines: updateLine(form.lines ?? [], index, {
                                    description: e.target.value,
                                  }),
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              className="h-8 w-20 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2"
                              value={line.quantity ?? 1}
                              onChange={(e) =>
                                patch({
                                  lines: updateLine(form.lines ?? [], index, {
                                    quantity: Number(e.target.value) || 0,
                                  }),
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              className="h-8 w-28 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2"
                              value={line.amount ?? 0}
                              onChange={(e) =>
                                patch({
                                  lines: updateLine(form.lines ?? [], index, {
                                    amount: Number(e.target.value) || 0,
                                  }),
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              className="h-8 w-16 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2 uppercase"
                              value={line.currency_code || ''}
                              onChange={(e) =>
                                patch({
                                  lines: updateLine(form.lines ?? [], index, {
                                    currency_code: e.target.value
                                      .trim()
                                      .toUpperCase()
                                      .slice(0, 3),
                                  }),
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-1">
                            <select
                              className="h-8 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-1"
                              value={
                                line.dr_cr || (kind === 'purchase' ? 'DR' : 'CR')
                              }
                              onChange={(e) =>
                                patch({
                                  lines: updateLine(form.lines ?? [], index, {
                                    dr_cr: e.target.value,
                                  }),
                                })
                              }
                            >
                              <option value="CR">CR</option>
                              <option value="DR">DR</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <button
                              type="button"
                              className="text-[var(--color-danger-600)] underline"
                              onClick={() =>
                                patch({
                                  lines: (form.lines ?? []).filter((_, i) => i !== index),
                                })
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
