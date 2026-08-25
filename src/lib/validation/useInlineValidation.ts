import { useCallback, useState } from 'react';
import type { z } from 'zod';
import { getServerErrorMessage } from './mapApiErrors';
import { parseWithFieldErrors, type FieldErrors } from './parseSchema';

/**
 * Client-side validation for lightweight forms (panels, modals) that don't use RHF.
 * Uses the same Zod schemas as full forms — validate before API calls.
 */
export function useInlineValidation() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const clearField = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback(<T,>(schema: z.ZodType<T>, data: unknown): T | null => {
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
    fieldError,
    runValidated,
  };
}
