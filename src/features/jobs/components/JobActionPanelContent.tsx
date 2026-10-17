import type { CSSProperties } from 'react';
import { JobBillsOfLadingPanel } from './JobBillsOfLadingPanel';
import { JobCargoPanel } from './JobCargoPanel';
import { JobDocumentsPanel } from './JobDocumentsPanel';
import { JobGpumPanel } from './JobGpumPanel/JobGpumPanel';
import { JobInvoicesPanel } from './JobInvoicesPanel';
import { JobLogisticsPanel } from './JobLogisticsPanel';
import { JobMilestonesPanel } from './JobMilestonesPanel';
import { JobNotesPanel } from './JobNotesPanel';
import { OpsContinuumPanel } from '@/features/ops-activity';
import { JobPnlPanel } from './JobPnlPanel';
import { JobSeaScansPanel } from './JobSeaScansPanel';
import { JobStuffingPanel } from './JobStuffingPanel';
import { JobVouchersPanel } from './JobVouchersPanel';
import { JobVendorOffersPanel } from '@/features/vendor-job-offers/components/JobVendorOffersPanel';
import { CcChecklistPanel } from '@/features/customs-clearance/components/CcChecklistPanel';
import { CcDeclarationPanel } from '@/features/customs-clearance/components/CcDeclarationPanel';
import { CcDetailsPanel } from '@/features/customs-clearance/components/CcDetailsPanel';
import { CcFinancePanel } from '@/features/customs-clearance/components/CcFinancePanel';
import { CcLinesPanel } from '@/features/customs-clearance/components/CcLinesPanel';
import { CcQueriesPanel } from '@/features/customs-clearance/components/CcQueriesPanel';
import type { Job } from '../types/job.types';
import type { JobActionPanelKey } from '../utils/jobDetailTabs';
import { jobDisplayNumber } from '../utils/jobRoute';

/** Distinct solid colors for every Actions toolbar button (no sky/blue fills). */
export const JOB_ACTION_BUTTON_STYLE: Record<JobActionPanelKey, CSSProperties> = {
  documents: { backgroundColor: '#14B8A6', borderColor: '#0D9488', color: '#FFFFFF' },
  invoices: { backgroundColor: '#0A2942', borderColor: '#061B2C', color: '#FFFFFF' },
  pnl: { backgroundColor: '#A855F7', borderColor: '#7C3AED', color: '#FFFFFF' },
  milestones: { backgroundColor: '#22C55E', borderColor: '#16A34A', color: '#FFFFFF' },
  notes: { backgroundColor: '#F59E0B', borderColor: '#D97706', color: '#FFFFFF' },
  'ops-continuum': { backgroundColor: '#334155', borderColor: '#1E293B', color: '#FFFFFF' },
  'vendor-offers': { backgroundColor: '#EC4899', borderColor: '#DB2777', color: '#FFFFFF' },
  logistics: { backgroundColor: '#0F766E', borderColor: '#115E59', color: '#FFFFFF' },
  gpum: { backgroundColor: '#8B5CF6', borderColor: '#7C3AED', color: '#FFFFFF' },
  vouchers: { backgroundColor: '#65A30D', borderColor: '#4D7C0F', color: '#FFFFFF' },
  cargo: { backgroundColor: '#D97706', borderColor: '#B45309', color: '#FFFFFF' },
  bl: { backgroundColor: '#F97316', borderColor: '#EA580C', color: '#FFFFFF' },
  stuffing: { backgroundColor: '#84CC16', borderColor: '#65A30D', color: '#FFFFFF' },
  'sea-scans': { backgroundColor: '#EA580C', borderColor: '#C2410C', color: '#FFFFFF' },
  house: { backgroundColor: '#64748B', borderColor: '#475569', color: '#FFFFFF' },
  'cc-details': { backgroundColor: '#10B981', borderColor: '#059669', color: '#FFFFFF' },
  'cc-lines': { backgroundColor: '#0D9488', borderColor: '#0F766E', color: '#FFFFFF' },
  'cc-checklist': { backgroundColor: '#059669', borderColor: '#047857', color: '#FFFFFF' },
  'cc-declaration': { backgroundColor: '#7C3AED', borderColor: '#6D28D9', color: '#FFFFFF' },
  'cc-queries': { backgroundColor: '#DB2777', borderColor: '#BE185D', color: '#FFFFFF' },
  'cc-finance': { backgroundColor: '#BE185D', borderColor: '#9D174D', color: '#FFFFFF' },
};

