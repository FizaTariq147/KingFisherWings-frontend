import { REPORT_BRANDING_SLOTS } from './brandingSlots.generated';
import type {
  OfficialMeasuredFace,
  ReportBrandingBox,
  ReportBrandingSlots,
} from './officialFace.types';

const BY_CODE = new Map(
  REPORT_BRANDING_SLOTS.map((row) => [row.code.toUpperCase(), row]),
);

/** Fresa Format-1 style logo box when a face has no measured logo slot. */
export function defaultFresaLogoSlot(
  widthPt: number,
  heightPt: number,
  rotateDeg = 0,
): ReportBrandingBox {
  if (rotateDeg === 90 || rotateDeg === 270) {
    return { x: 24, y: 32, width: 54, height: 40 };
  }
  return {
    x: 24,
    y: Math.max(8, heightPt - 56),
    width: 82,
    height: 40,
  };
}

/** Right-aligned company name band matching classic Fresa tax-invoice letterhead. */
export function defaultFresaCompanySlot(
  widthPt: number,
  heightPt: number,
  rotateDeg = 0,
  logo?: ReportBrandingBox | null,
): ReportBrandingBox {
  if (rotateDeg === 90 || rotateDeg === 270) {
    const startY = round((logo?.y || 32) + 80);
    return {
      x: round((logo?.x || 24) + 12),
      y: startY,
      width: Math.min(420, Math.max(120, heightPt - startY - 24)),
      height: 12,
      size: 11,
      color: '#0F4D96',
      align: 'right',
    };
  }
  const y = logo
    ? round(logo.y + (logo.height || 40) - 4)
    : round(heightPt - 30);
  return {
    x: round(widthPt - 220 - 24),
    y,
    width: 220,
    height: 12,
    size: 12,
    color: '#0F4D96',
    align: 'right',
  };
}

