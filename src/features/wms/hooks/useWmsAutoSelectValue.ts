import { useEffect, useRef } from 'react';
import { isUuid } from '@/lib/isUuid';

/**
 * Once options finish loading, set the select value if still empty:
 * 1) preferredId when it appears in options
 * 2) otherwise the sole non-empty option (scoped lists for warehouse staff)
 */
export function useWmsAutoSelectValue(
  options: Array<{ value: string; label: string }>,
  value: string,
  onSelect: (next: string) => void,
  preferredId?: string | null,
  isLoading = false,
) {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (isLoading || appliedRef.current) return;
    if (value && isUuid(value)) {
      appliedRef.current = true;
      return;
    }

    const selectable = options.filter((o) => o.value && isUuid(o.value));
    if (!selectable.length) return;

    const preferred =
      preferredId && isUuid(preferredId)
        ? selectable.find((o) => o.value === preferredId)?.value
        : undefined;
    const next = preferred ?? (selectable.length === 1 ? selectable[0].value : undefined);
    if (!next) return;

    appliedRef.current = true;
    onSelect(next);
  }, [options, value, onSelect, preferredId, isLoading]);
}
