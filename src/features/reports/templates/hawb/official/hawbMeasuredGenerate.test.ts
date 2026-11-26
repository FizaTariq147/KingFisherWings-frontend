import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from '../../official/generateOfficialMeasuredPdf';
import { getOfficialMeasuredFace } from '../../official/officialFaceRegistry';
import { OFFICIAL_HAWB_FORMAT_CODES } from '../../../utils/officialFormatGovernance';
import { mergeHawbCatalogPreviewFixture } from './hawbOfficialCatalogFixture';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../qa/phase2-hawb-fixtures/measured',
);

describe('HAWB measured Generate (vector Fresa geometry)', () => {
  it.each(OFFICIAL_HAWB_FORMAT_CODES)(
    '%s measured PDF matches MediaBox and stamps org + cargo without Fresa identity',
    { timeout: 30000 },
    async (code) => {
      const face = getOfficialMeasuredFace(code);
      expect(face).toBeTruthy();
      const data = mergeHawbCatalogPreviewFixture({
        companyName: 'KingFisher Wings LLC',
        companyAddress: 'Dubai, UAE',
        companyPhone: '+971-4-000-0000',
        entityBound: false,
      });
      const { blob } = await generateOfficialMeasuredPdf(code, {
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        entityBound: false,
        shipperLines: data.shipperLines,
        consigneeLines: data.consigneeLines,
        notifyLines: data.notifyLines,
        hawbNo: data.hawbNo,
        mawbNo: data.mawbNo,
        jobNumber: data.jobNumber,
        pieces: data.pieces,
        grossWeight: data.grossWeight,
        chargeableWeight: data.measurement,
        nature: String(data.commodity || '')
          .split(/\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 2)
          .join('\n'),
        handling: data.handling,
        accounting: data.accounting,
        packagesLine: `TOTAL : (${data.pieces}) PACKAGES ONLY`,
        departure: data.pol,
        destination: data.pod,
        flightDate: data.vesselFlight,
        toCode: 'DXB',
        currency: data.currencyCode,
        declaredCarriage: data.declaredCarriage,
        declaredCustoms:
          data.declaredCustoms ||
          (/_FORMAT_2$/i.test(code) || /REPORT_FORMAT_2$/i.test(code) ? 'N.C.V' : 'AS PER INV'),
        insurance: data.insurance,
        carrier: data.carrier,
        byCarrier:
          String(data.vesselFlight || '').match(/[A-Z]{2}\d{2,4}/i)?.[0]?.toUpperCase() ||
          'EK9876',
        executedOn: data.invoiceDate,
        executedAt: data.executedAt,
        total: data.total,
        prepaidMark: 'PP',
        carrierSign: `AS AGENT FOR THE CARRIER, ${data.carrier}`,
      });

      mkdirSync(OUT, { recursive: true });
      const outPath = join(OUT, `${face!.code}-measured.pdf`);
      writeFileSync(outPath, Buffer.from(await blob.arrayBuffer()));

      const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      expect(doc.numPages).toBe(face!.pageCount);
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      expect(Math.round(viewport.width)).toBe(Math.round(face!.widthPt));
      expect(Math.round(viewport.height)).toBe(Math.round(face!.heightPt));
      const content = await page.getTextContent();
      const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
      expect(text.toLowerCase()).not.toContain('fresa');
      expect(text).toMatch(/KingFisher|GLOBAL EXPORT|HOUSE AIR|Air Waybill|Shipper|HAWB/i);
      await doc.destroy();
    },
  );
});
