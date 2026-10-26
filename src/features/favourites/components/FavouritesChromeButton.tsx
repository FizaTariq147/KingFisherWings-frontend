import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAVOURITES_CHROME_BTN_CLASS } from '../constants/favouritesChrome';

type FavouritesChromeButtonProps = {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Accessible name when used as icon-adjacent control. */
  label?: string;
};

/**
 * Decorative / nav Favorites control used on list pages.
 * Visual parity with /sales/shipments-list.
 */
export function FavouritesChromeButton({
  className,
  onClick,
  disabled,
  label = 'Favorites',
}: FavouritesChromeButtonProps) {
  return (
    <button
      type="button"
      className={cn(FAVOURITES_CHROME_BTN_CLASS, className)}
      onClick={onClick}
      disabled={disabled}
    >
      <Heart size={14} aria-hidden className="shrink-0" />
      {label}
    </button>
  );
}
