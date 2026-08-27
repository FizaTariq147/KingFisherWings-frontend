import { useCallback, useState } from 'react';
import type { z } from 'zod';
import { getServerErrorMessage } from './mapApiErrors';
import { parseWithFieldErrors, type FieldErrors } from './parseSchema';

function clearPathErrors(errors: FieldErrors, path: string): FieldErrors {
  const next = { ...errors };
  for (const key of Object.keys(next)) {
    if (key === path || key.startsWith(`${path}.`)) delete next[key];
  }
  return next;
}

/**
 * Client-side validation for lightweight forms (panels, modals) that don't use RHF.
 * Uses the same Zod schemas as full forms — validate before API calls.
 * After the first submit attempt (or field blur), errors update live while typing.
 */
export function useInlineValidation() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const clearField = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field] && !Object.keys(prev).some((k) => k.startsWith(`${field}.`))) {
        return prev;
      }
      return clearPathErrors(prev, field);
    });
  }, []);

  const validate = useCallback(<T,>(schema: z.ZodType<T>, data: unknown): T | null => {
    setAttempted(true);
    const result = parseWithFieldErrors(schema, data);
    if (result.success) {
      setFieldErrors({});
      setFormError(null);
      return result.data;
    }
    setFieldErrors(result.fieldErrors);
    setFormError(result.message);
    return null;
  }, []);

  /** Re-run full schema validation while the user edits (after first attempt). */
  const revalidate = useCallback(
    <T,>(schema: z.ZodType<T>, data: unknown) => {
      if (!attempted) return;
      const result = parseWithFieldErrors(schema, data);
      if (result.success) {
        setFieldErrors({});
        setFormError(null);
        return;
      }
      setFieldErrors(result.fieldErrors);
      setFormError(result.message);
    },
    [attempted],
  );

  /** Validate a single field path on blur (shows errors while entering, before submit). */
  const validatePath = useCallback((schema: z.ZodType, data: unknown, path: string) => {
    setAttempted(true);
    const result = parseWithFieldErrors(schema, data);
    setFieldErrors((prev) => {
      let next = clearPathErrors(prev, path);
      if (!result.success) {
        for (const [key, msg] of Object.entries(result.fieldErrors)) {
          if (key === path || key.startsWith(`${path}.`)) next[key] = msg;
        }
      }
      return next;
    });
    if (result.success) setFormError(null);
  }, []);

  const fieldError = useCallback((field: string) => fieldErrors[field], [fieldErrors]);

  const runValidated = useCallback(
    async <T,>(
      schema: z.ZodType<T>,
      data: unknown,
      fn: (parsed: T) => Promise<unknown>,
    ): Promise<boolean> => {
      const parsed = validate(schema, data);
      if (!parsed) return false;
      try {
        await fn(parsed);
        setFormError(null);
        return true;
      } catch (err) {
        setFormError(getServerErrorMessage(err));
        return false;
      }
    },
    [validate],
  );

  return {
    fieldErrors,
    formError,
    setFormError,
    clearErrors,
    clearField,
    validate,
    revalidate,
    validatePath,
    fieldError,
    runValidated,
    attempted,
  };
}
