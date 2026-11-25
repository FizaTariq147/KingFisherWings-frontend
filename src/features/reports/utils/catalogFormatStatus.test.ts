import { describe, expect, it } from 'vitest';
import { listHawbFormats, getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { isDistinctLayoutCode } from '../data/sharedLayoutSource';
import { isHblJasperPilotCode } from '../templates/hbl/jasperPilot';
import {
  catalogPreviewSourceLabel,
  resolveCatalogFormatStatus,
} from './catalogFormatStatus';
import { filterCatalogStripRows } from './filterCatalogStripRows';

describe('catalogFormatStatus (Phase 0)', () => {
  it('marks the flow tax invoice as a native flow renderer', () => {
    const status = resolveCatalogFormatStatus('INVOICE_FLOW_TAX_INVOICE_1');
    expect(status.id).toBe('native_layout');
    expect(status.label).toBe('Native Layout');
    expect(status.detail).toMatch(/flow renderer/i);
  });

  it('marks HBL Jasper as Native Layout', () => {
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
    const status = resolveCatalogFormatStatus('HBL_DRAFT_REPORT_FORMAT_JASPER');
    expect(status.id).toBe('native_layout');
    expect(status.label).toBe('Native Layout');
  });

  it('marks official HAWB codes as Native Layout (Phase 2) — still exactly five', () => {
    for (const row of listHawbFormats()) {
      const status = resolveCatalogFormatStatus(row.code);
      expect(status.id, row.code).toBe('native_layout');
      expect(isDistinctLayoutCode(row.code)).toBe(true);
    }
    expect(listHawbFormats()).toHaveLength(5);
  });

  it('marks historical HAWB Format-3 as Historical / Unverified and still resolvable', () => {
    const status = resolveCatalogFormatStatus('HAWB_DRAFT_REPORT_FORMAT_3');
    expect(status.id).toBe('historical_unverified');
    expect(getHawbFormatSpec('HAWB_DRAFT_REPORT_FORMAT_3')?.code).toBe(
      'HAWB_DRAFT_REPORT_FORMAT_3',
    );
  });

  it('marks aliased HBL / Arrival codes as Shared Layout', () => {
    const hbl = resolveCatalogFormatStatus('HBL_DRAFT_REPORT_FORMAT_3');
    expect(hbl.id).toBe('shared_layout');
    expect(hbl.layoutSourceCode).toBe('HBL_DRAFT_REPORT_FORMAT_11');

    const arrival = resolveCatalogFormatStatus('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    expect(arrival.id).toBe('shared_layout');
    expect(arrival.layoutSourceCode).toContain('JASPER');
  });

  it('does not treat mere JSON/template families as Native Layout', () => {
    const status = resolveCatalogFormatStatus('INVOICE_REPORT_FORMAT_10');
    expect(status.id).not.toBe('native_layout');
  });

  it('preview source labels distinguish sample vs native vs shared', () => {
    expect(
      catalogPreviewSourceLabel({ preferOfficialSample: true, entityBound: false }).id,
    ).toBe('official_sample');
    expect(catalogPreviewSourceLabel({ isNativePilot: true }).id).toBe('native_layout');
    expect(catalogPreviewSourceLabel({ isSharedLayout: true, entityBound: true }).id).toBe(
      'shared_layout',
    );
  });

  it('distinctLayoutsOnly filter hides shared shells but keeps selection', () => {
    const rows = [
      { code: 'HBL_DRAFT_REPORT_FORMAT_11', name: 'Format 11' },
      { code: 'HBL_DRAFT_REPORT_FORMAT_3', name: 'Format 3' },
    ];
    const hidden = filterCatalogStripRows(rows, { distinctLayoutsOnly: true });
    expect(hidden.items.map((r) => r.code)).toEqual(['HBL_DRAFT_REPORT_FORMAT_11']);

    const kept = filterCatalogStripRows(rows, {
      distinctLayoutsOnly: true,
      selectedCode: 'HBL_DRAFT_REPORT_FORMAT_3',
    });
    expect(kept.items.some((r) => r.code === 'HBL_DRAFT_REPORT_FORMAT_3')).toBe(true);
  });
});
