import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
  RESET_FREQUENCIES,
  RESET_FREQUENCY_LABELS,
  type DocumentType,
} from '../constants/organization.constants';
import {
  useCreateNumberFormat,
  useNumberFormat,
  useNumberFormats,
  usePreviewNumberFormatMutation,
  useUpdateNumberFormat,
} from '../hooks/useNumberFormats';
import { createNumberFormatSchema } from '../schemas/organization.schema';
import type { NumberFormat, NumberFormatFormValues } from '../types/organization.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { numberFormatToFormValues } from '../utils/prepareOrganizationPayload';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const CREATE_DEFAULTS: NumberFormatFormValues = {
  document_type: 'INVOICE',
  prefix: 'INV',
  include_branch_code: false,
  include_year: true,
  year_digits: 2,
  include_month: false,
  sequence_length: 5,
  separator: '/',
  reset_frequency: 'YEARLY',
  is_active: true,
};

function NumberFormatEditorForm({
  mode,
  defaultValues,
  usedTypes,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  defaultValues?: Partial<NumberFormatFormValues>;
  usedTypes: Set<string>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: NumberFormatFormValues) => void | Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NumberFormatFormValues>({
    resolver: zodResolver(createNumberFormatSchema) as Resolver<NumberFormatFormValues>,
    defaultValues: { ...CREATE_DEFAULTS, ...defaultValues },
  });

  const availableTypes =
    mode === 'edit'
      ? DOCUMENT_TYPES
      : DOCUMENT_TYPES.filter((t) => !usedTypes.has(t));

  return (
    <form className="space-y-4" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-neutral-600)]">
            Document type *
          </label>
          <select
            className={selectClass}
            disabled={mode === 'edit'}
            {...register('document_type')}
          >
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {errors.document_type && (
            <p className="text-xs text-[var(--color-danger-700)]">{errors.document_type.message}</p>
          )}
        </div>
        <Input label="Prefix *" error={errors.prefix?.message} {...register('prefix')} />
        <Input label="Separator" error={errors.separator?.message} {...register('separator')} />
        <Input
          label="Sequence length (padding)"
          type="number"
          error={errors.sequence_length?.message}
          {...register('sequence_length')}
        />
        <Input
          label="Year digits"
          type="number"
          error={errors.year_digits?.message}
          {...register('year_digits')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-neutral-600)]">
            Reset frequency
          </label>
          <select className={selectClass} {...register('reset_frequency')}>
            {RESET_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {RESET_FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('include_year')} />
            Include year
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('include_month')} />
            Include month
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('include_branch_code')} />
            Include branch code
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} />
            Active
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create format' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default function NumberFormatsPage() {
  const { data = [], isLoading, isFetching, isError, error, refetch } = useNumberFormats();
  const createFormat = useCreateNumberFormat();
  const previewMutation = usePreviewNumberFormatMutation();

  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingType, setEditingType] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewByType, setPreviewByType] = useState<Record<string, string>>({});

  const { data: editingDetail, isLoading: editingLoading } = useNumberFormat(editingType);
  const updateFormat = useUpdateNumberFormat(editingType);

  const usedTypes = useMemo(
    () => new Set(data.map((f) => String(f.document_type))),
    [data],
  );

  useEffect(() => {
    if (!successMessage) return;
    const id = window.setTimeout(() => setSuccessMessage(null), 2500);
    return () => window.clearTimeout(id);
  }, [successMessage]);

  const openCreate = () => {
    setEditingType('');
    setEditorMode('create');
    setActionError(null);
  };

  const openEdit = (format: NumberFormat) => {
    setEditingType(String(format.document_type));
    setEditorMode('edit');
    setActionError(null);
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditingType('');
    setActionError(null);
  };

  const handleCreate = async (values: NumberFormatFormValues) => {
    setActionError(null);
    try {
      await createFormat.mutateAsync(values);
      closeEditor();
      setSuccessMessage('Number format created');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (values: NumberFormatFormValues) => {
    setActionError(null);
    try {
      await updateFormat.mutateAsync(values);
      closeEditor();
      setSuccessMessage('Number format updated');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handlePreview = async (documentType: string) => {
    setActionError(null);
    try {
      const result = await previewMutation.mutateAsync(documentType);
      setPreviewByType((prev) => ({
        ...prev,
        [documentType]: result.preview || '—',
      }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-neutral-800)]">
            Number Formats
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Configure document numbering prefixes, sequence length, and reset rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {successMessage && <Badge variant="success">{successMessage}</Badge>}
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={openCreate}
            disabled={usedTypes.size >= DOCUMENT_TYPES.length}
          >
            <Plus className="h-4 w-4" />
            Add format
          </Button>
        </div>
      </div>

      {actionError && !editorMode && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {actionError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configured formats</CardTitle>
        </CardHeader>
        {isError ? (
          <div className="space-y-3 py-4 text-center">
            <p className="text-sm text-[var(--color-danger-700)]">
              {getErrorMessage(error) || 'Failed to load number formats.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : (
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document type</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Separator</TableHead>
                <TableHead>Seq length</TableHead>
                <TableHead>Reset</TableHead>
                <TableHead>Current #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-[var(--color-neutral-400)]">
                    No number formats configured yet
                  </TableCell>
                </TableRow>
              ) : (
                data.map((format) => {
                  const type = String(format.document_type) as DocumentType;
                  return (
                    <TableRow key={format.id || format.document_type}>
                      <TableCell>
                        {DOCUMENT_TYPE_LABELS[type] ?? format.document_type}
                      </TableCell>
                      <TableCell mono>{format.prefix}</TableCell>
                      <TableCell mono>{format.separator || '—'}</TableCell>
                      <TableCell>{format.sequence_length}</TableCell>
                      <TableCell>
                        {RESET_FREQUENCY_LABELS[
                          format.reset_frequency as keyof typeof RESET_FREQUENCY_LABELS
                        ] ?? format.reset_frequency}
                      </TableCell>
                      <TableCell>
                        {format.current_sequence != null ? format.current_sequence : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={format.is_active ? 'success' : 'neutral'} dot={false}>
                          {format.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell mono className="text-xs">
                        {previewByType[format.document_type] || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            disabled={previewMutation.isPending}
                            onClick={() => handlePreview(String(format.document_type))}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => openEdit(format)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        open={editorMode !== null}
        onClose={closeEditor}
        title={editorMode === 'create' ? 'Create number format' : 'Update number format'}
        size="lg"
      >
        {actionError && editorMode && (
          <div
            role="alert"
            className="mb-4 rounded-lg border px-3 py-2 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {actionError}
          </div>
        )}
        {editorMode === 'edit' && editingLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading format…</p>
        ) : editorMode ? (
          <NumberFormatEditorForm
            key={
              editorMode === 'edit'
                ? `edit-${editingType}-${editingDetail?.id ?? 'pending'}`
                : 'create'
            }
            mode={editorMode}
            usedTypes={usedTypes}
            defaultValues={
              editorMode === 'edit' && editingDetail
                ? numberFormatToFormValues(editingDetail)
                : CREATE_DEFAULTS
            }
            isSubmitting={createFormat.isPending || updateFormat.isPending}
            onCancel={closeEditor}
            onSubmit={editorMode === 'create' ? handleCreate : handleUpdate}
          />
        ) : null}
      </Modal>
    </div>
  );
}
