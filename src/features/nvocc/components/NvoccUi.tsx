import { Loader2 } from 'lucide-react';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { nvoccLabel } from '../constants/nvocc.constants';

export function NvoccStatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const tone =
    status === 'ACTIVE' || status === 'OPEN' || status === 'NEW' || status === 'CONFIRMED'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : status === 'CANCELLED' || status === 'LOST' || status === 'INACTIVE'
        ? 'bg-red-50 text-red-700 ring-red-200'
        : 'bg-sky-50 text-sky-700 ring-sky-200';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {nvoccLabel(status)}
    </span>
  );
}

export function NvoccListState({
  loading,
  error,
  empty,
  emptyMessage = 'No records found.',
}: {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-red-600">
        {extractAxiosErrorDetail(error)}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  return null;
}

export const nvoccThClass = 'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500';
export const nvoccTdClass = 'px-4 py-2 text-sm text-gray-700';
