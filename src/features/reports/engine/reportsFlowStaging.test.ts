import { describe, expect, it } from 'vitest';
import { FLOW_INVOICE_OPTIONS, listFlowCatalogEntries } from '../flow/invoiceFlowOptions';
import { reportsFlowStagingAdminFlag, reportsFlowStagingCatalogAllowed } from './reportsFlowStaging';

describe('flow staging catalogue gate', () => {
  it('marks credit and debit flow codes as staging-only', () => {
    expect(FLOW_INVOICE_OPTIONS.CREDIT_NOTE_FLOW_1.stagingOnly).toBe(true);
    expect(FLOW_INVOICE_OPTIONS.DEBIT_NOTE_FLOW_1.stagingOnly).toBe(true);
    expect(FLOW_INVOICE_OPTIONS.CREDIT_NOTE_FLOW_1.catalogName).toBe(
      'staging only: no real records tested',
    );
    expect(FLOW_INVOICE_OPTIONS.DEBIT_NOTE_FLOW_1.catalogName).toBe(
      'staging only: no real records tested',
    );
  });

  it('requires soft gate AND admin flag for staging catalogue', () => {
    expect(reportsFlowStagingCatalogAllowed({ gate: 'hard', stagingFlag: '1' })).toBe(false);
    expect(reportsFlowStagingCatalogAllowed({ gate: 'soft', stagingFlag: '' })).toBe(false);
    expect(reportsFlowStagingCatalogAllowed({ gate: 'soft', stagingFlag: '1' })).toBe(true);
    expect(reportsFlowStagingAdminFlag('true')).toBe(true);
  });

  it('listFlowCatalogEntries omits CN/DN when staging is off', () => {
    const codes = listFlowCatalogEntries().map((row) => row.code);
    // Default vitest env has no VITE_REPORTS_FLOW_STAGING=1 and gate is soft.
    expect(codes).toContain('INVOICE_FLOW_TAX_INVOICE_1');
    expect(codes).toContain('QUOTATION_FLOW_1');
    if (!reportsFlowStagingCatalogAllowed()) {
      expect(codes).not.toContain('CREDIT_NOTE_FLOW_1');
      expect(codes).not.toContain('DEBIT_NOTE_FLOW_1');
    }
  });
});
