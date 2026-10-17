import { Link } from 'react-router-dom';
import { useFavouritesList, useFavouritesMutations } from '@/features/favourites/hooks/useFavourites';
import type { UserFavourite } from '@/features/favourites/services/favourites.service';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { Button } from '@/components/ui/Button';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';

const KIND_ORDER = ['report', 'quotation', 'job', 'shipment', 'enquiry'] as const;

const KIND_LABEL: Record<string, string> = {
  report: 'Reports',
  report_template: 'Reports',
  quotation: 'Quotations',
  job: 'Jobs',
  shipment: 'Shipments',
  enquiry: 'Enquiries',
  party: 'Parties',
  menu: 'Menu',
  other: 'Other',
};

function favouriteHref(fav: UserFavourite): string | null {
  const kind = fav.kind.trim().toLowerCase();
  const id = fav.target_key.trim();
  if (!id) return null;
  switch (kind) {
    case 'enquiry':
      return `/sales/enquiries/${id}`;
    case 'quotation':
      return `/sales/quotations/${id}`;
    case 'shipment':
      return `/operations/shipments/${id}`;
    case 'job':
      return jobDetailPath({ id });
    case 'report':
    case 'report_template':
      return `/reports?code=${encodeURIComponent(id)}`;
    case 'party':
      return `/parties/${id}`;
    default:
      return null;
  }
}

function groupFavourites(items: UserFavourite[]) {
  const groups = new Map<string, UserFavourite[]>();
  for (const item of items) {
    const kind = item.kind.trim().toLowerCase();
    const bucket =
      kind === 'report_template' || kind === 'report'
        ? 'report'
        : KIND_LABEL[kind]
          ? kind
          : 'other';
    const list = groups.get(bucket) ?? [];
    list.push(item);
    groups.set(bucket, list);
  }
  const ordered: { key: string; label: string; items: UserFavourite[] }[] = [];
  for (const key of KIND_ORDER) {
    const itemsFor = groups.get(key);
    if (!itemsFor?.length) continue;
    ordered.push({ key, label: KIND_LABEL[key] || key, items: itemsFor });
    groups.delete(key);
  }
  for (const [key, itemsFor] of groups) {
    if (!itemsFor.length) continue;
    ordered.push({ key, label: KIND_LABEL[key] || key, items: itemsFor });
  }
  return ordered;
}

/** Dashboard favourites — GET /favourites (reports, quotations, jobs, shipments, enquiries). */
export function FavouritesPanel() {
  const query = useFavouritesList(true);
  const { remove } = useFavouritesMutations();
  const groups = groupFavourites(query.data ?? []);

  return (
    <DashCard>
      <DashCardHeader
        title="Favorites"
        subtitle="Starred reports, quotations, jobs, shipments, and enquiries"
        action={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
        }
      />
      {query.isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-10" />
          <DashSkeleton className="h-10" />
        </div>
      ) : query.isError ? (
        <DashEmpty>Unable to load favorites.</DashEmpty>
      ) : groups.length === 0 ? (
        <DashEmpty>
          No favorites yet. Use the star on a report, quotation, job, shipment, or enquiry.
        </DashEmpty>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                {group.label}
              </p>
              <ul className="divide-y divide-[var(--color-neutral-100)] rounded-lg border border-[var(--color-neutral-200)]">
                {group.items.map((fav) => {
                  const href = favouriteHref(fav);
                  const label = fav.label?.trim() || fav.target_key;
                  return (
                    <li
                      key={fav.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      {href ? (
                        <Link
                          to={href}
                          className="min-w-0 truncate font-medium text-[var(--color-neutral-800)] hover:underline"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate font-medium text-[var(--color-neutral-800)]">
                          {label}
                        </span>
                      )}
                      <button
                        type="button"
                        className="shrink-0 text-[11px] text-[var(--color-neutral-400)] hover:text-[var(--color-danger-700)]"
                        disabled={remove.isPending}
                        onClick={() => void remove.mutateAsync(fav.id)}
                        title="Remove favorite"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
}
