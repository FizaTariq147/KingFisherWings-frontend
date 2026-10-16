import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
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
      <Button
        type="button"
        size="sm"
        variant={isFav ? 'warning' : 'secondary'}
        leftIcon={
          <Star
            className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`}
            aria-hidden
          />
        }
        disabled={pending || !targetKey}
        title={isFav ? 'Remove favourite' : 'Add favourite'}
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
        {isFav ? 'Favourited' : 'Favourite'}
      </Button>
      {error ? (
        <p className="mt-1 text-[11px] text-[var(--color-danger-600)]">{error}</p>
      ) : null}
    </div>
  );
}
