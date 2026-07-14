import type { FieldErrors, FieldValues } from 'react-hook-form';

/** Flatten nested FieldErrors into the first dotted path with a message. */
export function getFirstErrorPath(errors: FieldErrors<FieldValues>): string | null {
  const walk = (node: unknown, prefix: string): string | null => {
    if (!node || typeof node !== 'object') return null;
    const record = node as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message) {
      return prefix || null;
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === 'ref' || key === 'type' || key === 'types' || key === 'message') continue;
      const next = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object') {
        const found = walk(value, next);
        if (found) return found;
      }
    }
    return null;
  };

  return walk(errors, '');
}

/**
 * Scroll to and focus the first invalid control after a failed submit.
 * Complements RHF `shouldFocusError` for custom / nested field names.
 */
export function focusFirstInvalidField(
  errors: FieldErrors<FieldValues>,
  options?: { container?: ParentNode | null },
): void {
  const path = getFirstErrorPath(errors);
  if (!path) return;

  const root = options?.container ?? document;
  const selectors = [
    `[name="${path}"]`,
    `[name="${path.replace(/\./g, '.')}"]`,
    `#${CSS.escape(path)}`,
    `[data-field="${path}"]`,
  ];

  let el: HTMLElement | null = null;
  for (const sel of selectors) {
    try {
      el = root.querySelector(sel) as HTMLElement | null;
    } catch {
      el = null;
    }
    if (el) break;
  }

  // Fallback: first element marked aria-invalid
  if (!el) {
    el = root.querySelector('[aria-invalid="true"]') as HTMLElement | null;
  }

  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (typeof el.focus === 'function') {
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }
}
