import {
  useForm,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { withAppFormDefaults } from './formDefaults';
import { focusFirstInvalidField } from './focusFirstError';
import { applyServerErrors, type ServerErrorMapOptions } from './mapApiErrors';

/**
 * App-wide form hook: RHF defaults + helpers for invalid submit UX and API errors.
 * Prefer this over raw `useForm` for new forms.
 */
export function useAppForm<TFieldValues extends FieldValues = FieldValues>(
  props: UseFormProps<TFieldValues> = {},
): UseFormReturn<TFieldValues> & {
  handleValidatedSubmit: (
    onValid: SubmitHandler<TFieldValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  applyApiErrors: (error: unknown, options?: ServerErrorMapOptions<TFieldValues>) => string | null;
} {
  const form = useForm<TFieldValues>(withAppFormDefaults(props));

  const handleValidatedSubmit = (
    onValid: SubmitHandler<TFieldValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ) =>
    form.handleSubmit(onValid, (errors, event) => {
      focusFirstInvalidField(errors);
      onInvalid?.(errors, event);
    });

  const applyApiErrors = (
    error: unknown,
    options?: ServerErrorMapOptions<TFieldValues>,
  ) => applyServerErrors(form.setError, error, options);

  return {
    ...form,
    handleValidatedSubmit,
    applyApiErrors,
  };
}
