import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { JOB_TYPES, JOB_TYPE_LABELS } from '../constants/quotation.constants';
import {
  useServiceCatalog,
  useServiceCatalogMutations,
} from '../hooks/useQuotationServiceCatalog';
import type { ServiceCatalogItem } from '../types/quotationExtended.types';

const PRICING_BASES = ['FLAT', 'PER_KG', 'PER_CBM', 'PER_PIECE', 'PER_CONTAINER'] as const;

export default function ServiceCatalogPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('quotations.service_catalog.manage');
  const [jobType, setJobType] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const params = useMemo(
    () => ({
      job_type: jobType || undefined,
      active_only: activeOnly,
    }),
    [jobType, activeOnly],
  );
  const { data: items = [], isLoading, refetch } = useServiceCatalog(params);
  const mutations = useServiceCatalogMutations();
  const [editing, setEditing] = useState<ServiceCatalogItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    job_type: 'AIR_EXPORT',
    pricing_basis: 'FLAT',
    unit_price: '',
    currency_code: 'AED',
    min_charge: '',
    is_portal_visible: true,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      job_type: 'AIR_EXPORT',
      pricing_basis: 'FLAT',
      unit_price: '',
      currency_code: 'AED',
      min_charge: '',
      is_portal_visible: true,
      is_active: true,
    });
    setEditing(null);
    setCreating(false);
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
  };

  const openEdit = (item: ServiceCatalogItem) => {
    setEditing(item);
    setCreating(false);
    setForm({
      code: item.code,
      name: item.name,
      job_type: String(item.jobType),
      pricing_basis: String(item.pricingBasis),
      unit_price: String(item.unitPrice),
      currency_code: item.currencyCode,
      min_charge: item.minCharge != null ? String(item.minCharge) : '',
      is_portal_visible: item.isPortalVisible,
      is_active: item.isActive,
    });
  };

  const save = async () => {
    setError(null);
    const dto = {
      code: form.code.trim(),
      name: form.name.trim(),
      job_type: form.job_type,
      pricing_basis: form.pricing_basis,
      unit_price: Number(form.unit_price),
      currency_code: form.currency_code.trim().toUpperCase(),
      ...(form.min_charge.trim() ? { min_charge: Number(form.min_charge) } : {}),
      is_portal_visible: form.is_portal_visible,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, dto });
      } else {
        await mutations.create.mutateAsync(dto);
      }
      resetForm();
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-neutral-900)]">Service catalog</h1>
          <p className="text-sm text-[var(--color-neutral-500)]">
            Tenant pricing per service for quotations and the customer portal.
          </p>
        </div>
        {canManage ? (
          <Button type="button" size="sm" onClick={openCreate}>
            Add service
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-neutral-500)] mb-1">Job type</span>
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {JOB_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
      </div>

      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {(creating || editing) && canManage ? (
        <div className="rounded-lg border border-[var(--color-neutral-200)] p-4 grid gap-2 sm:grid-cols-2">
          <Input placeholder="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={form.job_type}
            onChange={(e) => setForm({ ...form, job_type: e.target.value })}
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {JOB_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={form.pricing_basis}
            onChange={(e) => setForm({ ...form, pricing_basis: e.target.value })}
          >
            {PRICING_BASES.map((b) => (
              <option key={b} value={b}>
                {b.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <Input placeholder="Unit price *" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          <Input placeholder="Currency *" value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value })} />
          <Input placeholder="Min charge" value={form.min_charge} onChange={(e) => setForm({ ...form, min_charge: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_portal_visible} onChange={(e) => setForm({ ...form, is_portal_visible: e.target.checked })} />
            Portal visible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="button" size="sm" disabled={mutations.create.isPending || mutations.update.isPending} onClick={() => void save()}>
              Save
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-400)]">No catalog items yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-[var(--color-neutral-500)]">
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Job type</th>
                <th className="py-2 pr-3">Basis</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Portal</th>
                {canManage ? <th className="py-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--color-neutral-100)]">
                  <td className="py-2 pr-3 font-medium">{item.code}</td>
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3">{JOB_TYPE_LABELS[item.jobType as keyof typeof JOB_TYPE_LABELS] ?? item.jobType}</td>
                  <td className="py-2 pr-3">{item.pricingBasis}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {item.currencyCode} {item.unitPrice}
                  </td>
                  <td className="py-2 pr-3">{item.isPortalVisible ? 'Yes' : 'No'}</td>
                  {canManage ? (
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={mutations.remove.isPending}
                          onClick={() => void mutations.remove.mutateAsync(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
