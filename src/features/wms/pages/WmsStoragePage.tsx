import { useState } from 'react';
import { Calculator, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX, WMS_STORAGE_CHARGE_STATUSES } from '../api/wms.api';
import { WmsCurrencyField } from '../components/WmsCurrencyField';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useWmsWarehouseOptions, WmsSelect } from '../components/WmsFormHelpers';
import {
  useCalculateWmsStorage,
  useInvoiceWmsStorage,
  useWmsStorageCharges,
} from '../hooks/useWms';
import { calculateStorageSchema, invoiceStorageSchema } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsStoragePage() {
  const { options: warehouseOptions } = useWmsWarehouseOptions();
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
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [chargePartyId, setChargePartyId] = useState('');
  const [chargeStatus, setChargeStatus] = useState<string>('OPEN');
  const [calcResult, setCalcResult] = useState<unknown>(null);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const chargesParams = {
    party_id: chargePartyId.trim(),
    status: chargeStatus.trim(),
  };
  const chargesEnabled = isUuid(chargesParams.party_id) && Boolean(chargesParams.status);
  const chargesQuery = useWmsStorageCharges(chargesParams, chargesEnabled);

  const calcValues = (
    patch: Partial<{
      warehouse_id: string;
      party_id: string;
      period_from: string;
      period_to: string;
      free_days: string;
      rate_per_day: string;
      currency_code: string;
    }> = {},
  ) => ({
    warehouse_id: patch.warehouse_id ?? warehouseId,
    party_id: patch.party_id ?? partyId,
    period_from: patch.period_from ?? periodFrom,
    period_to: patch.period_to ?? periodTo,
    free_days: patch.free_days ?? freeDays,
    rate_per_day: patch.rate_per_day ?? ratePerDay,
    currency_code: patch.currency_code ?? currencyCode,
  });

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

      <Card className="max-w-xl space-y-4 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Calculator className="h-4 w-4" />
          Calculate storage
        </h3>
        <form className="space-y-3" onSubmit={handleCalculate} noValidate>
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
          <Input
            label="Party ID"
            value={partyId}
            error={calcValidation.fieldError('party_id')}
            onChange={(e) => {
              const next = e.target.value;
              setPartyId(next);
              calcValidation.revalidate(calculateStorageSchema, calcValues({ party_id: next }));
            }}
            onBlur={() =>
              calcValidation.validatePath(calculateStorageSchema, calcValues(), 'party_id')
            }
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
          <WmsCurrencyField
            label="Currency"
            value={currencyCode}
            onChange={(v) => {
              setCurrencyCode(v);
              calcValidation.revalidate(calculateStorageSchema, calcValues({ currency_code: v }));
            }}
            error={calcValidation.fieldError('currency_code')}
          />
          <FieldError message={calcValidation.formError} />
          <Button type="submit" disabled={calculateMutation.isPending}>
            Calculate
          </Button>
        </form>
        {calcResult ? (
          <pre className="overflow-x-auto rounded bg-[var(--color-neutral-50)] p-2 text-xs">
            {JSON.stringify(calcResult, null, 2)}
          </pre>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-semibold">Storage charges</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void chargesQuery.refetch()}
            disabled={!chargesEnabled || chargesQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${chargesQuery.isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="mb-4 grid max-w-xl gap-3 sm:grid-cols-2">
          <Input
            label="Party ID"
            value={chargePartyId}
            onChange={(e) => {
              setChargePartyId(e.target.value);
              setSelectedChargeIds([]);
            }}
            required
            hint="Required by GET /wms/storage/charges"
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
        </div>

        {!chargesEnabled ? (
          <p className="text-sm text-[var(--color-neutral-400)]">
            Enter a valid party ID and status to load charges.
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

        {success ? <p className="mt-3 text-sm text-[var(--color-success-600)]">{success}</p> : null}
        <FieldError
          message={invoiceValidation.formError || invoiceValidation.fieldError('charge_ids')}
        />

        <Button
          type="button"
          className="mt-3"
          onClick={handleInvoice}
          disabled={
            invoiceMutation.isPending || !selectedChargeIds.length || chargeStatus !== 'OPEN'
          }
        >
          <Save className="h-4 w-4" />
          Invoice selected
        </Button>
      </Card>
    </div>
  );
}
