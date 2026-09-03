function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/** Build multipart body for portal/vendor payment proof upload. */
export function buildPaymentProofFormData(
  file: File,
  fields: Record<string, string | undefined>,
): FormData {
  const form = new FormData();
  appendFields(form, fields);
  form.append('file', file, file.name);
  return form;
}