/** Same panels that used to live as Job detail tabs — opened from Actions popups. */
export function JobActionPanelContent({
  panel,
  job,
  jobId,
  houseJobs,
  highlightInvoiceId,
  onOpenHouse,
  lifecycleLinks,
}: {
  panel: JobActionPanelKey;
  job: Job;
  jobId: string;
  houseJobs: Job[];
  highlightInvoiceId?: string;
  onOpenHouse: (houseJobId: string) => void;
  /** Prefer resolved enquiry/quotation/shipment ids from Job detail. */
  lifecycleLinks?: {
    enquiryId?: string | null;
    quotationId?: string | null;
    shipmentId?: string | null;
    jobId?: string | null;
  };
}) {
  switch (panel) {
    case 'documents':
      return <JobDocumentsPanel jobId={jobId} jobType={job.job_type} />;
    case 'invoices':
      return (
        <JobInvoicesPanel
          jobId={jobId}
          job={job}
          highlightInvoiceId={highlightInvoiceId}
        />
      );
    case 'pnl':
      return <JobPnlPanel jobId={jobId} />;
    case 'milestones':
      return <JobMilestonesPanel jobId={jobId} />;
    case 'notes':
      return <JobNotesPanel jobId={jobId} />;
    case 'ops-continuum':
      return (
        <OpsContinuumPanel
          entityType="JOB"
          entityId={jobId}
          opsContinuum={job.ops_continuum}
          links={{
            enquiryId: lifecycleLinks?.enquiryId ?? job.enquiry_id,
            quotationId: lifecycleLinks?.quotationId ?? job.quotation_id,
            shipmentId: lifecycleLinks?.shipmentId ?? job.shipment_id,
            jobId: lifecycleLinks?.jobId ?? job.id ?? jobId,
          }}
        />
      );
    case 'vendor-offers':
      return <JobVendorOffersPanel jobId={jobId} currencyCode={job.currency_code} />;
    case 'logistics':
      return <JobLogisticsPanel jobId={jobId} jobType={job.job_type} />;
    case 'gpum':
      return <JobGpumPanel jobId={jobId} />;
    case 'vouchers':
      return <JobVouchersPanel jobId={jobId} job={job} />;
    case 'cargo':
      return <JobCargoPanel jobId={jobId} />;
    case 'bl':
      return <JobBillsOfLadingPanel jobId={jobId} />;
    case 'stuffing':
      return <JobStuffingPanel jobId={jobId} />;
    case 'sea-scans':
      return <JobSeaScansPanel jobId={jobId} />;
    case 'house':
      return (
        <ul className="space-y-2 text-sm">
          {houseJobs.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className="underline text-[var(--color-primary-600)]"
                onClick={() => onOpenHouse(h.id)}
              >
                {jobDisplayNumber(h)}
              </button>
            </li>
          ))}
        </ul>
      );
    case 'cc-details':
      return <CcDetailsPanel jobId={jobId} />;
    case 'cc-lines':
      return <CcLinesPanel jobId={jobId} />;
    case 'cc-checklist':
      return <CcChecklistPanel jobId={jobId} />;
    case 'cc-declaration':
      return <CcDeclarationPanel jobId={jobId} />;
    case 'cc-queries':
      return <CcQueriesPanel jobId={jobId} />;
    case 'cc-finance':
      return <CcFinancePanel jobId={jobId} />;
    default:
      return null;
  }
}
