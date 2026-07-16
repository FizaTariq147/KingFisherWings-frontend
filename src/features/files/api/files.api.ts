/** Files REST — Swagger tag Files, GET /files/{tenantId}/{filename} (Bearer JWT). */
export const FILES_API = {
  download: (tenantId: string, filename: string) =>
    `/files/${encodeURIComponent(tenantId)}/${encodeFilePathSegment(filename)}`,
} as const;

/** Encode each path segment so nested slashes in filenames stay valid. */
function encodeFilePathSegment(filename: string): string {
  return filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}
