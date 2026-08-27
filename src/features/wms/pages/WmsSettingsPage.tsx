import { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { WmsCurrencyField } from '../components/WmsCurrencyField';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { WmsSelect } from '../components/WmsFormHelpers';
import { useUpsertWmsSettings, useWmsSettings } from '../hooks/useWms';
import { upsertWmsSettingsSchema } from '../schemas/wms.schema';
import type { UpsertWmsSettingsDto, WmsValuationMethod } from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsSettingsPage() {
  const { data, isLoading, isFetching, refetch, isError, error } = useWmsSettings();
  const saveMutation = useUpsertWmsSettings();
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();

  const [valuationMethod, setValuationMethod] = useState<WmsValuationMethod>('FIFO');
  const [defaultFreeDays, setDefaultFreeDays] = useState('0');
  const [defaultStorageRate, setDefaultStorageRate] = useState('0');
  const [defaultCurrency, setDefaultCurrency] = useState('AED');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setValuationMethod(data.valuation_method);
    setDefaultFreeDays(String(data.default_free_days));
    setDefaultStorageRate(String(data.default_storage_rate));
    setDefaultCurrency(data.default_currency);
  }, [data]);

  const values = (
    patch: Partial<{
      valuation_method: WmsValuationMethod;
      default_free_days: string;
      default_storage_rate: string;
      default_currency: string;
    }> = {},
  ) => ({
    valuation_method: patch.valuation_method ?? valuationMethod,
    default_free_days: patch.default_free_days ?? defaultFreeDays,
    default_storage_rate: patch.default_storage_rate ?? defaultStorageRate,
    default_currency: patch.default_currency ?? defaultCurrency,
  });

  const handleSave = async () => {
    clearErrors();
    setSuccess(null);
    const parsed = validate(upsertWmsSettingsSchema, values());
    if (!parsed) return;
    try {
      await saveMutation.mutateAsync(parsed as UpsertWmsSettingsDto);
      setSuccess('Settings saved.');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={WMS_ROUTE_PREFIX}
        title="WMS Settings"
        description="Default valuation, free days, storage rate, and currency."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button type="button" onClick={handleSave} disabled={saveMutation.isPending || isLoading}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </>
        }
      />

      <Card className="max-w-xl space-y-4 p-4">
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading settings…</p>
        ) : (
          <>
            <WmsSelect
              label="Valuation method"
              value={valuationMethod}
              onChange={(v) => {
                const next = v === 'LIFO' ? 'LIFO' : 'FIFO';
                setValuationMethod(next);
                revalidate(upsertWmsSettingsSchema, values({ valuation_method: next }));
              }}
              onBlur={() => validatePath(upsertWmsSettingsSchema, values(), 'valuation_method')}
              options={[
                { value: 'FIFO', label: 'FIFO' },
                { value: 'LIFO', label: 'LIFO' },
              ]}
              required
              error={fieldError('valuation_method')}
            />
            <Input
              label="Default free days"
              type="number"
              min={0}
              value={defaultFreeDays}
              error={fieldError('default_free_days')}
              onChange={(e) => {
                const next = e.target.value;
                setDefaultFreeDays(next);
                revalidate(upsertWmsSettingsSchema, values({ default_free_days: next }));
              }}
              onBlur={() => validatePath(upsertWmsSettingsSchema, values(), 'default_free_days')}
            />
            <Input
              label="Default storage rate (per day)"
              type="number"
              min={0}
              step="0.01"
              value={defaultStorageRate}
              error={fieldError('default_storage_rate')}
              onChange={(e) => {
                const next = e.target.value;
                setDefaultStorageRate(next);
                revalidate(upsertWmsSettingsSchema, values({ default_storage_rate: next }));
              }}
              onBlur={() => validatePath(upsertWmsSettingsSchema, values(), 'default_storage_rate')}
            />
            <WmsCurrencyField
              label="Default currency"
              value={defaultCurrency}
              onChange={(v) => {
                setDefaultCurrency(v);
                revalidate(upsertWmsSettingsSchema, values({ default_currency: v }));
              }}
              required
              error={fieldError('default_currency')}
            />
          </>
        )}
        <FieldError message={formError} />
        {success ? <p className="text-sm text-[var(--color-success-600)]">{success}</p> : null}
      </Card>
    </div>
  );
}
