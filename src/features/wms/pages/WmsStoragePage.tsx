import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsCurrencyField } from '../components/WmsCurrencyField';
import { WmsPageHeader } from '../components/WmsPageHeader';
import {
  useWmsPartyOptions,
  useWmsWarehouseOptions,
  WmsSelect,
} from '../components/WmsFormHelpers';
import {
  WmsFormAlert,
  WmsFormCard,
  WmsFormFooter,
  WmsFormGrid,
  WmsFormSpan2,
} from '../components/WmsFormLayout';
import { useCalculateWmsStorage, useInvoiceWmsStorage } from '../hooks/useWms';
import { calculateStorageSchema, invoiceStorageSchema } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { unwrapList } from '../utils/normalizeWms';

function chargesFromCalculateResult(result: unknown): Array<Record<string, unknown>> {
  const { items } = unwrapList(result);
  return items.filter((row): row is Record<string, unknown> => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    return isUuid(String((row as Record<string, unknown>).id ?? ''));
  });
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return '';
}

function pickNum(row: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = row[key];
    if (v == null || v === '') continue;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

function formatAmount(value: number | null, currency: string): string {
  if (value == null) return '—';
  const code = currency || 'AED';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

function shortId(id: string): string {
  if (!id) return '—';
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function labelFromOptions(
  options: Array<{ value: string; label: string }>,
  id: string,
): string {
  if (!id) return '—';
  return options.find((o) => o.value === id)?.label || shortId(id);
}

export default function WmsStoragePage() {
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: partyOptions } = useWmsPartyOptions();
  const calculateMutation = useCalculateWmsStorage();
  const invoiceMutation = useInvoiceWmsStorage();
  const calcValidation = useInlineValidation();
  const invoiceValidation = useInlineValidation();

  const [warehouseId, setWarehouseId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [freeDays, setFreeDays] = useState('');
  const [ratePerDay, setRatePerDay] = useState('');
  const [overdueRatePerDay, setOverdueRatePerDay] = useState('');
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [didCalculate, setDidCalculate] = useState(false);
  const [openCharges, setOpenCharges] = useState<Array<Record<string, unknown>>>([]);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const partyRequiredOptions = partyOptions.map((o) =>
    o.value === '' ? { ...o, label: 'Select party…' } : o,
  );

  const calcValues = (
    patch: Partial<{
      warehouse_id: string;
      party_id: string;
      period_from: string;
      period_to: string;
      free_days: string;
      rate_per_day: string;
      overdue_rate_per_day: string;
      currency_code: string;
    }> = {},
  ) => ({
    warehouse_id: patch.warehouse_id ?? warehouseId,
    party_id: patch.party_id ?? partyId,
    period_from: patch.period_from ?? periodFrom,
    period_to: patch.period_to ?? periodTo,
    free_days: patch.free_days ?? freeDays,
    rate_per_day: patch.rate_per_day ?? ratePerDay,
    overdue_rate_per_day: patch.overdue_rate_per_day ?? overdueRatePerDay,
    currency_code: patch.currency_code ?? currencyCode,
  });

  const resetCalc = () => {
    setWarehouseId('');
    setPartyId('');
    setPeriodFrom('');
    setPeriodTo('');
    setFreeDays('');
    setRatePerDay('');
    setOverdueRatePerDay('');
    setCurrencyCode('AED');
    setDidCalculate(false);
    setOpenCharges([]);
    setSelectedChargeIds([]);
    setSuccess(null);
    calcValidation.clearErrors();
    invoiceValidation.clearErrors();
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    calcValidation.clearErrors();
    invoiceValidation.clearErrors();
    setSuccess(null);
    setDidCalculate(false);
    setOpenCharges([]);
    setSelectedChargeIds([]);
    const parsed = calcValidation.validate(calculateStorageSchema, calcValues());
    if (!parsed) return;
    try {
      const result = await calculateMutation.mutateAsync(parsed);
      const charges = chargesFromCalculateResult(result);
      setOpenCharges(charges);
      setDidCalculate(true);
      if (!charges.length) {
        calcValidation.setFormError(
          'No billable lots for this party/warehouse/period. On Stock → Lot aging, Party must match (not null). If the GRN has a party but lots show null, backend did not stamp party_id on post/unload — existing lots cannot be fixed from this page.',
        );
      }
    } catch (err) {
      calcValidation.setFormError(getErrorMessage(err));
    }
  };

  const handleInvoice = async () => {
    invoiceValidation.clearErrors();
    setSuccess(null);
    const parsed = invoiceValidation.validate(invoiceStorageSchema, {
      charge_ids: selectedChargeIds,
    });
    if (!parsed) return;
    try {
      await invoiceMutation.mutateAsync(parsed);
      setSuccess('Draft invoice created. Post it under Finance → Invoices for the customer portal.');
      setOpenCharges((prev) => prev.filter((c) => !selectedChargeIds.includes(String(c.id))));
      setSelectedChargeIds([]);
    } catch (err) {
      invoiceValidation.setFormError(getErrorMessage(err));
    }
  };

  const toggleCharge = (id: string) => {
    const next = selectedChargeIds.includes(id)
      ? selectedChargeIds.filter((x) => x !== id)
      : [...selectedChargeIds, id];
    setSelectedChargeIds(next);
    invoiceValidation.revalidate(invoiceStorageSchema, { charge_ids: next });
  };

  const selectAll = () => {
    const ids = openCharges.map((c) => String(c.id)).filter(Boolean);
    setSelectedChargeIds(ids);
    invoiceValidation.revalidate(invoiceStorageSchema, { charge_ids: ids });
  };

  const clearSelection = () => {
    setSelectedChargeIds([]);
    invoiceValidation.revalidate(invoiceStorageSchema, { charge_ids: [] });
  };

  const totalSelected = useMemo(() => {
    let sum = 0;
    let currency = currencyCode || 'AED';
    for (const charge of openCharges) {
      const id = String(charge.id ?? '');
      if (!selectedChargeIds.includes(id)) continue;
      const amount = pickNum(charge, 'amount', 'total_amount', 'totalAmount');
      if (amount != null) sum += amount;
      const ccy = pickStr(charge, 'currency_code', 'currencyCode');
      if (ccy) currency = ccy;
    }
    return { sum, currency };
  }, [openCharges, selectedChargeIds, currencyCode]);

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS Storage"
        description="Calculate storage charges and create draft invoices."
      />

      <div className="mx-auto max-w-5xl space-y-4">
        <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
          Needs posted inbound stock whose lots have a <strong>party</strong> (see{' '}
          <Link className="underline" to={`${WMS_ROUTE_PREFIX}/stock`}>
            Stock → Lot aging
          </Link>
          ). Demo rates: free days <code>7</code>, rate <code>85</code>, overdue <code>120</code>{' '}
          AED for <code>2026-09-26</code>–<code>2026-10-10</code>.
        </p>

        <form className="space-y-4" onSubmit={handleCalculate} noValidate>
          <WmsFormAlert message={calcValidation.formError} />

          <WmsFormCard title="Calculate storage" eyebrow="Storage billing">
            <WmsFormGrid>
              <WmsSelect
                label="Warehouse"
                value={warehouseId}
                onChange={(v) => {
                  setWarehouseId(v);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ warehouse_id: v }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'warehouse_id')
                }
                options={warehouseOptions}
                required
                error={calcValidation.fieldError('warehouse_id')}
              />
              <WmsSelect
                label="Party"
                value={partyId}
                onChange={(v) => {
                  setPartyId(v);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ party_id: v }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'party_id')
                }
                options={partyRequiredOptions}
                required
                error={calcValidation.fieldError('party_id')}
              />
              <Input
                label="Period from"
                type="date"
                value={periodFrom}
                error={calcValidation.fieldError('period_from')}
                onChange={(e) => {
                  const next = e.target.value;
                  setPeriodFrom(next);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ period_from: next }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'period_from')
                }
                required
              />
              <Input
                label="Period to"
                type="date"
                value={periodTo}
                error={calcValidation.fieldError('period_to')}
                onChange={(e) => {
                  const next = e.target.value;
                  setPeriodTo(next);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ period_to: next }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'period_to')
                }
                required
              />
              <Input
                label="Free days"
                type="number"
                min={0}
                value={freeDays}
                error={calcValidation.fieldError('free_days')}
                onChange={(e) => {
                  const next = e.target.value;
                  setFreeDays(next);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ free_days: next }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'free_days')
                }
              />
              <Input
                label="Rate per day"
                type="number"
                min={0}
                step="0.01"
                value={ratePerDay}
                error={calcValidation.fieldError('rate_per_day')}
                onChange={(e) => {
                  const next = e.target.value;
                  setRatePerDay(next);
                  calcValidation.revalidate(calculateStorageSchema, calcValues({ rate_per_day: next }));
                }}
                onBlur={() =>
                  calcValidation.validatePath(calculateStorageSchema, calcValues(), 'rate_per_day')
                }
              />
              <Input
                label="Overdue rate per day"
                type="number"
                min={0}
                step="0.01"
                hint="Extra rate after free/paid days (NOT_COLLECTED accrual)"
                value={overdueRatePerDay}
                error={calcValidation.fieldError('overdue_rate_per_day')}
                onChange={(e) => {
                  const next = e.target.value;
                  setOverdueRatePerDay(next);
                  calcValidation.revalidate(
                    calculateStorageSchema,
                    calcValues({ overdue_rate_per_day: next }),
                  );
                }}
                onBlur={() =>
                  calcValidation.validatePath(
                    calculateStorageSchema,
                    calcValues(),
                    'overdue_rate_per_day',
                  )
                }
              />
              <WmsFormSpan2>
                <WmsCurrencyField
                  label="Currency"
                  value={currencyCode}
                  onChange={(v) => {
                    setCurrencyCode(v);
                    calcValidation.revalidate(calculateStorageSchema, calcValues({ currency_code: v }));
                  }}
                  error={calcValidation.fieldError('currency_code')}
                />
              </WmsFormSpan2>
            </WmsFormGrid>
          </WmsFormCard>

          <WmsFormFooter
            onCancel={resetCalc}
            submitLabel="Calculate"
            isSubmitting={calculateMutation.isPending}
          />
        </form>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>
              {didCalculate
                ? `Calculation result (${openCharges.length})`
                : 'Calculation result'}
            </CardTitle>
            {openCharges.length ? (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={selectAll}>
                  Select all
                </Button>
                <Button type="button" variant="secondary" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            ) : null}
          </CardHeader>

          <div className="space-y-4 p-4 pt-0">
            {!didCalculate ? (
              <p className="text-sm text-[var(--color-neutral-400)]">
                Run Calculate to see OPEN storage charges here.
              </p>
            ) : !openCharges.length ? (
              <div className="space-y-2 text-sm text-[var(--color-neutral-500)]">
                <p>No OPEN charges for this selection.</p>
                <p>
                  <Link
                    to={`${WMS_ROUTE_PREFIX}/stock`}
                    className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
                  >
                    Open Stock → Lot aging
                  </Link>{' '}
                  and confirm Party is set (not null).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--color-neutral-50)] text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
                    <tr>
                      <th className="px-3 py-2 font-medium"> </th>
                      <th className="px-3 py-2 font-medium">Kind</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Period</th>
                      <th className="px-3 py-2 font-medium">Days</th>
                      <th className="px-3 py-2 font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Rate/day</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Lot</th>
                      <th className="px-3 py-2 font-medium">Party</th>
                      <th className="px-3 py-2 font-medium">Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openCharges.map((charge, idx) => {
                      const id = String(charge.id ?? idx);
                      const kind = pickStr(charge, 'charge_kind', 'chargeKind') || '—';
                      const status = pickStr(charge, 'status') || '—';
                      const from = formatDate(pickStr(charge, 'period_from', 'periodFrom'));
                      const to = formatDate(pickStr(charge, 'period_to', 'periodTo'));
                      const free = pickNum(charge, 'free_days', 'freeDays');
                      const chargeable = pickNum(charge, 'chargeable_days', 'chargeableDays');
                      const extra = pickNum(charge, 'extra_days', 'extraDays');
                      const qty = pickNum(charge, 'quantity', 'qty');
                      const rate = pickNum(charge, 'rate_per_day', 'ratePerDay');
                      const overdueRate = pickNum(
                        charge,
                        'overdue_rate_per_day',
                        'overdueRatePerDay',
                      );
                      const amount = pickNum(charge, 'amount', 'total_amount', 'totalAmount');
                      const ccy =
                        pickStr(charge, 'currency_code', 'currencyCode') || currencyCode || 'AED';
                      const lotId = pickStr(charge, 'lot_id', 'lotId');
                      const rowParty = pickStr(charge, 'party_id', 'partyId') || partyId;
                      const rowWh =
                        pickStr(charge, 'warehouse_id', 'warehouseId') || warehouseId;
                      const daysLabel = [
                        free != null ? `free ${free}` : null,
                        chargeable != null ? `bill ${chargeable}` : null,
                        extra != null && extra > 0 ? `extra ${extra}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ');

                      return (
                        <tr
                          key={id}
                          className="border-t border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
                        >
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedChargeIds.includes(id)}
                              onChange={() => toggleCharge(id)}
                              aria-label={`Select charge ${shortId(id)}`}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">{kind}</td>
                          <td className="px-3 py-2">{status}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {from} → {to}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{daysLabel || '—'}</td>
                          <td className="px-3 py-2">{qty != null ? String(qty) : '—'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {rate != null ? formatAmount(rate, ccy) : '—'}
                            {overdueRate != null ? (
                              <span className="block text-xs text-[var(--color-neutral-500)]">
                                overdue {formatAmount(overdueRate, ccy)}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 font-medium whitespace-nowrap">
                            {formatAmount(amount, ccy)}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs" title={lotId}>
                            {shortId(lotId)}
                          </td>
                          <td className="px-3 py-2" title={rowParty}>
                            {labelFromOptions(partyOptions, rowParty)}
                          </td>
                          <td className="px-3 py-2" title={rowWh}>
                            {labelFromOptions(warehouseOptions, rowWh)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {success ? <p className="text-sm text-[var(--color-success-600)]">{success}</p> : null}
            <WmsFormAlert
              message={invoiceValidation.formError || invoiceValidation.fieldError('charge_ids')}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-neutral-600)]">
                {selectedChargeIds.length
                  ? `Selected ${selectedChargeIds.length} · ${formatAmount(totalSelected.sum, totalSelected.currency)}`
                  : 'Select charges to invoice'}
              </p>
              <Button
                type="button"
                onClick={handleInvoice}
                disabled={invoiceMutation.isPending || !selectedChargeIds.length}
              >
                {invoiceMutation.isPending ? 'Saving…' : 'Invoice selected'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
