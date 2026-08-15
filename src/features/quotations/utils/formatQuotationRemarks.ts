/** Replace portal-user UUID in auto-generated remarks with a readable name. */
const PORTAL_SUBMIT_REMARK_RE =
  /Submitted via customer portal by user\s+[0-9a-f-]{8}-[0-9a-f-]{4}-[1-5][0-9a-f-]{3}-[89ab][0-9a-f-]{3}-[0-9a-f-]{12}\.?/gi;

export function formatQuotationRemarks(
  remarks?: string,
  opts?: { contactName?: string; createdByName?: string },
): string | undefined {
  if (!remarks?.trim()) return remarks;
  const name = opts?.contactName?.trim() || opts?.createdByName?.trim();
  if (!name) return remarks;
  return remarks.replace(PORTAL_SUBMIT_REMARK_RE, `Submitted via customer portal by ${name}.`);
}
