import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export type ServerErrorMapOptions<T extends FieldValues> = {
  /** Map backend field names → form field paths */
  fieldMap?: Record<string, Path<T>>;
  /** Called for non-field / global messages */
  onRoot?: (message: string) => void;
  /** Also set RHF root error */
  setRootError?: boolean;
};

type NestMessageObject = {
  property?: string;
  field?: string;
  constraints?: Record<string, string>;
  message?: string | string[];
  children?: NestMessageObject[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function collectMessages(message: unknown): string[] {
  if (!message) return [];
  if (typeof message === 'string' && message.trim()) return [message.trim()];
  if (Array.isArray(message)) {
    return message.flatMap((m) => collectMessages(m)).filter(Boolean);
  }
  return [];
}

/**
 * Extract NestJS / class-validator style field errors from an Axios (or similar) error.
 * Returns `{ fieldErrors, formError }` where formError is a general banner message.
 */
export function parseServerValidationError(error: unknown): {
  fieldErrors: Record<string, string>;
  formError: string | null;
} {
  const fieldErrors: Record<string, string> = {};
  let formError: string | null = null;

  const axiosLike = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const data = axiosLike.response?.data;
  const record = asRecord(data);

  if (!record) {
    if (error instanceof Error && error.message) {
      return { fieldErrors, formError: error.message };
    }
    return { fieldErrors, formError: axiosLike.message || 'Request failed' };
  }

  const status = axiosLike.response?.status;
  if (status === 403) {
    return { fieldErrors, formError: 'You do not have permission to perform this action.' };
  }
  if (status === 401) {
    return { fieldErrors, formError: 'Your session expired. Please sign in again.' };
  }

  const message = record.message ?? record.error;

  // Array of constraint strings or objects
  if (Array.isArray(message)) {
    for (const item of message) {
      if (typeof item === 'string') {
        // "email must be an email" → try to infer field
        const inferred = item.match(/^([a-zA-Z0-9_]+)\s/);
        if (inferred?.[1] && !fieldErrors[inferred[1]]) {
          fieldErrors[inferred[1]] = item;
        } else {
          formError = formError ? `${formError}; ${item}` : item;
        }
        continue;
      }
      const obj = item as NestMessageObject;
      const prop = obj.property || obj.field;
      if (prop) {
        const constraintMsg =
          (obj.constraints && Object.values(obj.constraints)[0]) ||
          (typeof obj.message === 'string' ? obj.message : null) ||
          collectMessages(obj.message)[0] ||
          'Invalid value';
        fieldErrors[prop] = constraintMsg;
      } else {
        const msgs = collectMessages(obj.message ?? item);
        if (msgs.length) formError = formError ? `${formError}; ${msgs.join('; ')}` : msgs.join('; ');
      }
    }
  } else if (typeof message === 'string' && message.trim()) {
    formError = message.trim();
    // Duplicate key heuristics
    if (/already exists|duplicate|unique/i.test(message)) {
      const codeMatch = message.match(/\b(code|email|slug|iban|account_number)\b/i);
      if (codeMatch?.[1]) {
        fieldErrors[codeMatch[1].toLowerCase()] = message;
      }
    }
  }

  // errors: { email: ['...'], name: '...' }
  const errorsObj = asRecord(record.errors);
  if (errorsObj) {
    for (const [key, val] of Object.entries(errorsObj)) {
      if (typeof val === 'string') fieldErrors[key] = val;
      else if (Array.isArray(val) && val[0]) fieldErrors[key] = String(val[0]);
    }
  }

  if (!formError && Object.keys(fieldErrors).length === 0) {
    formError =
      (typeof record.error === 'string' && record.error) ||
      axiosLike.message ||
      'Request failed';
  }

  return { fieldErrors, formError };
}

/**
 * Apply parsed server errors onto a react-hook-form instance.
 * Returns the residual banner message (if any).
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  options: ServerErrorMapOptions<T> = {},
): string | null {
  const { fieldErrors, formError } = parseServerValidationError(error);
  const map = options.fieldMap ?? {};

  let applied = 0;
  for (const [serverField, message] of Object.entries(fieldErrors)) {
    const path = (map[serverField] ?? serverField) as Path<T>;
    try {
      setError(path, { type: 'server', message });
      applied += 1;
    } catch {
      // unknown path — fold into form error
    }
  }

  const rootMessage =
    formError ||
    (applied === 0 && Object.keys(fieldErrors).length
      ? Object.values(fieldErrors).join('; ')
      : null);

  if (rootMessage && options.setRootError !== false && applied === 0) {
    setError('root' as Path<T>, { type: 'server', message: rootMessage });
  }
  options.onRoot?.(rootMessage ?? '');

  return rootMessage;
}

/** Plain string for banners when not using RHF setError. */
export function getServerErrorMessage(error: unknown): string {
  const { fieldErrors, formError } = parseServerValidationError(error);
  if (formError) return formError;
  const first = Object.values(fieldErrors)[0];
  return first || 'Request failed';
}
