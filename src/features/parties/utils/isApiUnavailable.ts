/** True when the route is missing (backend not shipped yet) or not implemented. */
export function isApiUnavailable(error: unknown): boolean {
  const status = (error as { response?: { status?: number }; status?: number })?.response?.status
    ?? (error as { status?: number }).status;
  return status === 404 || status === 501;
}
