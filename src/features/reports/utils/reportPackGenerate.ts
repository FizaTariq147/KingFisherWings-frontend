import { reportCatalogService } from '../services/reportCatalog.service';
import type {
  ReportExportFormat,
  ReportGenerateRequest,
  ReportJob,
} from '../types/reportCatalog.types';
import { reportRendererStatus } from '../types/reportCatalog.types';
import type { ReportContextIds } from './reportParameterUtils';
import {
  downloadExtensionForFormat,
  hasReportEntityContext,
  mergeReportContextIds,
} from './reportParameterUtils';
import {
  orgChromeToPackParameters,
  resolveReportOrgChrome,
} from './resolveReportOrgChrome';
import { buildFresaPackGenerateParams } from './fresaPackGenerateParams';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isReportPackReady(template: {
  renderer_key?: string;
  is_active?: boolean;
}): boolean {
  if (!template.is_active) return false;
  return reportRendererStatus(template) === 'ready';
}

/**
 * POST /reports/generate → poll job → download blob.
 * Used by catalog Generate (live pack) and job Documents when pack is active.
 * Always injects registered org name/logo into parameters for pack headers.
 */
export async function generateAndDownloadReportPack(opts: {
  code: string;
  templateId?: string;
  format?: ReportExportFormat;
  parameters?: Record<string, unknown>;
  context?: ReportContextIds | null;
  pollMs?: number;
  timeoutMs?: number;
}): Promise<{ blob: Blob; job: ReportJob; fileExt: string }> {
  const contextIds = mergeReportContextIds(opts.context, null);
  const entityBound = hasReportEntityContext(contextIds);
  const format = (opts.format ?? 'PDF') as ReportExportFormat;

  let orgParams: Record<string, unknown> = {};
  try {
    const chrome = await resolveReportOrgChrome();
    orgParams = orgChromeToPackParameters(chrome);
  } catch {
    /* packs still generate; BE may resolve org from tenant */
  }

  const dto: ReportGenerateRequest = {
    code: opts.code,
    template_id: opts.templateId,
    format,
    parameters: {
      ...orgParams,
      ...buildFresaPackGenerateParams(opts.code),
      ...(opts.parameters ?? {}),
    },
    context: entityBound
      ? {
          job_id: contextIds.job_id,
          quotation_id: contextIds.quotation_id,
          invoice_id: contextIds.invoice_id,
          party_id: contextIds.party_id,
          shipment_id: contextIds.shipment_id,
        }
      : undefined,
  };

  let job = await reportCatalogService.generate(dto);
  const deadline = Date.now() + (opts.timeoutMs ?? 90_000);
  const pollMs = opts.pollMs ?? 1200;

  while (job.status === 'queued' || job.status === 'running') {
    if (Date.now() > deadline) {
      throw new Error('Report generate timed out waiting for the backend pack.');
    }
    await sleep(pollMs);
    job = await reportCatalogService.getJob(job.id);
  }

  if (job.status === 'failed') {
    throw new Error(job.error || 'Report generate failed on the backend.');
  }
  if (job.status !== 'ready') {
    throw new Error(`Unexpected report job status: ${job.status}`);
  }

  const blob = await reportCatalogService.download(job.id);
  return {
    blob,
    job,
    fileExt: downloadExtensionForFormat(job.format ?? format),
  };
}
