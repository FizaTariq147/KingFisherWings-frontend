import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX, WMS_STORAGE_CHARGE_KINDS, WMS_STORAGE_CHARGE_STATUSES } from '../api/wms.api';
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
import {
  useCalculateWmsStorage,
  useInvoiceWmsStorage,
  useWmsStorageCharges,
} from '../hooks/useWms';
import { calculateStorageSchema, invoiceStorageSchema } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

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
  const [chargePartyId, setChargePartyId] = useState('');
  const [chargeStatus, setChargeStatus] = useState<string>('OPEN');
  const [chargeKind, setChargeKind] = useState<string>('STORAGE');
  const [calcResult, setCalcResult] = useState<unknown>(null);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const chargesParams = {
    party_id: chargePartyId.trim(),
    status: chargeStatus.trim(),
    charge_kind: chargeKind.trim(),
  };
  const chargesEnabled =
    isUuid(chargesParams.party_id) &&
    Boolean(chargesParams.status) &&
    Boolean(chargesParams.charge_kind);
  const chargesQuery = useWmsStorageCharges(chargesParams, chargesEnabled);

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
    setCalcResult(null);
    calcValidation.clearErrors();
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    calcValidation.clearErrors();
    setCalcResult(null);
    const parsed = calcValidation.validate(calculateStorageSchema, calcValues());
    if (!parsed) return;
    try {
      const result = await calculateMutation.mutateAsync(parsed);
      setCalcResult(result);
      setChargePartyId(parsed.party_id);
      setChargeStatus('OPEN');
      setSelectedChargeIds([]);
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
      setSuccess('Draft invoice created.');
      setSelectedChargeIds([]);
      void chargesQuery.refetch();
    } catch (err) {
      invoiceValidation.setFormError(getErrorMessage(err));
    }
  };

  const charges = (chargesQuery.data ?? []) as Array<Record<string, unknown>>;

  const toggleCharge = (id: string) => {
    const next = selectedChargeIds.includes(id)
      ? selectedChargeIds.filter((x) => x !== id)
      : [...selectedChargeIds, id];
    setSelectedChargeIds(next);
    invoiceValidation.revalidate(invoiceStorageSchema, { charge_ids: next });
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS Storage"
        description="Calculate storage charges and create draft invoices."
      />

      <div className="mx-auto max-w-3xl space-y-4">
        <form className="space-y-4" onSubmit={handleCalculate} noValidate>
          <WmsFormAlert message={calcValidation.formError} />

          <WmsFormCard title="Calculate storage">
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

        {calcResult ? (
          <Card>
            <CardHeader>
              <CardTitle>Calculation result</CardTitle>
            </CardHeader>
            <pre className="overflow-x-auto p-4 pt-0 text-xs">
              {JSON.stringify(calcResult, null, 2)}
            </pre>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Storage charges</CardTitle>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void chargesQuery.refetch()}
            disabled={!chargesEnabled || chargesQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${chargesQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>

        <div className="space-y-4 p-4 pt-0">
          <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
            <WmsSelect
              label="Party"
              value={chargePartyId}
              onChange={(v) => {
                setChargePartyId(v);
                setSelectedChargeIds([]);
              }}
              options={partyRequiredOptions}
              required
            />
            <WmsSelect
              label="Status"
              value={chargeStatus}
              onChange={(v) => {
                setChargeStatus(v);
                setSelectedChargeIds([]);
              }}
              options={WMS_STORAGE_CHARGE_STATUSES.map((s) => ({ value: s, label: s }))}
              required
            />
            <WmsSelect
              label="Charge kind"
              value={chargeKind}
              onChange={(v) => {
                setChargeKind(v);
                setSelectedChargeIds([]);
              }}
              options={WMS_STORAGE_CHARGE_KINDS.map((s) => ({ value: s, label: s }))}
              required
            />
          </div>

          {!chargesEnabled ? (
            <p className="text-sm text-[var(--color-neutral-400)]">
              Select party, status, and charge kind (STORAGE / OVERDUE) to load charges.
            </p>
          ) : chargesQuery.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading charges…</p>
          ) : chargesQuery.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(chargesQuery.error)}
            </p>
          ) : !charges.length ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No storage charges.</p>
          ) : (
            <div className="space-y-2">
              {charges.map((charge, idx) => {
                const id = String(charge.id ?? idx);
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-start gap-3 rounded border p-3 text-sm hover:bg-[var(--color-neutral-50)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChargeIds.includes(id)}
                      onChange={() => toggleCharge(id)}
                      className="mt-1"
                      disabled={chargeStatus !== 'OPEN'}
                    />
                    <pre className="flex-1 overflow-x-auto text-xs">{JSON.stringify(charge, null, 2)}</pre>
                  </label>
                );
              })}
            </div>
          )}

          {success ? <p className="text-sm text-[var(--color-success-600)]">{success}</p> : null}
          <WmsFormAlert
            message={invoiceValidation.formError || invoiceValidation.fieldError('charge_ids')}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleInvoice}
              disabled={
                invoiceMutation.isPending || !selectedChargeIds.length || chargeStatus !== 'OPEN'
              }
            >
              {invoiceMutation.isPending ? 'Saving…' : 'Invoice selected'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
