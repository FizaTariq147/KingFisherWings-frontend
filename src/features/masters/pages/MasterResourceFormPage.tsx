import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { getMasterResource } from '../config/masterResources';
import {
  useMasterDetail,
  useMasterMutations,
  useMasterOptions,
} from '../hooks/useMasterResource';
import {
  useMasterPageRoute,
  type MasterPageRouteProps,
} from '../hooks/useMasterPageRoute';
import { validateMasterValues } from '../schemas/master.schema';
import { masterDisplayValue, pickCountryIsoCode } from '../utils/normalizeMasterRecord';
import type { MasterFieldConfig } from '../types/master.types';
import { MASTER_PATHS, type MasterResourceKey } from '../api/masterPaths';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

function FieldInput({
  field,
  value,
  onChange,
  options,
}: {
  field: MasterFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  options: { value: string; label: string }[];
}) {
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {field.label}
      </label>
    );
  }

  if (field.type === 'select') {
    const isEmpty = options.length === 0;
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]">{field.label}</label>
        <select
          className={selectClass}
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={isEmpty && Boolean(field.optionsFrom)}
        >
          <option value="">
            {isEmpty && field.optionsFrom ? 'No options available' : 'Select…'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isEmpty && field.optionsFrom === 'countries' && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            Create the country under Masters → Countries first (ISO code is sent as country_code).
          </p>
        )}
        {isEmpty && field.optionsFrom === 'tax-rates' && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            Create a Tax Rate first under Masters → Tax Rates, then return here.
          </p>
        )}
        {isEmpty &&
          field.optionsFrom &&
          field.optionsFrom !== 'tax-rates' &&
          field.optionsFrom !== 'countries' && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            No records found for this lookup. Create them under Masters first.
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string' && value
        ? value.split(/[,\s]+/).filter(Boolean)
        : [];
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]">
          {field.label}
          {field.required ? ' *' : ''}
        </label>
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-700)]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value];
                    onChange(next);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]">{field.label}</label>
        <textarea
          className="min-h-[80px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          value={value == null ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <Input
      label={field.label}
      type={
        field.type === 'number'
          ? 'number'
          : field.type === 'date'
            ? 'date'
            : field.type === 'email'
              ? 'email'
              : field.type === 'url'
                ? 'url'
                : 'text'
      }
      value={value == null ? '' : String(value)}
      placeholder={field.placeholder}
      onChange={(e) =>
        onChange(
          field.type === 'number'
            ? e.target.value === ''
              ? ''
              : Number(e.target.value)
            : e.target.value,
        )
      }
    />
  );
}

function useFieldOptions(field: MasterFieldConfig) {
  const fromCompanies = field.optionsFrom === 'companies';
  const optionsKey = !fromCompanies
    ? (field.optionsFrom as MasterResourceKey | undefined)
    : undefined;
  const basePath = optionsKey ? MASTER_PATHS[optionsKey] : '';
  const { data: items = [] } = useMasterOptions(optionsKey ?? '', basePath, Boolean(optionsKey));
  const { data: companies = [] } = useTenantCompanies(fromCompanies);

  return useMemo(() => {
    if (field.options?.length) return field.options;
    if (fromCompanies) {
      return companies
        .filter((c) => isUuid(c.id))
        .map((c) => ({
          value: c.id,
          label: c.code ? `${c.name} (${c.code})` : c.name,
        }));
    }
    if (!optionsKey) return [];
    const valueKey = field.optionsValueKey ?? 'id';
    const labelKey = field.optionsLabelKey ?? 'name';
    return items
      .map((item) => {
        const name = masterDisplayValue(item, labelKey);
        const code = typeof item.code === 'string' ? item.code : '';
        const rate = item.rate != null && item.rate !== '' ? String(item.rate) : '';

        // Holidays / country lookups must submit ISO alpha-2, never the row UUID.
        if (optionsKey === 'countries' || valueKey === 'iso_code') {
          const iso = pickCountryIsoCode(item);
          if (!iso) return null;
          return { value: iso, label: name !== '—' ? `${name} (${iso})` : iso };
        }

        const value = String(item[valueKey] ?? '');
        // UUID FK selects must only expose real UUIDs (Nest ParseUUIDPipe / @IsUUID).
        if (valueKey === 'id' && !isUuid(value)) return null;
        let label = name;
        if (optionsKey === 'tax-rates') {
          label = [name !== '—' ? name : code, code && name !== code ? `(${code})` : '', rate ? `${rate}%` : '']
            .filter(Boolean)
            .join(' ');
        } else if (code && name !== '—' && name !== code) {
          label = `${name} (${code})`;
        }
        return { value, label: label || value };
      })
      .filter((opt): opt is { value: string; label: string } => Boolean(opt?.value));
  }, [
    companies,
    field.options,
    field.optionsLabelKey,
    field.optionsValueKey,
    fromCompanies,
    items,
    optionsKey,
  ]);
}

