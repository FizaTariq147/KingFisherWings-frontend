import { vendorApiClient, VendorApiError } from '@/lib/vendorApiClient';

function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

export async function postVendorWithOptionalFile(
  url: string,
  fields: Record<string, string | undefined>,
  file?: File,
) {
  if (!file) {
    return vendorApiClient.post<unknown>(url, fields);
  }

  const attempt = (field: string) => {
    const form = new FormData();
    appendFields(form, fields);
    form.append(field, file, file.name);
    return vendorApiClient.post<unknown>(url, form);
  };

  try {
    return await attempt('file');
  } catch (err) {
    if (err instanceof VendorApiError && (err.status === 400 || err.status === 422)) {
      return attempt('pdf');
    }
    throw err;
  }
}
