import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { AWB_ALLOCATION_STATUS_LABELS } from '../../constants/awbStock.constants';
import type { AwbAllocation } from '../../types/awbStock.types';

function statusVariant(status?: string): 'info' | 'success' | 'danger' | 'neutral' | 'warning' {
  switch ((status || '').toUpperCase()) {
    case 'USED':
      return 'success';
    case 'VOID':
      return 'danger';
    case 'ALLOCATED':
      return 'info';
    default:
      return 'neutral';
  }
}

interface AwbAllocationsPanelProps {
  allocations: AwbAllocation[];
  pending: boolean;
  voidId: string | null;
  voidReason: string;
  onVoidIdChange: (id: string | null) => void;
  onVoidReasonChange: (reason: string) => void;
  onMarkUsed: (id: string) => void;
  onConfirmVoid: () => void;
}

export function AwbAllocationsPanel({
  allocations,
  pending,
  voidId,
  voidReason,
  onVoidIdChange,
  onVoidReasonChange,
  onMarkUsed,
  onConfirmVoid,
}: AwbAllocationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocations</CardTitle>
      </CardHeader>
      <div className="px-4 pb-4 space-y-3">
        {allocations.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-6 text-center">
            No allocations for this batch yet.
          </p>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>AWB number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((a) => {
                const status = (a.status || '').toUpperCase();
                const canAct = status !== 'USED' && status !== 'VOID';
                return (
                  <TableRow key={a.id}>
                    <TableCell mono>{a.awb_number || a.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(a.status)}>
                        {AWB_ALLOCATION_STATUS_LABELS[a.status || ''] || a.status || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.job_number || (a.job_id ? a.job_id.slice(0, 8) : '—')}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--color-neutral-500)]">
                      {a.allocated_at
                        ? new Date(a.allocated_at).toLocaleString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {canAct ? (
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => onMarkUsed(a.id)}
                          >
                            Mark used
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={pending}
                            onClick={() => {
                              onVoidIdChange(a.id);
                              onVoidReasonChange('');
                            }}
                          >
                            Void
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-neutral-400)]">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {voidId ? (
          <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 space-y-2">
            <p className="text-xs font-medium text-[var(--color-neutral-600)]">
              Void reason <span className="text-[var(--color-danger-500)]">*</span>
            </p>
            <Input
              value={voidReason}
              onChange={(e) => onVoidReasonChange(e.target.value)}
              placeholder="Reason for voiding this AWB"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={!voidReason.trim() || pending}
                onClick={onConfirmVoid}
              >
                Confirm void
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onVoidIdChange(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
