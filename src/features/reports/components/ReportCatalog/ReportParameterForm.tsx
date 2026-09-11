import { Input } from '@/components/ui/Input';
import type { ReportTemplateParamField } from '../../types/reportCatalog.types';

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm';

type ReportParameterFormProps = {
  fields: ReportTemplateParamField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /** Hide params already satisfied by launcher context (job_id, etc.). */
  lockedContextKeys?: string[];
};

/**
 * Fully schema-driven parameter form — no per-report field hardcoding.
 * Backend GET /reports/templates/:id drives labels, types, options, required.
 */
export function ReportParameterForm({
  fields,
  values,
  onChange,
  lockedContextKeys = [],
}: ReportParameterFormProps) {
  const locked = new Set(lockedContextKeys);
  const visible = fields.filter((f) => !locked.has(f.name));

  if (visible.length === 0) {
    return (
      <p className="text-xs text-[var(--color-neutral-500)]">
        No extra parameters for this template
        {locked.size ? ' (context IDs already supplied).' : '.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {visible.map((field) => (
        <ReportParameterField
          key={field.name}
          field={field}
          value={values[field.name] ?? ''}
          onChange={(value) => onChange(field.name, value)}
        />
      ))}
    </div>
  );
}

function ReportParameterField({
  field,
  value,
  onChange,
}: {
  field: ReportTemplateParamField;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = `${field.label}${field.required ? ' *' : ''}`;

  if (field.type === 'boolean') {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor={field.name}>
          {label}
        </label>
        <select
          id={field.name}
          className={SELECT_CLASS}
          value={value || 'false'}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  if (field.type === 'select' || (field.options && field.options.length > 0)) {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor={field.name}>
          {label}
        </label>
        <select
          id={field.name}
          className={SELECT_CLASS}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const inputType =
    field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';

  return (
    <Input
      id={field.name}
      label={label}
      type={inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.type === 'uuid' ? 'UUID' : undefined}
    />
  );
}
