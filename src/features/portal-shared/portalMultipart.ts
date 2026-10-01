import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';

function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/**
 * POST as multipart FormData. Portal message create is documented as multipart;
 * JSON-only posts often persist subject but drop/truncate `body`, which breaks
 * Ops inbox autofill of customer booking forms.
 */
export async function postPortalWithOptionalFile(
  url: string,
  fields: Record<string, string | undefined>,
  file?: File,
) {
  const attempt = (fileField?: string) => {
    const form = new FormData();
    appendFields(form, fields);
    if (file && fileField) {
      form.append(fileField, file, file.name);
    }
    return portalApiClient.post<unknown>(url, form);
  };

  if (!file) {
    return attempt();
  }

  try {
    return await attempt('file');
  } catch (err) {
    if (err instanceof PortalApiError && (err.status === 400 || err.status === 422)) {
      return attempt('attachment');
    }
    throw err;
  }
}
