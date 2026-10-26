import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavouritesList, useFavouritesMutations } from '@/features/favourites/hooks/useFavourites';
import type { UserFavourite } from '@/features/favourites/services/favourites.service';
import { FAVOURITES_PANEL_SURFACE_CLASS } from '@/features/favourites/constants/favouritesChrome';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { cn } from '@/lib/utils';
import { DashCard, DashSkeleton } from './DashCard';

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
    <DashCard className={cn(FAVOURITES_PANEL_SURFACE_CLASS)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Heart size={16} className="shrink-0 fill-current text-white" aria-hidden />
            <h3 className="text-sm font-semibold text-white">Favorites</h3>
          </div>
          <p className="mt-0.5 text-[11px] text-white/85">
            Starred reports, quotations, jobs, shipments, and enquiries
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded border border-white/40 bg-white/15 px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-50"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh
        </button>
      </div>
      {query.isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-10 bg-white/20" />
          <DashSkeleton className="h-10 bg-white/20" />
        </div>
      ) : query.isError ? (
        <p className="rounded-xl bg-white/10 px-3 py-6 text-center text-sm text-white/90">
          Unable to load favorites.
        </p>
      ) : groups.length === 0 ? (
        <p className="rounded-xl bg-white/10 px-3 py-6 text-center text-sm text-white/90">
          No favorites yet. Use the heart on a report, quotation, job, shipment, or enquiry.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                {group.label}
              </p>
              <ul className="divide-y divide-white/15 rounded-lg border border-white/25 bg-white/10">
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
                          className="min-w-0 truncate font-medium text-white hover:underline"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate font-medium text-white">{label}</span>
                      )}
                      <button
                        type="button"
                        className="shrink-0 text-[11px] text-white/70 hover:text-white"
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
