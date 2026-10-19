import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { jobService } from '../services/job.service';
import type {
  JobInvoiceFormLineDto,
  JobInvoiceFormPreview,
  JobInvoiceFormSaveDto,
} from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export type JobInvoiceFormKind = 'sale' | 'purchase';

type Props = {
  open: boolean;
  onClose: () => void;
  jobId: string;
  kind: JobInvoiceFormKind;
  chargeIds?: string[];
  onSaved?: () => void;
  /** Optional PDF (purchase / vendor upload). */
  allowPdf?: boolean;
};

function asSaveDto(raw: JobInvoiceFormPreview | null): JobInvoiceFormSaveDto {
  if (!raw || typeof raw !== 'object') return { lines: [], exchange_rate: 1 };
  const lines = Array.isArray(raw.lines)
    ? raw.lines.map((line) => ({
        job_charge_id: line.job_charge_id,
        charge_code_id: line.charge_code_id,
        description: line.description ?? '',
        shipment_no: line.shipment_no ?? '',
        unit: line.unit ?? '',
        quantity: Number(line.quantity ?? 1) || 1,
        currency_code: line.currency_code ?? raw.currency_code ?? 'AED',
        exchange_rate: Number(line.exchange_rate ?? raw.exchange_rate ?? 1) || 1,
        dr_cr: line.dr_cr ?? 'CR',
        amount: Number(line.amount ?? 0) || 0,
        fcy_amount: line.fcy_amount != null ? Number(line.fcy_amount) : undefined,
        tax_rate_id: line.tax_rate_id,
        pp_cc: line.pp_cc,
      }))
    : [];
  return {
    charge_ids: Array.isArray(raw.charge_ids) ? raw.charge_ids.map(String) : undefined,
    organization_id: raw.organization_id ? String(raw.organization_id) : undefined,
    party_id: raw.party_id ? String(raw.party_id) : undefined,
    branch_id: raw.branch_id ? String(raw.branch_id) : undefined,
    company_id: raw.company_id ? String(raw.company_id) : undefined,
    voucher_type:
      raw.voucher_type ||
      (raw as { voucherType?: string }).voucherType ||
      undefined,
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
    vendor_quote_id: raw.vendor_quote_id ? String(raw.vendor_quote_id) : undefined,
    lines,
  };
}

function updateLine(
  lines: JobInvoiceFormLineDto[],
  index: number,
  patch: Partial<JobInvoiceFormLineDto>,
): JobInvoiceFormLineDto[] {
  return lines.map((line, i) => (i === index ? { ...line, ...patch, amount: Number(patch.amount ?? line.amount) || 0 } : line));
}

export function JobInvoiceFormModal({
  open,
  onClose,
  jobId,
  kind,
  chargeIds = [],
  onSaved,
  allowPdf,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobInvoiceFormSaveDto>(() => asSaveDto(null));
  const [pdf, setPdf] = useState<File | null>(null);
  const showPdf = allowPdf ?? kind === 'purchase';

  useEffect(() => {
    if (!open || !jobId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdf(null);
    void (async () => {
      try {
        const preview =
          kind === 'sale'
            ? await jobService.getSaleInvoiceForm(jobId, chargeIds)
            : await jobService.getPurchaseInvoiceForm(jobId, chargeIds);
        if (cancelled) return;
        const next = asSaveDto(preview);
        if (!next.voucher_type) {
          next.voucher_type = kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE';
        }
        setForm(next);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setForm(
            asSaveDto({
              voucher_type: kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE',
              currency_code: 'AED',
              exchange_rate: 1,
              lines: [],
            }),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, jobId, kind, chargeIds.join(',')]);

  const patch = (partial: Partial<JobInvoiceFormSaveDto>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dto: JobInvoiceFormSaveDto = {
        ...form,
        lines: (form.lines ?? []).filter((l) => Number(l.amount) >= 0),
      };
      if (kind === 'sale') {
        await jobService.createSaleInvoiceFromJob(jobId, dto, pdf);
      } else {
        await jobService.createPurchaseInvoiceFromJob(jobId, dto, pdf);
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
            disabled={loading || saving}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save as DRAFT'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Prefills from {kind === 'sale' ? 'sale charges → quotation' : 'vendor offer → costing'}{' '}
          when available; opens empty otherwise. Saves as DRAFT with display status CREATE.
        </p>
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
        ) : null}
        {loading ? (
          <p className="text-sm text-[var(--color-neutral-500)]">Loading form…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Organization / party id"
                value={form.organization_id || form.party_id || ''}
                onChange={(e) =>
                  patch({
                    organization_id: e.target.value.trim() || undefined,
                    party_id: e.target.value.trim() || undefined,
                  })
                }
                placeholder="Optional — not required to open"
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
                              value={line.dr_cr || 'CR'}
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
