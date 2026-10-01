import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import { Button } from '@/components/ui/Button';

type PlatformBillingListPagerProps = {
  meta?: PortalPaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
};

export function PlatformBillingListPager({ meta, page, onPageChange }: PlatformBillingListPagerProps) {
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total;

  if (totalPages <= 1 && !total) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
      <p className="text-xs text-[var(--color-neutral-500)]">
        Page {page}
        {total != null ? ` · ${total} total` : ''}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
