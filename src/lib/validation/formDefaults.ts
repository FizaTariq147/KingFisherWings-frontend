import type { UseFormProps, FieldValues } from 'react-hook-form';

/**
 * Default react-hook-form behaviour for the whole app.
 * - Validate on blur (first touch)
 * - Revalidate on change after an error exists
 * - Focus first invalid field on submit (RHF built-in)
 */
export const APP_FORM_DEFAULTS = {
  mode: 'onTouched' as const,
  reValidateMode: 'onChange' as const,
  shouldFocusError: true,
  criteriaMode: 'firstError' as const,
};

export function withAppFormDefaults<TFieldValues extends FieldValues>(
  props: UseFormProps<TFieldValues> = {},
): UseFormProps<TFieldValues> {
  return {
    ...APP_FORM_DEFAULTS,
    ...props,
  };
}
