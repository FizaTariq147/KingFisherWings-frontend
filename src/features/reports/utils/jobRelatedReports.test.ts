import { describe, expect, it } from 'vitest';
import type { RegisteredFormatCatalogEntry } from '../data/resolveAnyFormatUiLayout';
import { filterJobRelatedReports } from './jobRelatedReports';

const entries: RegisteredFormatCatalogEntry[] = [
  {
    code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
    name: 'HBL Draft',
    family: 'sea_docs',
    contexts: ['job'],
    kind: 'hbl',
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_2',
    name: 'HAWB Draft 2',
    family: 'air_docs',
    contexts: ['job'],
    kind: 'hawb',
  },
  {
    code: 'INVOICE_ONLY',
    name: 'Invoice only',
    family: 'commercial',
    contexts: ['invoice'],
    kind: 'invoice',
  },
  {
    code: 'JOB_LIST_SUMMARY_REPORT_FORMAT',
    name: 'Job List Summary',
    family: 'ops_list',
    contexts: ['job', 'list'],
    kind: 'ops',
  },
];

describe('filterJobRelatedReports', () => {
  it('keeps sea and ops formats for an FCL job and drops invoice-only rows', () => {
    const rows = filterJobRelatedReports(entries, { jobType: 'SEA_FCL' });
    const codes = rows.map((row) => row.code);
    expect(codes).toContain('HBL_DRAFT_REPORT_FORMAT_JASPER');
    expect(codes).toContain('JOB_LIST_SUMMARY_REPORT_FORMAT');
    expect(codes).not.toContain('INVOICE_ONLY');
    expect(codes).not.toContain('HAWB_DRAFT_REPORT_FORMAT_2');
  });

  it('keeps the official HAWB for an air job', () => {
    const rows = filterJobRelatedReports(entries, { jobType: 'AIR' });
    expect(rows.map((row) => row.code)).toContain('HAWB_DRAFT_REPORT_FORMAT_2');
    expect(rows.map((row) => row.code)).not.toContain('HBL_DRAFT_REPORT_FORMAT_JASPER');
  });

  it('filters by name', () => {
    const rows = filterJobRelatedReports(entries, { jobType: 'SEA_FCL', query: 'hbl' });
    expect(rows.map((row) => row.code)).toEqual(['HBL_DRAFT_REPORT_FORMAT_JASPER']);
  });
});
