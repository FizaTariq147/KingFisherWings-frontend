import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type Resolver } from 'react-hook-form';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { AWB_STOCK_ROUTE_PREFIX } from '../api/awbStock.api';
import { AwbAllocationsPanel } from '../components/AwbAllocationsPanel';
import {
  AwbStockErrorBanner,
  AwbStockSuccessBanner,
} from '../components/AwbStockBanners';
import { AwbStockConfirmModal } from '../components/AwbStockConfirmModal';
import { AwbStockOverviewPanel } from '../components/AwbStockOverviewPanel';
import {
  allocateAwbSchema,
  transferAwbBatchSchema,
  voidAwbAllocationSchema,
  type AllocateAwbFormValues,
  type TransferAwbBatchFormValues,
  type VoidAwbAllocationFormValues,
} from '../schemas/awbStock.schema';
import {
  useAllocateAwb,
  useAwbAllocations,
  useAwbStockBatch,
  useDeleteAwbStockBatch,
  useMarkAwbUsed,
  useTransferAwbBatch,
  useVoidAwbAllocation,
} from '../hooks/useAwbStock';
import { getErrorMessage } from '../utils/getErrorMessage';
import { awbBatchDisplayLabel } from '../utils/normalizeAwbStock';

export default function AwbStockDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading, isError, error, refetch } = useAwbStockBatch(id);
  const remove = useDeleteAwbStockBatch();
  const allocate = useAllocateAwb(id);
  const transfer = useTransferAwbBatch(id);
  const markUsed = useMarkAwbUsed();
  const voidAlloc = useVoidAwbAllocation();

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: jobsResult } = useJobs({ page: 1, limit: 100, order: 'desc' });
  const { data: allocationsResult, refetch: refetchAllocations } = useAwbAllocations(
    { airline_id: batch?.airline_id, limit: 200 },
    { enabled: Boolean(batch?.airline_id) },
  );

  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [voidId, setVoidId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState<string | null>(null);

  const allocateForm = useAppForm<AllocateAwbFormValues>({
    resolver: zodResolver(allocateAwbSchema) as Resolver<AllocateAwbFormValues>,
    defaultValues: { job_id: '' },
  });
  const transferForm = useAppForm<TransferAwbBatchFormValues>({
    resolver: zodResolver(transferAwbBatchSchema) as Resolver<TransferAwbBatchFormValues>,
    defaultValues: { branch_id: '' },
  });

  const jobOptions = useMemo(
    () =>
      (jobsResult?.jobs ?? []).map((j) => ({
        value: j.id,
        label: [j.job_number || j.id.slice(0, 8), j.job_type].filter(Boolean).join(' · '),
      })),
    [jobsResult?.jobs],
  );

  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => isUuid(String(b.id)))
        .map((b) => ({
          value: String(b.id),
          label: [b.code, b.name].filter(Boolean).join(' — ') || String(b.id),
        })),
    [branches],
  );

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>;
  }
  if (isError || !batch) {
    return (
      <div className="space-y-3 py-8">
        <AwbStockErrorBanner message={getErrorMessage(error) || 'Batch not found.'} />
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <button
          type="button"
          className="block text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
          onClick={() => navigate(AWB_STOCK_ROUTE_PREFIX)}
        >
          ← Back to AWB stock
        </button>
      </div>
    );
  }

  const run = async (fn: () => Promise<unknown>, success: string, leave?: boolean) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      await fn();
      setConfirmDelete(false);
      if (leave) {
        navigate(AWB_STOCK_ROUTE_PREFIX);
        return;
      }
      setActionMessage(success);
      await Promise.all([refetch(), refetchAllocations()]);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const fromBatch = batch.allocations ?? [];
  const fromList = (allocationsResult?.items ?? []).filter(
    (a) => !a.batch_id || a.batch_id === batch.id,
  );
  const allocations = fromList.length > 0 ? fromList : fromBatch;

  const remaining = batch.remaining ?? 0;
  const canAllocate = remaining > 0;

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: <AwbStockOverviewPanel batch={batch} />,
    },
    {
      key: 'allocate',
      label: 'Allocate / Transfer',
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocate next AWB to job</CardTitle>
            </CardHeader>
            <form
              className="px-4 pb-4 space-y-3"
              onSubmit={allocateForm.handleSubmit(async (values) => {
                await run(
                  () => allocate.mutateAsync(values),
                  `AWB allocated to job.`,
                );
                allocateForm.reset({ job_id: '' });
              })}
            >
              {!canAllocate ? (
                <p className="text-sm text-[var(--color-warning-700)]">
                  This batch has no remaining AWB numbers.
                </p>
              ) : null}
              <Controller
                name="job_id"
                control={allocateForm.control}
                render={({ field }) => (
                  <SearchableSelect
                    name="job_id"
                    label="Job"
                    required
                    value={field.value ?? ''}
                    options={jobOptions}
                    onChange={field.onChange}
                    error={allocateForm.formState.errors.job_id?.message}
                    placeholder="Search job number…"
                  />
                )}
              />
              <Button
                type="submit"
                disabled={!canAllocate || allocate.isPending || pending}
              >
                Allocate next AWB
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer batch to branch</CardTitle>
            </CardHeader>
            <form
              className="px-4 pb-4 space-y-3"
              onSubmit={transferForm.handleSubmit(async (values) => {
                await run(
                  () => transfer.mutateAsync(values),
                  'Batch transferred to branch.',
                );
                transferForm.reset({ branch_id: '' });
              })}
            >
              <Controller
                name="branch_id"
                control={transferForm.control}
                render={({ field }) => (
                  <SearchableSelect
                    name="branch_id"
                    label="Branch"
                    required
                    value={field.value ?? ''}
                    options={branchOptions}
                    onChange={field.onChange}
                    error={transferForm.formState.errors.branch_id?.message}
                    placeholder="Search branch…"
                  />
                )}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={transfer.isPending || pending}
              >
                Transfer batch
              </Button>
            </form>
          </Card>
        </div>
      ),
    },
    {
      key: 'allocations',
      label: `Allocations (${allocations.length})`,
      content: (
        <AwbAllocationsPanel
          allocations={allocations}
          pending={pending}
          voidId={voidId}
          voidReason={voidReason}
          onVoidIdChange={(v) => {
            setVoidId(v);
            setVoidError(null);
          }}
          onVoidReasonChange={(v) => {
            setVoidReason(v);
            setVoidError(null);
          }}
          onMarkUsed={(allocationId) =>
            run(() => markUsed.mutateAsync(allocationId), 'Marked as used.')
          }
          onConfirmVoid={() => {
            const parsed = voidAwbAllocationSchema.safeParse({
              void_reason: voidReason,
            } satisfies VoidAwbAllocationFormValues);
            if (!parsed.success || !voidId) {
              setVoidError(
                parsed.success
                  ? 'Select an allocation to void.'
                  : parsed.error.issues[0]?.message || 'Enter a void reason.',
              );
              return;
            }
            void run(async () => {
              await voidAlloc.mutateAsync({ id: voidId, dto: parsed.data });
              setVoidId(null);
              setVoidReason('');
              setVoidError(null);
            }, 'Allocation voided.');
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-3 space-y-2">
        {actionError ? <AwbStockErrorBanner message={actionError} /> : null}
        {actionMessage ? <AwbStockSuccessBanner message={actionMessage} /> : null}
        {voidError ? <AwbStockErrorBanner message={voidError} /> : null}
      </div>
      <DetailPageTemplate
        title={awbBatchDisplayLabel(batch)}
        subtitle={`Prefix ${batch.prefix} · Remaining ${batch.remaining ?? '—'} of ${batch.total_count ?? '—'}`}
        statusLabel={
          batch.deleted_at
            ? 'Deleted'
            : batch.is_low_stock
              ? 'Low stock'
              : remaining <= 0
                ? 'Exhausted'
                : 'Available'
        }
        statusTone={
          batch.deleted_at
            ? 'slate'
            : batch.is_low_stock || remaining <= 0
              ? 'amber'
              : 'emerald'
        }
        tabs={tabs}
        actions={[
          {
            label: 'Edit',
            onClick: () => navigate(`${AWB_STOCK_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary',
          },
          {
            label: 'Delete',
            onClick: () => setConfirmDelete(true),
            variant: 'danger',
          },
        ]}
        actionsDisabled={pending}
        onBack={() => navigate(AWB_STOCK_ROUTE_PREFIX)}
        backLabel="AWB stock"
      />
      {confirmDelete && (
        <AwbStockConfirmModal
          open
          action="delete"
          batch={batch}
          isPending={pending}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => run(() => remove.mutateAsync(id), 'Batch deleted.', true)}
        />
      )}
    </>
  );
}
