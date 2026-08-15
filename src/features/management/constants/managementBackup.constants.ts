import type { SavedReportType } from '@/features/glSavedReports/constants/savedReport.constants';
import type { BackupItemConfig } from '../types/management.types';

/** UI backup checklist labels mapped to export / saved-report types. */
export const MANAGEMENT_BACKUP_ITEMS: BackupItemConfig[] = [
  { label: 'Master - COA', kind: 'TRIAL_BALANCE' },
  { label: 'Master - Employee', kind: 'CUSTOM' },
  { label: 'Master - Organization', kind: 'CUSTOM' },
  { label: 'Master - Organization Address', kind: 'CUSTOM' },
  { label: 'Master - Organization Contacts', kind: 'CUSTOM' },
  { label: 'Master - Payroll', kind: 'CUSTOM' },
  { label: 'Report - Balance Sheet Summary', kind: 'BALANCE_SHEET' },
  { label: 'Report - Customer Aging Summary', kind: 'AR_AGING' },
  { label: 'Report - Invoice & Credit Note', kind: 'CUSTOM' },
  { label: 'Report - Job List', kind: 'JOB_PROFITABILITY' },
  { label: 'Report - Profit and Loss Summary', kind: 'PROFIT_AND_LOSS' },
  { label: 'Report - Purchase Invoice & Credit Note', kind: 'CUSTOM' },
  { label: 'Report - Quotation List', kind: 'CUSTOM' },
  { label: 'Report - Shipment List', kind: 'MIS_DASHBOARD' },
  { label: 'Report - Supplier Aging Summary', kind: 'AP_AGING' },
  { label: 'Report - Trial Balance List', kind: 'TRIAL_BALANCE' },
  { label: 'Transactions - AP Outstanding', kind: 'AP_AGING' },
  { label: 'Transactions - AR Outstanding', kind: 'AR_AGING' },
  { label: 'Transactions - GL Journal', kind: 'TRIAL_BALANCE' },
  { label: 'Transactions - VAT IN', kind: 'VAT_RETURN' },
  { label: 'Transactions - VAT OUT', kind: 'VAT_RETURN' },
];

export function backupKindForLabel(label: string): SavedReportType | 'PARTIES_EXPORT' {
  return MANAGEMENT_BACKUP_ITEMS.find((x) => x.label === label)?.kind ?? 'CUSTOM';
}

export const MANAGEMENT_BACKUP_LABELS = MANAGEMENT_BACKUP_ITEMS.map((x) => x.label);
