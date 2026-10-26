import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { FAVOURITES_CHROME_BTN_CLASS } from '../constants/favouritesChrome';
import { useFavouriteCheck, useFavouritesMutations } from '../hooks/useFavourites';
import { toFavouriteKind } from '../utils/favouriteKind';

export function FavouriteToggle({
  kind,
  targetKey,
  label,
  className = '',
}: {
  /** Accepted as enquiry/job/… or ENQUIRY/JOB — sent lowercase to the API. */
  kind: string;
  targetKey: string;
  label?: string;
  className?: string;
}) {
  const apiKind = toFavouriteKind(kind);
  const check = useFavouriteCheck(apiKind, targetKey, Boolean(targetKey));
  const mutations = useFavouritesMutations();
  const [error, setError] = useState<string | null>(null);

  const isFav = check.data?.is_favourite === true;
  const pending = mutations.toggle.isPending || check.isFetching;

  return (
    <div className={className}>
      <button
        type="button"
        className={cn(FAVOURITES_CHROME_BTN_CLASS, 'h-7 px-3 text-[12px]')}
        disabled={pending || !targetKey}
        title={isFav ? 'Remove favourite' : 'Add favourite'}
        aria-pressed={isFav}
        onClick={() => {
          setError(null);
          void mutations.toggle
            .mutateAsync({
              kind: apiKind,
              target_key: targetKey,
              ...(label?.trim() ? { label: label.trim() } : {}),
            })
            .catch((err) => setError(getErrorMessage(err)));
        }}
      >
        <Heart
          size={14}
          aria-hidden
          className={cn('shrink-0', isFav ? 'fill-current' : '')}
        />
        {isFav ? 'Favourited' : 'Favourite'}
      </button>
      {error ? (
        <p className="mt-1 text-[11px] text-[var(--color-danger-600)]">{error}</p>
      ) : null}
    </div>
  );
}
