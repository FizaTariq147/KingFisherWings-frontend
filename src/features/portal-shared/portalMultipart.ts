import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';

function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/**
 * POST JSON when there is no file. With a file, send multipart.
 * Swagger marks create/reply as multipart but omits the binary field name —
 * Nest commonly uses `file` or `attachment`. Retry the other name on 400/422.
 */
export async function postPortalWithOptionalFile(
  url: string,
  fields: Record<string, string | undefined>,
  file?: File,
) {
  if (!file) {
    return portalApiClient.post<unknown>(url, fields);
  }

  const attempt = (field: string) => {
    const form = new FormData();
    appendFields(form, fields);
    form.append(field, file, file.name);
    return portalApiClient.post<unknown>(url, form);
  };

  try {
    return await attempt('file');
  } catch (err) {
    if (err instanceof PortalApiError && (err.status === 400 || err.status === 422)) {
      return attempt('attachment');
    }
    throw err;
  }
}
