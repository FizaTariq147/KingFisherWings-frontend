import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import type { OfficialFaceData } from '../../templates/official/officialFace.types';

/** Deterministic org chrome for pilot (never Fresa identity). */
export const PILOT_ORG = {
  companyName: 'Zoyan Logistics',
  companyAddress: 'Suite 1204, Business Bay Tower, Dubai, UAE',
  companyPhone: '+971541266616',
  companyEmail: 'ops@zoyan-pilot.example',
  companyWeb: 'https://zoyan-pilot.example',
} as const;

const LONG_NAME =
  'International Consolidated Freight Forwarding And Supply Chain Partners Limited Liability Company';
const LONG_ADDR =
  'Building 17, Floor 9, Unit 904-B, Industrial Area Phase 2 Extension Road Near Interchange 7, Opposite Warehouse Complex Block C, Dubai United Arab Emirates PO Box 123456';

export type PilotFixtureId = 'base' | 'long_party' | 'minimal' | 'multi_cargo' | 'large_numbers';

export function pilotHawbFixture(id: PilotFixtureId): InvoiceFormatPdfData {
  const org = { ...PILOT_ORG, entityBound: true as const };
  switch (id) {
    case 'long_party':
      return {
        ...org,
        carrier: 'EMIRATES',
        mawbNo: '176-99998888',
        hawbNo: 'JBPILOT202600001',
        shipperLines: [LONG_NAME, LONG_ADDR, 'Dubai, AE', '+971500000001'],
        consigneeLines: [LONG_NAME, LONG_ADDR, 'Karachi, PK'],
        pieces: '48',
        grossWeight: '1250.75',
        measurement: '1250.75',
        commodity: 'General merchandise STC: mixed consumer goods CTN 1-48',
        pol: 'AEDXB',
        pod: 'PKKHI',
        currencyCode: 'AED',
        declaredCarriage: 'N.V.D.',
        insurance: 'NIL',
      };
    case 'minimal':
      return {
        ...org,
        entityBound: true,
        hawbNo: 'JBPILOT-MIN',
        mawbNo: '',
        shipperLines: ['Shipper Co'],
        consigneeLines: ['Consignee Co'],
        pieces: '',
        grossWeight: '',
        commodity: '',
        pol: '',
        pod: '',
      };
    case 'multi_cargo':
      return {
        ...org,
        carrier: 'EMIRATES',
        mawbNo: '176-88887777',
        hawbNo: 'JBPILOT-MCARGO',
        shipperLines: ['Pilot Shipper LLC', 'Dubai, AE'],
        consigneeLines: ['Pilot Consignee LLC', 'Sharjah, AE'],
        pieces: '100',
        grossWeight: '2500',
        measurement: '2400',
        commodity:
          'STC: PAPER CUPS\nCTN 1-40\nSTC: PLASTIC LIDS\nCTN 41-100\nDIMS IN CMS: 40x30x20',
        pol: 'AEAUH',
        pod: 'OMSLL',
        currencyCode: 'USD',
        declaredCarriage: 'N.V.D.',
        insurance: 'NIL',
      };
    case 'large_numbers':
      return {
        ...org,
        carrier: 'EMIRATES',
        mawbNo: '176-11112222',
        hawbNo: 'JBPILOT-BIG',
        shipperLines: ['Big Volume Exporter', 'Chennai, IN'],
        consigneeLines: ['Big Volume Importer', 'Dubai, AE'],
        pieces: '9999',
        grossWeight: '99999.99',
        measurement: '88888.88',
        commodity: 'BULK COMMODITY',
        pol: 'INMAA',
        pod: 'AEDXB',
        currencyCode: 'INR',
        declaredCarriage: '999999.00',
        insurance: '500000.00',
      };
    case 'base':
    default:
      return {
        ...org,
        carrier: 'EMIRATES',
        mawbNo: '176-99998888',
        hawbNo: 'JBPILOT202600010',
        shipperLines: [
          'Hassan Ahmed',
          'house no p33, street 06, Peoples colony no 2, faisalabad, Pakistan',
          'Faisalabad, AE',
        ],
        consigneeLines: ['Hafsa Anwaar', 'Faisalabad, PK'],
        pieces: '10',
        grossWeight: '100',
        measurement: '100',
        commodity: 'General merchandise',
        pol: 'AEAUH',
        pod: 'AUABP',
        currencyCode: 'AED',
        declaredCarriage: 'N.V.D.',
        insurance: 'NIL',
      };
  }
}

export function pilotInvoiceFaceData(id: PilotFixtureId): OfficialFaceData {
  const org = { ...PILOT_ORG, entityBound: true as const, printedBy: PILOT_ORG.companyEmail };
  switch (id) {
    case 'long_party':
      return {
        ...org,
        invoiceNumber: 'INV-PILOT-LONG-001',
        jobNumber: 'JOB-PILOT-LONG',
        billToLines: [LONG_NAME, LONG_ADDR, 'Dubai, UAE'],
        shipperLines: [LONG_NAME, LONG_ADDR, 'Chennai, India'],
        consigneeLines: [LONG_NAME, LONG_ADDR, 'Sharjah, UAE'],
        companyName: `${LONG_NAME} Trading Division`,
      };
    case 'minimal':
      return {
        ...org,
        invoiceNumber: 'INV-MIN',
        entityBound: true,
        billToLines: ['Client'],
        shipperLines: [],
        consigneeLines: [],
      };
    case 'multi_cargo':
      return {
        ...org,
        invoiceNumber: 'INV-PILOT-ROWS-001',
        jobNumber: 'JOB-PILOT-ROWS',
        billToLines: ['Pilot Bill To LLC', 'Dubai, UAE'],
        shipperLines: ['Pilot Shipper', 'India'],
        consigneeLines: ['Pilot Consignee', 'UAE'],
        // nature / packages used where stamps exist
        packagesLine: 'TOTAL : (48) PACKAGES ONLY',
        nature: 'Line items simulated via nature stamps\nItem A\nItem B\nItem C',
      };
    case 'large_numbers':
      return {
        ...org,
        invoiceNumber: 'INV-9999999999',
        jobNumber: 'JOB-999999',
        billToLines: ['Enterprise Client LLC', 'Dubai, UAE'],
        shipperLines: ['Enterprise Shipper', 'India'],
        consigneeLines: ['Enterprise Consignee', 'UAE'],
        total: '9999999.99',
        rateCharge: '1234567.89',
      };
    case 'base':
    default:
      return {
        ...org,
        invoiceNumber: 'INV-PILOT-1001',
        jobNumber: 'JOB-PILOT-42',
        billToLines: ['LIVE BILLTO LLC', 'Dubai, UAE'],
        shipperLines: ['LIVE SHIPPER CO', 'Chennai, India'],
        consigneeLines: ['LIVE CONSIGNEE LLC', 'Sharjah, UAE'],
        hawbNo: 'HAWB-PILOT-1',
        hblNo: 'HBL-PILOT-1',
        mawbNo: 'MAWB-PILOT-1',
      };
  }
}
