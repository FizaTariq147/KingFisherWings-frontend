import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { VOUCHER_ROUTE_PREFIX } from '@/features/vouchers/api/voucher.api';
import {
  VOUCHER_TYPE_LABELS,
  VOUCHER_TYPES,
  type VoucherType,
} from '@/features/vouchers/constants/voucher.constants';
import {
  normalizeVoucher,
  voucherDisplayNumber,
} from '@/features/vouchers/utils/normalizeVoucher';
import type { Voucher } from '@/features/vouchers/types/voucher.types';
import { isUuid } from '@/lib/isUuid';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobVouchersList } from '../../hooks/useJobs';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobVouchersPanelProps {
  jobId: string;
  job?: Job;
}

function vouchersFromUnknown(raw: unknown): Voucher[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeVoucher).filter((v): v is Voucher => Boolean(v));
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    for (const key of ['vouchers', 'items', 'data', 'results']) {
      if (Array.isArray(rec[key])) return vouchersFromUnknown(rec[key]);
    }
  }
  return [];
}

export function JobVouchersPanel({ jobId, job }: JobVouchersPanelProps) {
  const listQuery = useJobVouchersList(jobId);
  const actions = useJobActions(jobId);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [voucherType, setVoucherType] = useState<VoucherType>('JOURNAL');
  const [chargeIds, setChargeIds] = useState('');
  const [side, setSide] = useState<'SALE' | 'COST'>('SALE');
  const [narration, setNarration] = useState('');
  const [autoPost, setAutoPost] = useState(false);

  const vouchers = useMemo(
    () => vouchersFromUnknown(listQuery.data),
    [listQuery.data],
  );

  const chargeOptions = (job?.charges ?? []).filter((c) => c?.id && isUuid(c.id));

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      void listQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const generate = () => {
    const ids = chargeIds
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => isUuid(s));
    if (!ids.length) {
      setError('Enter at least one charge UUID (comma-separated).');
      return;
    }
    void run(
      () =>
        actions.generateVoucher.mutateAsync({
          voucher_type: voucherType,
          charge_ids: ids,
          side,
          narration: narration.trim() || undefined,
          currency_code: job?.currency_code || undefined,
          auto_post: autoPost || undefined,
        }),
      'Draft voucher generated.',
    );
  };

  return (
    <div className="space-y-4 text-[13px]">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Linked vouchers ({vouchers.length})</CardTitle>
        </CardHeader>
        <div className="space-y-2 px-4 pb-4">
          {listQuery.isLoading ? (
            <p className="text-[#64748b]">Loading vouchers…</p>
          ) : vouchers.length === 0 ? (
            <p className="text-[#64748b]">No vouchers linked to this job.</p>
          ) : (
            <ul className="space-y-2">
              {vouchers.map((v) => (
                <li
                  key={v.id}
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2"
                >
                  <Link
                    className="font-medium text-[var(--color-primary-700)] hover:underline"
                    to={`${VOUCHER_ROUTE_PREFIX}/${v.id}`}
                  >
                    {voucherDisplayNumber(v)}
                  </Link>
                  <span className="ml-2 text-[12px] text-[#64748b]">
                    {v.voucher_type}
                    {v.status ? ` · ${v.status}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate voucher from charges</CardTitle>
        </CardHeader>
        <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
          <label className="block text-[12px] font-medium text-[#64748b]">
            Voucher type
            <select
              className="mt-1 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 py-1.5 text-[13px]"
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value as VoucherType)}
            >
              {VOUCHER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VOUCHER_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[12px] font-medium text-[#64748b]">
            Side
            <select
              className="mt-1 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 py-1.5 text-[13px]"
              value={side}
              onChange={(e) => setSide(e.target.value as 'SALE' | 'COST')}
            >
              <option value="SALE">Sale</option>
              <option value="COST">Cost</option>
            </select>
          </label>
          <Input
            className="sm:col-span-2"
            label="Charges"
            value={chargeIds}
            onChange={(e) => setChargeIds(e.target.value)}
            placeholder="Select charges…"
          />
          {chargeOptions.length > 0 ? (
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              {chargeOptions.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-2 py-1 text-[11px] hover:underline"
                  onClick={() =>
                    setChargeIds((prev) => {
                      const parts = prev
                        .split(/[\s,;]+/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      if (parts.includes(c.id)) return prev;
                      return [...parts, c.id].join(', ');
                    })
                  }
                >
                  {(c.description || c.charge_code || c.id.slice(0, 8)) as string}
                </button>
              ))}
            </div>
          ) : null}
          <Input
            className="sm:col-span-2"
            label="Narration (optional)"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
          <label className="flex items-center gap-2 text-[12px] text-[#64748b]">
            <input
              type="checkbox"
              checked={autoPost}
              onChange={(e) => setAutoPost(e.target.checked)}
            />
            Auto-post draft (balanced GL)
          </label>
          <div className="sm:col-span-2">
            <Button
              type="button"
              size="sm"
              variant="create"
              disabled={actions.generateVoucher.isPending}
              onClick={generate}
            >
              {actions.generateVoucher.isPending ? 'Generating…' : 'Generate voucher'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
