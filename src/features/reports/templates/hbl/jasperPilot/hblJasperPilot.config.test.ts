import { describe, expect, it } from 'vitest';
import {
  HBL_JASPER_PILOT_CONFIG,
  HBL_JASPER_PILOT_CODE,
  isHblJasperPilotCode,
  orderedHblJasperPilotSections,
} from './hblJasperPilot.config';
import { mapToHblJasperPilotModel } from './mapToHblJasperPilotModel';
import { getHblFormatSpec, isHblFormatCode } from '../../../constants/hblFormatCatalog';
import { getHblFormatUiLayout, resolveHblLayoutSourceCode } from '../../../data/hblFormatUiLayouts';

describe('HBL Jasper pilot (Phase 3)', () => {
  it('registers the pilot code in the HBL catalogue with the FRESA-REF-0001 sample URL', () => {
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
    expect(isHblFormatCode(HBL_JASPER_PILOT_CODE)).toBe(true);
    const spec = getHblFormatSpec(HBL_JASPER_PILOT_CODE);
    expect(spec?.name).toMatch(/Jasper/i);
    expect(spec?.samplePdfUrl).toContain('hbl-draft-report-fomat-jasper.pdf');
    expect(spec?.variant).toBe('jasper');
  });

  it('resolves its own layout — not FG_HBL_HKG', () => {
    expect(resolveHblLayoutSourceCode(HBL_JASPER_PILOT_CODE)).toBe(HBL_JASPER_PILOT_CODE);
    expect(getHblFormatUiLayout(HBL_JASPER_PILOT_CODE)?.code).toBe(HBL_JASPER_PILOT_CODE);
  });

  it('config is A4 portrait matching the reference MediaBox', () => {
    expect(HBL_JASPER_PILOT_CONFIG.page.widthPt).toBe(595);
    expect(HBL_JASPER_PILOT_CONFIG.page.heightPt).toBe(842);
    expect(HBL_JASPER_PILOT_CONFIG.page.orientation).toBe('portrait');
    expect(HBL_JASPER_PILOT_CONFIG.referenceId).toBe('FRESA-REF-0001');
  });

  it('orders visible sections from config', () => {
    const ids = orderedHblJasperPilotSections().map((s) => s.id);
    expect(ids[0]).toBe('branding');
    expect(ids).toContain('cargoTable');
    expect(ids).toContain('termsAndSignature');
  });

  it('does not fabricate freight or BL number when unbound', () => {
    const model = mapToHblJasperPilotModel(
      { companyName: 'KingFisher Wings' },
      { showPlaceholders: true },
    );
    expect(model.blNumber).toBe('');
    expect(model.freightDetails).toBe('');
    expect(model.containerRows).toEqual([]);
    expect(model.companyName).toBe('KingFisher Wings');
  });

  it('maps real shipment party and routing fields without inventing cargo', () => {
    const model = mapToHblJasperPilotModel(
      {
        entityBound: true,
        companyName: 'KingFisher Wings',
        shipperLines: ['ACME EXPORTERS'],
        consigneeLines: ['BETA IMPORTS'],
        pol: 'CHENNAI',
        pod: 'JEBEL ALI',
        vesselFlight: 'CMA CGM / 9887',
        jobNumber: 'JOB-1',
        referenceNo: 'HBL-99',
        commodity: 'VALVE PARTS',
      },
      { showPlaceholders: false },
    );
    expect(model.shipperLines).toEqual(['ACME EXPORTERS']);
    expect(model.consigneeLines).toEqual(['BETA IMPORTS']);
    expect(model.portOfLoading).toBe('CHENNAI');
    expect(model.portOfDischarge).toBe('JEBEL ALI');
    expect(model.vesselVoyage).toContain('CMA CGM');
    expect(model.jobRef).toBe('JOB-1');
    expect(model.blNumber).toBe('HBL-99');
    expect(model.containerRows[0]?.description).toBe('VALVE PARTS');
    expect(model.freightDetails).toBe('');
  });
});