/** Portrait Fresa footer strip: Printed By | Printed Date | Page. */
export function defaultFresaFooterSlots(
  widthPt: number,
): ReportBrandingSlots['footer'] {
  return {
    printedByLabel: {
      x: 24,
      y: 22,
      width: 48,
      height: 7,
      size: 7,
      color: '#000000',
    },
    printedByValue: {
      x: 76,
      y: 22,
      width: 120,
      height: 7,
      size: 7,
      color: '#101010',
    },
    printedDateLabel: {
      x: 226,
      y: 22,
      width: 55,
      height: 7,
      size: 7,
      color: '#000000',
    },
    printedDateValue: {
      x: 284,
      y: 22,
      width: 100,
      height: 7,
      size: 7,
      color: '#101010',
    },
    pageLabel: {
      x: Math.max(420, widthPt - 90),
      y: 22,
      width: 70,
      height: 7,
      size: 7,
      color: '#000000',
    },
    poweredByWipe: {
      x: Math.max(360, widthPt - 200),
      y: 20,
      width: 160,
      height: 11,
      size: 7,
    },
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function emptyFooter(): ReportBrandingSlots['footer'] {
  return {
    printedByLabel: null,
    printedByValue: null,
    printedDateLabel: null,
    printedDateValue: null,
    pageLabel: null,
    poweredByWipe: null,
  };
}

function footerHasChrome(footer: ReportBrandingSlots['footer'] | undefined): boolean {
  if (!footer) return false;
  return Boolean(
    footer.printedByLabel ||
      footer.printedByValue ||
      footer.printedDateLabel ||
      footer.printedDateValue ||
      footer.pageLabel,
  );
}

/**
 * Guarantee logo + company + footer chrome so every measured PDF paints
 * Fresa-aligned letterhead. Ocean HBL never invents a top-left logo (Shipper).
 */
export function ensureReportBrandingChrome(
  slots: ReportBrandingSlots | undefined,
  face: Pick<OfficialMeasuredFace, 'code' | 'widthPt' | 'heightPt' | 'rotateDeg'>,
): ReportBrandingSlots {
  const rotateDeg = Number(face.rotateDeg) || 0;
  const isHbl = /^(HBL_|FG_HBL_)/i.test(face.code);
  let base: ReportBrandingSlots = slots
    ? {
        ...slots,
        addressLines: slots.addressLines || [],
        companyWipes: slots.companyWipes || [],
        footer: slots.footer || emptyFooter(),
      }
    : {
        code: face.code,
        logo: null,
        company: null,
        addressLines: [],
        companyWipes: [],
        headerBand: null,
        footer: emptyFooter(),
      };

  if (!base.logo && !isHbl) {
    base = {
      ...base,
      logo: defaultFresaLogoSlot(face.widthPt, face.heightPt, rotateDeg),
    };
  }

  if (!base.company && !isHbl) {
    base = {
      ...base,
      company: defaultFresaCompanySlot(
        face.widthPt,
        face.heightPt,
        rotateDeg,
        base.logo,
      ),
    };
  }

  if (!footerHasChrome(base.footer)) {
    base = {
      ...base,
      footer:
        rotateDeg === 90 || rotateDeg === 270
          ? emptyFooter()
          : defaultFresaFooterSlots(face.widthPt),
    };
  }

  return base;
}

/** @deprecated Prefer ensureReportBrandingChrome — kept for call-site compatibility. */
export function ensureBrandingLogoSlot(
  slots: ReportBrandingSlots | undefined,
  face: Pick<OfficialMeasuredFace, 'code' | 'widthPt' | 'heightPt' | 'rotateDeg'>,
): ReportBrandingSlots {
  return ensureReportBrandingChrome(slots, face);
}

const ALIAS_STRIP =
  /(_REF|_BOOKING_CONFIRMATION|_XLSX|_COPY|_V\d+|_(?:RPM_)?REF_\d+)$/i;

function aliasCandidates(code: string): string[] {
  const raw = code.trim().toUpperCase();
  const out = new Set<string>([raw]);
  let cursor = raw;
  for (let i = 0; i < 4; i += 1) {
    const next = cursor.replace(ALIAS_STRIP, '');
    if (next === cursor) break;
    out.add(next);
    cursor = next;
  }
  // BOOKING_CONFIRMATION_REPORT_FORMAT_1_BOOKING_CONFIRMATION → FORMAT_1
  const doubled = raw.match(/^(.*_FORMAT_\d+)_\1$/);
  if (doubled) out.add(doubled[1]);
  const formatDup = raw.match(/^(.*?_FORMAT_\d+)_[A-Z0-9_]+$/);
  if (formatDup) out.add(formatDup[1]);
  // CONTAINER_LOAD_PLAN_REPORT_20FORMAT → CONTAINER_LOAD_PLAN_REPORT_FORMAT
  const twentyFmt = raw.match(/^(.*_REPORT)_(\d+)FORMAT$/);
  if (twentyFmt) out.add(`${twentyFmt[1]}_FORMAT`);
  // DELIVERY_ORDER_FORMAT16_HOUSE_… → DELIVERY_ORDER_REPORT_FORMAT_16
  const doFmt = raw.match(/^DELIVERY_ORDER_FORMAT_?(\d+)/);
  if (doFmt) out.add(`DELIVERY_ORDER_REPORT_FORMAT_${Number(doFmt[1])}`);
  // FG_DELIVERY_ORDER_AIR_FORMAT1_… → FG_DELIVERY_ORDER_AIR_FORMAT_1
  const fgAir = raw.match(/^(FG_DELIVERY_ORDER_AIR_FORMAT)_?(\d+)/);
  if (fgAir) out.add(`${fgAir[1]}_${Number(fgAir[2])}`);
  // ADVANCE_SHIPPING_NOTE_LOCATION_* → ADVANCE_SHIPPING_NOTE
  if (raw.startsWith('ADVANCE_SHIPPING_NOTE')) out.add('ADVANCE_SHIPPING_NOTE');
  return [...out];
}

function longestPrefixMatch(code: string): ReportBrandingSlots | undefined {
  let best: ReportBrandingSlots | undefined;
  let bestLen = 0;
  for (const row of REPORT_BRANDING_SLOTS) {
    const key = row.code.toUpperCase();
    if (code.startsWith(key) || key.startsWith(code)) {
      const len = Math.min(code.length, key.length);
      if (len > bestLen && len >= 16) {
        best = row;
        bestLen = len;
      }
    }
  }
  return best;
}

export function getReportBrandingSlots(code: string): ReportBrandingSlots | undefined {
  for (const candidate of aliasCandidates(code)) {
    const hit = BY_CODE.get(candidate);
    if (hit) return hit;
  }
  return longestPrefixMatch(code.trim().toUpperCase());
}

export function listReportBrandingSlots(): readonly ReportBrandingSlots[] {
  return REPORT_BRANDING_SLOTS;
}
