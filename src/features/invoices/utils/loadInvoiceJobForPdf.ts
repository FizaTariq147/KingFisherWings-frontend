import { isUuid } from '@/lib/isUuid';
import { enrichJobsWithDisplayNames } from '@/features/customers/utils/resolveCustomerDisplayNames';
import { jobService } from '@/features/jobs/services/job.service';
import type { Job, JobContainer } from '@/features/jobs/types/job.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function normalizeJobContainer(raw: unknown): JobContainer | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id);
  if (!id) return null;
  return {
    id,
    container_type_id: str(r.container_type_id) || str(r.containerTypeId) || '',
    container_number: str(r.container_number) || str(r.containerNumber) || str(r.number),
    seal_number: str(r.seal_number) || str(r.sealNumber),
    gross_weight:
      r.gross_weight != null || r.grossWeight != null
        ? Number(r.gross_weight ?? r.grossWeight)
        : undefined,
    cbm: r.cbm != null || r.volume_cbm != null ? Number(r.cbm ?? r.volume_cbm) : undefined,
  };
}

/**
 * Load a job for invoice PDF shipment details:
 * GET /jobs/:id + containers + port/vessel display enrichment.
 * Returns null when jobId is missing/invalid or fetch fails.
 */
export async function loadInvoiceJobForPdf(jobId?: string | null): Promise<Job | null> {
  const id = String(jobId || '').trim();
  if (!isUuid(id)) return null;

  try {
    const job = await jobService.getById(id);
    let containers: JobContainer[] = [];
    try {
      const rawContainers = await jobService.listContainers(id);
      containers = rawContainers
        .map(normalizeJobContainer)
        .filter((c): c is JobContainer => Boolean(c));
    } catch {
      /* containers optional */
    }

    const withContainers: Job = {
      ...job,
      containers: containers.length ? containers : job.containers,
    };

    const [enriched] = await enrichJobsWithDisplayNames([withContainers]);
    return enriched ?? withContainers;
  } catch {
    return null;
  }
}
