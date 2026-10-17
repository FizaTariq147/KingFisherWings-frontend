/**
 * Drop generate-shipment / generate-job path hints unless the matching
 * actions.can_generate_* flag is explicitly true.
 */
export function filterGenerationPathHints(
  pathHints: string[] | undefined,
  actions?: {
    can_generate_shipment?: boolean;
    can_generate_job?: boolean;
  } | null,
): string[] | undefined {
  if (!pathHints?.length) return pathHints;

  const filtered = pathHints.filter((hint) => {
    const key = hint.trim().toLowerCase().replace(/-/g, '_');
    if (
      key === 'generate_shipment' ||
      key === 'generate_shipments' ||
      key.includes('generate_shipment')
    ) {
      return actions?.can_generate_shipment === true;
    }
    if (key === 'generate_job' || key.includes('generate_job')) {
      return actions?.can_generate_job === true;
    }
    return true;
  });

  return filtered.length ? filtered : undefined;
}
