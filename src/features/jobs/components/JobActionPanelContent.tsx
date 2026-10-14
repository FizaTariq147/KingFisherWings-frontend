import type { CSSProperties } from 'react';
import { JobBillsOfLadingPanel } from './JobBillsOfLadingPanel';
import { JobCargoPanel } from './JobCargoPanel';
import { JobDocumentsPanel } from './JobDocumentsPanel';
import { JobGpumPanel } from './JobGpumPanel/JobGpumPanel';
import { JobInvoicesPanel } from './JobInvoicesPanel';
import { JobLogisticsPanel } from './JobLogisticsPanel';
import { JobMilestonesPanel } from './JobMilestonesPanel';
import { JobNotesPanel } from './JobNotesPanel';
import { JobPnlPanel } from './JobPnlPanel';
import { JobSeaScansPanel } from './JobSeaScansPanel';
import { JobStuffingPanel } from './JobStuffingPanel';
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

/** Distinct solid colors for every Actions toolbar button. */
export const JOB_ACTION_BUTTON_STYLE: Record<JobActionPanelKey, CSSProperties> = {
  documents: { backgroundColor: '#0EA5E9', borderColor: '#0284C7', color: '#FFFFFF' },
  invoices: { backgroundColor: '#0A2942', borderColor: '#061B2C', color: '#FFFFFF' },
  pnl: { backgroundColor: '#A855F7', borderColor: '#7C3AED', color: '#FFFFFF' },
  milestones: { backgroundColor: '#22C55E', borderColor: '#16A34A', color: '#FFFFFF' },
  notes: { backgroundColor: '#F59E0B', borderColor: '#D97706', color: '#FFFFFF' },
  'vendor-offers': { backgroundColor: '#EC4899', borderColor: '#DB2777', color: '#FFFFFF' },
  logistics: { backgroundColor: '#14B8A6', borderColor: '#0D9488', color: '#FFFFFF' },
  gpum: { backgroundColor: '#6366F1', borderColor: '#4F46E5', color: '#FFFFFF' },
  cargo: { backgroundColor: '#8B5CF6', borderColor: '#7C3AED', color: '#FFFFFF' },
  bl: { backgroundColor: '#06B6D4', borderColor: '#0891B2', color: '#FFFFFF' },
  stuffing: { backgroundColor: '#84CC16', borderColor: '#65A30D', color: '#FFFFFF' },
  'sea-scans': { backgroundColor: '#F97316', borderColor: '#EA580C', color: '#FFFFFF' },
  house: { backgroundColor: '#64748B', borderColor: '#475569', color: '#FFFFFF' },
  'cc-details': { backgroundColor: '#10B981', borderColor: '#059669', color: '#FFFFFF' },
  'cc-lines': { backgroundColor: '#0D9488', borderColor: '#0F766E', color: '#FFFFFF' },
  'cc-checklist': { backgroundColor: '#059669', borderColor: '#047857', color: '#FFFFFF' },
  'cc-declaration': { backgroundColor: '#2563EB', borderColor: '#1D4ED8', color: '#FFFFFF' },
  'cc-queries': { backgroundColor: '#7C3AED', borderColor: '#6D28D9', color: '#FFFFFF' },
  'cc-finance': { backgroundColor: '#DB2777', borderColor: '#BE185D', color: '#FFFFFF' },
};

/** Same panels that used to live as Job detail tabs — opened from Actions popups. */
export function JobActionPanelContent({
  panel,
  job,
  jobId,
  houseJobs,
  highlightInvoiceId,
  onOpenHouse,
}: {
  panel: JobActionPanelKey;
  job: Job;
  jobId: string;
  houseJobs: Job[];
  highlightInvoiceId?: string;
  onOpenHouse: (houseJobId: string) => void;
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
    case 'vendor-offers':
      return <JobVendorOffersPanel jobId={jobId} currencyCode={job.currency_code} />;
    case 'logistics':
      return <JobLogisticsPanel jobId={jobId} jobType={job.job_type} />;
    case 'gpum':
      return <JobGpumPanel jobId={jobId} />;
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