function DynamicField(props: {
  field: MasterFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const options = useFieldOptions(props.field);
  return <FieldInput {...props} options={options} />;
}

export default function MasterResourceFormPage(props: MasterPageRouteProps = {}) {
  const navigate = useNavigate();
  const { resourceKey, id, listPath, detailPath } = useMasterPageRoute(props);
  const resource = getMasterResource(resourceKey);
  const isEdit = Boolean(id);
  const { data: existing, isLoading } = useMasterDetail(
    resource?.key ?? resourceKey,
    resource?.basePath ?? '',
    id ?? '',
  );
  const mutations = useMasterMutations(resource?.key ?? resourceKey, resource?.basePath ?? '');

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!resource) return;
    if (isEdit && existing) {
      const next: Record<string, unknown> = {};
      for (const field of resource.fields) {
        const raw = existing[field.name];
        if (field.type === 'boolean') {
          next[field.name] = raw ?? false;
        } else if (field.type === 'multiselect') {
          next[field.name] = Array.isArray(raw)
            ? raw.map(String)
            : typeof raw === 'string' && raw
              ? raw.split(/[,\s]+/).filter(Boolean)
              : [];
        } else if (
          (field.name === 'customer_id' || field.name.endsWith('_id')) &&
          (raw == null || raw === '' || (typeof raw === 'string' && !isUuid(raw)))
        ) {
          next[field.name] = '';
        } else {
          next[field.name] = raw ?? '';
        }
      }
      setValues(next);
      return;
    }
    const defaults: Record<string, unknown> = {};
    for (const field of resource.fields) {
      if (field.type === 'boolean') defaults[field.name] = field.name === 'is_active' ? true : false;
      else if (field.type === 'multiselect') defaults[field.name] = [];
      else if (field.name === 'charge_group') defaults[field.name] = 'OTHER';
      else if (field.name === 'tax_type') defaults[field.name] = 'VAT';
      else if (field.name === 'service_type') defaults[field.name] = 'SEA_FCL_EXPORT';
      else defaults[field.name] = '';
    }
    if (resource.listDefaults) {
      Object.assign(defaults, resource.listDefaults);
    }
    setValues(defaults);
  }, [resource, isEdit, existing]);

  if (!resource) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Unknown master resource.</p>;
  }

  if (isEdit && resource.createOnly) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        This master does not support edit by id.
      </p>
    );
  }

  if (isEdit && isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validateMasterValues(resource.fields, values);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await mutations.update.mutateAsync({ id, dto: validation.data });
        navigate(detailPath(id));
      } else {
        const created = await mutations.create.mutateAsync(validation.data);
        // Exchange rates (and other createOnly masters) have no GET-by-id endpoint.
        if (resource.createOnly || !created?.id) {
          navigate(listPath);
        } else {
          navigate(detailPath(created.id));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(listPath)}
      >
        ← Back to {resource.title}
      </button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit' : 'Create'} {resource.title}
          </CardTitle>
        </CardHeader>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resource.fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' || field.type === 'multiselect' ? 'sm:col-span-2' : ''
                }
              >
                <DynamicField
                  field={field}
                  value={values[field.name]}
                  onChange={(next) => setValues((prev) => ({ ...prev, [field.name]: next }))}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(listPath)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
