import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { useInlineValidation } from '@/lib/validation';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { useWmsUomOptions, WmsSelect } from '../components/WmsFormHelpers';
import { WmsPageHeader } from '../components/WmsPageHeader';
import { useCreateWmsItem, useUpdateWmsItem, useWmsItem } from '../hooks/useWms';
import { createWmsItemSchema, createWmsItemSchemaWithUoms } from '../schemas/wms.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function WmsItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const detailQuery = useWmsItem(id ?? '');
  const createMutation = useCreateWmsItem();
  const updateMutation = useUpdateWmsItem(id ?? '');
  const { fieldError, formError, setFormError, clearErrors, validate, revalidate, validatePath } =
    useInlineValidation();
  const { options: uomOptions, codes: uomCodes, isEmpty: uomsEmpty, isLoading: uomsLoading } =
    useWmsUomOptions();

  const existing = detailQuery.data;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uomCode, setUomCode] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isEdit || !existing) return;
    setCode(existing.code);
    setName(existing.name);
    setDescription(existing.description ?? '');
    setUomCode((existing.uom_code ?? '').toUpperCase());
    setLowStock(existing.low_stock_threshold != null ? String(existing.low_stock_threshold) : '');
    setIsActive(existing.is_active ?? true);
  }, [isEdit, existing]);

  const allowedUomCodes = useMemo(() => {
    const set = new Set(uomCodes);
    if (uomCode) set.add(uomCode.toUpperCase());
    return [...set];
  }, [uomCodes, uomCode]);

  const itemSchema = useMemo(() => {
    if (allowedUomCodes.length > 0) return createWmsItemSchemaWithUoms(allowedUomCodes);
    return createWmsItemSchema;
  }, [allowedUomCodes]);

  const uomSelectOptions = useMemo(() => {
    if (uomCode && !uomOptions.some((o) => o.value === uomCode)) {
      return [...uomOptions, { value: uomCode, label: `${uomCode} (current)` }];
    }
    return uomOptions;
  }, [uomOptions, uomCode]);

  const values = (
    patch: Partial<{
      code: string;
      name: string;
      description: string;
      uom_code: string;
      low_stock_threshold: string;
      is_active: boolean;
    }> = {},
  ) => ({
    code: patch.code ?? code,
    name: patch.name ?? name,
    description: patch.description ?? description,
    uom_code: patch.uom_code ?? uomCode,
    low_stock_threshold: patch.low_stock_threshold ?? lowStock,
    is_active: patch.is_active ?? isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (uomsEmpty) {
      setFormError('Add Units of Measure under Masters before creating items.');
      return;
    }
    const parsed = validate(itemSchema, values());
    if (!parsed) return;
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync(parsed);
        navigate(`${WMS_ROUTE_PREFIX}/items/${id}`);
      } else {
        const created = await createMutation.mutateAsync(parsed);
        navigate(`${WMS_ROUTE_PREFIX}/items/${created.id}`);
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <WmsPageHeader
        backTo={isEdit ? `${WMS_ROUTE_PREFIX}/items/${id}` : `${WMS_ROUTE_PREFIX}/items`}
        backLabel={isEdit ? 'Item detail' : 'Items'}
        title={isEdit ? 'Edit item' : 'New item'}
      />

      <Card className="max-w-xl p-4">
        {isEdit && detailQuery.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Code"
              value={code}
              error={fieldError('code')}
              hint="Uppercase letters, numbers, and hyphens (e.g. FLT-001)"
              onChange={(e) => {
                const next = e.target.value.toUpperCase();
                setCode(next);
                revalidate(itemSchema, values({ code: next }));
              }}
              onBlur={() => validatePath(itemSchema, values(), 'code')}
              required
            />
            <Input
              label="Name"
              value={name}
              error={fieldError('name')}
              hint="Real product name (not random characters)"
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                revalidate(itemSchema, values({ name: next }));
              }}
              onBlur={() => validatePath(itemSchema, values(), 'name')}
              required
            />
            <Input
              label="Description"
              value={description}
              error={fieldError('description')}
              onChange={(e) => {
                const next = e.target.value;
                setDescription(next);
                revalidate(itemSchema, values({ description: next }));
              }}
              onBlur={() => validatePath(itemSchema, values(), 'description')}
            />
            <WmsSelect
              label="UOM"
              value={uomCode}
              onChange={(v) => {
                const next = v.toUpperCase();
                setUomCode(next);
                revalidate(itemSchema, values({ uom_code: next }));
              }}
              onBlur={() => validatePath(itemSchema, values(), 'uom_code')}
              options={uomSelectOptions}
              required
              disabled={uomsLoading || uomsEmpty}
              error={fieldError('uom_code')}
            />
            {uomsEmpty ? (
              <p className="text-xs text-[var(--color-danger-600)]">
                No UOM masters found. Create codes under Masters → Units of Measure first.
              </p>
            ) : null}
            <Input
              label="Low stock threshold"
              type="number"
              min={0}
              value={lowStock}
              error={fieldError('low_stock_threshold')}
              onChange={(e) => {
                const next = e.target.value;
                setLowStock(next);
                revalidate(itemSchema, values({ low_stock_threshold: next }));
              }}
              onBlur={() => validatePath(itemSchema, values(), 'low_stock_threshold')}
            />
            <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIsActive(next);
                  revalidate(itemSchema, values({ is_active: next }));
                }}
              />
              Active
            </label>
            <FieldError message={formError} />
            <Button type="submit" disabled={pending || uomsEmpty}>
              <Save className="h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create item'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
