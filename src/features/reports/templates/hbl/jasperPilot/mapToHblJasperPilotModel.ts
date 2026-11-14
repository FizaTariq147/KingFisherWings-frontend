import type { BlDraftClassicModel } from '@/features/shared/bl-draft/BlDraftClassicDocument';
import { buildBlDraftClassicModel } from '@/features/shared/bl-draft/generateBlDraftPdf';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';

export type HblJasperPilotModel = BlDraftClassicModel & {
  /** When true, empty cells may show a quiet placeholder for layout browsing. */
  showPlaceholders: boolean;
  pageLabel: string;
  /** Registered organization logo URL — empty when unavailable. */
  logoUrl: string;
};

function cleanScalar(value: string): string {
  const v = (value || '').trim();
  if (!v || v === '—') return '';
  return v;
}

function cleanLines(lines: string[]): string[] {
  return lines.map((l) => String(l || '').trim()).filter((l) => l && l !== '—');
}

/**
 * Map FreightNest catalogue / shipment context into the Jasper pilot model.
 * Uses the existing BL classic data contract — does not invent endpoints or demo cargo.
 * Missing values stay blank (no fabricated PREPAID / DRAFT / em-dash fillers).
 */
export function mapToHblJasperPilotModel(
  contextData: InvoiceFormatPdfData = {},
  options: { preview?: unknown; showPlaceholders?: boolean } = {},
): HblJasperPilotModel {
  const showPlaceholders = Boolean(options.showPlaceholders);
  const raw = buildBlDraftClassicModel(options.preview, contextData);
  const hasPreview = options.preview != null;

  const blNumber = cleanScalar(raw.blNumber === 'DRAFT' && !hasPreview ? '' : raw.blNumber);
  const jobRef = cleanScalar(raw.jobRef);
  const placeOfReceipt = cleanScalar(raw.placeOfReceipt);
  const portOfLoading = cleanScalar(raw.portOfLoading);
  const preCarriage = cleanScalar(raw.preCarriage);
  const vesselVoyage = cleanScalar(raw.vesselVoyage);
  const portOfDischarge = cleanScalar(raw.portOfDischarge);
  const placeOfDelivery = cleanScalar(raw.placeOfDelivery);
  // Classic defaults numberOfBls to 1(ONE) — keep only when preview/API provided it.
  const numberOfBls = hasPreview
    ? cleanScalar(raw.numberOfBls)
    : cleanScalar(raw.numberOfBls === '1(ONE)' ? '' : raw.numberOfBls);
  const onboardDate = cleanScalar(raw.onboardDate);
  const placeAndDateOfIssue = cleanScalar(raw.placeAndDateOfIssue);
  const carrierName = cleanScalar(raw.carrierName);
  const preparedBy = cleanScalar(raw.preparedBy);

  // Classic builder invents "FREIGHT PREPAID PAYABLE AT …" — omit unless preview supplied freight.
  let freightDetails = '';
  if (hasPreview) {
    freightDetails = cleanScalar(raw.freightDetails);
  }

  let containerRows = (raw.containerRows || [])
    .map((r) => ({
      marks: cleanScalar(r.marks),
      packages: cleanScalar(r.packages),
      description: cleanScalar(r.description),
      weight: cleanScalar(r.weight),
      measurement: cleanScalar(r.measurement),
    }))
    .filter(
      (r) => r.marks || r.packages || r.description || r.weight || r.measurement,
    );

  // Commodity-only row when shipment has description but no container lines.
  if (!containerRows.length && contextData.commodity?.trim()) {
    containerRows = [
      {
        marks: '',
        packages: '',
        description: contextData.commodity.trim(),
        weight: '',
        measurement: '',
      },
    ];
  }

  return {
    blNumber,
    jobRef,
    agentName:
      cleanScalar(raw.agentName) || cleanScalar(contextData.companyName || '') || '',
    agentLines: cleanLines(raw.agentLines),
    preparedBy,
    shipperLines: cleanLines(raw.shipperLines),
    consigneeLines: cleanLines(raw.consigneeLines),
    notifyLines: cleanLines(raw.notifyLines),
    placeOfReceipt,
    portOfLoading,
    preCarriage,
    vesselVoyage,
    portOfDischarge,
    placeOfDelivery,
    numberOfBls,
    containerRows,
    totalInWords: hasPreview ? cleanScalar(raw.totalInWords) : '',
    onboardDate,
    freightDetails,
    placeAndDateOfIssue,
    carrierName,
    companyName: cleanScalar(contextData.companyName || '') || cleanScalar(raw.companyName) || '',
    showPlaceholders,
    pageLabel: '1 / 1',
    logoUrl: cleanScalar(contextData.logoUrl || ''),
  };
}
