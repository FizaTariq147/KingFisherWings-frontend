export type JobDocumentPdfMeta = {
  documentTitle: string;
  documentSubtitle: string;
  detailsSectionTitle: string;
  numberLabel: string;
  dateLabel?: string;
  copyLabel?: string;
};

/** Human labels for document type (modal titles only — PDF body comes from API). */
const DOC_META_BY_KEY: Record<string, JobDocumentPdfMeta> = {
  hawb: {
    documentTitle: 'HAWB',
    documentSubtitle: 'HOUSE AIR WAYBILL',
    detailsSectionTitle: 'HAWB DETAILS',
    numberLabel: 'HAWB No.',
  },
  mawb: {
    documentTitle: 'MAWB',
    documentSubtitle: 'MASTER AIR WAYBILL',
    detailsSectionTitle: 'MAWB DETAILS',
    numberLabel: 'MAWB No.',
  },
  hbl: {
    documentTitle: 'HBL',
    documentSubtitle: 'HOUSE BILL OF LADING',
    detailsSectionTitle: 'HBL DETAILS',
    numberLabel: 'HBL No.',
  },
  mbl: {
    documentTitle: 'MBL',
    documentSubtitle: 'MASTER BILL OF LADING',
    detailsSectionTitle: 'MBL DETAILS',
    numberLabel: 'MBL No.',
  },
  can: {
    documentTitle: 'CAN',
    documentSubtitle: 'CARGO ARRIVAL NOTICE',
    detailsSectionTitle: 'NOTICE DETAILS',
    numberLabel: 'CAN No.',
  },
  'delivery-order': {
    documentTitle: 'DELIVERY ORDER',
    documentSubtitle: 'DELIVERY ORDER',
    detailsSectionTitle: 'DO DETAILS',
    numberLabel: 'DO No.',
  },
  'cc-entry-pack': {
    documentTitle: 'ENTRY PACK',
    documentSubtitle: 'CUSTOMS ENTRY PACK',
    detailsSectionTitle: 'ENTRY PACK',
    numberLabel: 'Pack No.',
  },
};

const DOC_META_BY_TYPE: Record<string, JobDocumentPdfMeta> = {
  HAWB: DOC_META_BY_KEY.hawb!,
  MAWB: DOC_META_BY_KEY.mawb!,
  HBL: DOC_META_BY_KEY.hbl!,
  MBL: DOC_META_BY_KEY.mbl!,
  CAN: DOC_META_BY_KEY.can!,
  DELIVERY_ORDER: DOC_META_BY_KEY['delivery-order']!,
};

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

export function resolveJobDocumentPdfMeta(
  keyOrType: string,
  fallbackLabel?: string,
): JobDocumentPdfMeta {
  const raw = String(keyOrType || '').trim();
  if (!raw && fallbackLabel) {
    return {
      documentTitle: fallbackLabel.toUpperCase(),
      documentSubtitle: fallbackLabel.toUpperCase(),
      detailsSectionTitle: 'DOCUMENT',
      numberLabel: 'Doc No.',
    };
  }
  const byKey = DOC_META_BY_KEY[normalizeKey(raw)] || DOC_META_BY_KEY[raw];
  if (byKey) return byKey;
  const byType = DOC_META_BY_TYPE[raw.toUpperCase().replace(/[\s-]+/g, '_')];
  if (byType) return byType;

  const title = (fallbackLabel || raw || 'DOCUMENT').replace(/[_-]+/g, ' ').toUpperCase();
  return {
    documentTitle: title.slice(0, 28),
    documentSubtitle: title,
    detailsSectionTitle: 'DOCUMENT',
    numberLabel: 'Doc No.',
  };
}
