import { describe, expect, it } from 'vitest';
import {
  FRESA_OFFICIAL_SECTION_META,
  getFresaOfficialSampleByCode,
  listFresaOfficialSamples,
  listUrlVerifiedFresaSamples,
  summarizeFresaOfficialCatalogue,
} from '../data/fresaOfficialSampleCatalogue';
import { HAWB_FORMAT_CATALOG } from '../constants/hawbFormatCatalog';
import {
  getDeliveryOrderFormatSpec,
  hasDeliveryOrderSamplePdf,
} from '../constants/deliveryOrderFormatCatalog';
import { getWmsFormatSpec, hasWmsSamplePdf } from '../constants/wmsFormatCatalog';
import { shouldPreferOfficialSamplePdf, hasOfficialSamplePdf } from '../utils/preferOfficialSamplePdf';
import { getReportEnrichment } from '../registry';

describe('Fresa official sample catalogue', () => {
  it('lists 401 catalogue entries across sections (not unique designs)', () => {
    const summary = summarizeFresaOfficialCatalogue();
    expect(summary.listedTotal).toBe(401);
    expect(summary.urlVerifiedDirectPdfs).toBe(50);
    expect(summary.note).toContain('not unique');
  });

  it('has 5 HAWB + 5 WMS + 40 DO url_verified rows', () => {
    expect(listFresaOfficialSamples('hawb')).toHaveLength(5);
    expect(listFresaOfficialSamples('wms_asn')).toHaveLength(5);
    expect(listFresaOfficialSamples('delivery_order')).toHaveLength(40);
    expect(listUrlVerifiedFresaSamples()).toHaveLength(50);
    for (const row of listUrlVerifiedFresaSamples()) {
      expect(row.samplePdfUrl).toMatch(/^https:\/\/fresatechnologies\.com\/.+\.pdf$/i);
      expect(row.pageCount).toBeNull();
      expect(row.verificationStatus).toBe('url_verified');
    }
  });

  it('marks pending sections without inventing PDF URLs', () => {
    for (const meta of FRESA_OFFICIAL_SECTION_META) {
      if (meta.verificationStatus === 'pending_url_extraction') {
        expect(listFresaOfficialSamples(meta.section).length).toBe(0);
      }
    }
  });

  it('HAWB catalog URLs match official reference', () => {
    for (const row of HAWB_FORMAT_CATALOG) {
      const official = getFresaOfficialSampleByCode(row.code);
      expect(official?.samplePdfUrl).toBe(row.samplePdfUrl);
    }
  });

  it('WMS core specs expose verified samplePdfUrl', () => {
    expect(hasWmsSamplePdf('ADVANCE_SHIPPING_NOTE_FORMAT_1')).toBe(true);
    expect(getWmsFormatSpec('ADVANCE_SHIPPING_NOTE')?.samplePdfUrl).toContain(
      'ADVANCE_SHIPPING_NOTE.pdf',
    );
    expect(getWmsFormatSpec('ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2')?.samplePdfUrl).toContain(
      'ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf',
    );
  });

  it('DO catalog uses verified sample_reports URLs for reconciled rows', () => {
    expect(getDeliveryOrderFormatSpec('DELIVERY_CONFIRMATION_REPORT_FORMAT')?.samplePdfUrl).toContain(
      'delivery_confirmation_rpm_ref_153.pdf',
    );
    expect(
      getDeliveryOrderFormatSpec('DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT')?.samplePdfUrl,
    ).toContain('fg_delivery_order_air_rpm_ref_377.pdf');
    expect(getDeliveryOrderFormatSpec('PROOF_OF_DELIVERY_REPORT_FORMAT')?.samplePdfUrl).toContain(
      'proof_of_delivery_rpm_ref_275.pdf',
    );
    expect(hasDeliveryOrderSamplePdf('DELIVERY_ORDER_REPORT_FORMAT_17')).toBe(true);
  });

  it('unbound prefers official DO/WMS samples; entityBound blocks', () => {
    expect(hasOfficialSamplePdf('ADVANCE_SHIPPING_NOTE')).toBe(true);
    expect(hasOfficialSamplePdf('DELIVERY_ORDER_REPORT_FORMAT_10')).toBe(true);
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'ADVANCE_SHIPPING_NOTE',
        format: 'PDF',
        entityBound: false,
      }),
    ).toBe(true);
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'DELIVERY_ORDER_REPORT_FORMAT_10',
        format: 'PDF',
        entityBound: true,
      }),
    ).toBe(false);
  });

  it('enrichment marks verified DO/WMS samples; Arrival Format-11 stays shared_shell', () => {
    const doE = getReportEnrichment('DELIVERY_ORDER_REPORT_FORMAT_17');
    // May be absent from 852 registry — skip if not registered.
    if (doE) {
      expect(doE.verificationStatus).toBe('verified_sample');
      expect(doE.implementationStatus).toBe('sample_only');
      expect(doE.reference?.samplePdfUrl).toBeTruthy();
    }

    const wmsE = getReportEnrichment('ADVANCE_SHIPPING_NOTE');
    if (wmsE) {
      expect(wmsE.verificationStatus).toBe('verified_sample');
      expect(wmsE.implementationStatus).toBe('sample_only');
    }

    const arrival = getReportEnrichment('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    expect(arrival?.implementationStatus).toBe('shared_shell');
    expect(arrival?.claimsFresaExactMatch).toBe(false);
  });
});
