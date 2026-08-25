import { z } from 'zod';

export type FieldErrors = Record<string, string>;

/** Flatten Zod issues into a field → message map (first error per field). */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function parseWithFieldErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; fieldErrors: FieldErrors; message: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const fieldErrors = zodFieldErrors(result.error);
  const message =
    Object.values(fieldErrors)[0] ?? 'Please correct the highlighted fields.';
  return { success: false, fieldErrors, message };
}
