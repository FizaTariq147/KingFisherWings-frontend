/**
 * Phase 0 — catalogue format identity / implementation status for UI honesty.
 * Does not invent layouts. Native Layout requires a dedicated renderer, not mere JSON.
 */
import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { getSharedLayoutSource } from '../data/sharedLayoutSource';
import { getReportEnrichment } from '../registry/reportRegistryV2';
import { isHblJasperPilotCode } from '../templates/hbl/jasperPilot';
import { isOfficialMeasuredNativeCode } from '../templates/official/officialFaceRegistry';
import {
  classifyHawbFormatStatus,
  isOfficialHawbFormatCode,
} from './officialFormatGovernance';
import { hasOfficialSamplePdf } from './preferOfficialSamplePdf';

/** User-facing catalogue status labels (Phase 0). */
export type CatalogFormatStatusId =
  | 'official_sample'
  | 'native_layout'
  | 'shared_layout'
  | 'backend_pack'
  | 'historical_unverified';

export type CatalogFormatStatus = {
  id: CatalogFormatStatusId;
  label: string;
  /** Short explanation for tooltips / footnotes. */
  detail: string;
  /** Canonical shell when this code aliases another layout. */
  layoutSourceCode?: string | null;
};

const LABEL: Record<CatalogFormatStatusId, string> = {
  official_sample: 'Official Sample',
  native_layout: 'Native Layout',
  shared_layout: 'Shared Layout',
  backend_pack: 'Backend Report Pack',
  historical_unverified: 'Historical / Unverified',
};

/**
 * Resolve catalogue honesty status from implementation evidence.
 * Priority: shared shell → native pilot → official sample → pack → historical.
 */
export function resolveCatalogFormatStatus(code: string): CatalogFormatStatus {
  const needle = (code || '').trim();
  if (!needle) {
    return {
      id: 'historical_unverified',
      label: LABEL.historical_unverified,
      detail: 'No format code selected.',
    };
  }

  if (isOfficialMeasuredNativeCode(needle)) {
    return {
      id: 'native_layout',
      label: LABEL.native_layout,
      detail:
        'Freightnest native face measured from the Fresa sample. Generate draws our geometry with organization logo and company name.',
    };
  }

  const shared = getSharedLayoutSource(needle);

  // HAWB extras (not the official five): historical / unverified — still resolvable.
  if (/^HAWB_/i.test(needle) && !isOfficialHawbFormatCode(needle)) {
    const hawb = getHawbFormatSpec(needle);
    return {
      id: 'historical_unverified',
      label: LABEL.historical_unverified,
      detail: hawb?.sampleIsFallback
        ? 'Historical HAWB code — resolvable, but not an official selectable format (shared sample fallback).'
        : `HAWB status: ${classifyHawbFormatStatus(needle)}. Not in the official five-format catalogue.`,
      layoutSourceCode: shared?.layoutSourceCode ?? null,
    };
  }

  if (shared?.isSharedLayout) {
    return {
      id: 'shared_layout',
      label: LABEL.shared_layout,
      detail: `Reuses the layout of ${shared.layoutSourceCode} — not a unique visual design.`,
      layoutSourceCode: shared.layoutSourceCode,
    };
  }

  // Dedicated HBL Jasper pilot document — not generic JSON capture.
  if (isHblJasperPilotCode(needle)) {
    return {
      id: 'native_layout',
      label: LABEL.native_layout,
      detail: 'Dedicated HBL Jasper pilot renderer (independent of shared HBL shells).',
    };
  }

  // Phase 2/3 — five official HAWB native layouts for Freightnest generate.
  // Unbound browse may show unmodified Fresa reference samples (labelled).
  if (isOfficialHawbFormatCode(needle)) {
    return {
      id: 'native_layout',
      label: LABEL.native_layout,
      detail:
        'Freightnest native HAWB layout for Generate. Catalogue browse may open an official Fresa reference sample (not a generated document).',
    };
  }

  // Distinct verified official sample PDF (CDN) — reference browse only (Phase 3).
  if (hasOfficialSamplePdf(needle)) {
    const hawb = getHawbFormatSpec(needle);
    if (!hawb?.sampleIsFallback) {
      return {
        id: 'official_sample',
        label: LABEL.official_sample,
        detail:
          'Official Fresa reference sample available for browse comparison only. Generate must use Freightnest native / template-v2 / JSON / pack — never a stamped Fresa sample as the final PDF.',
      };
    }
  }

  const enrichment = getReportEnrichment(needle);
  if (enrichment?.implementationStatus === 'pack_bound') {
    return {
      id: 'backend_pack',
      label: LABEL.backend_pack,
      detail: enrichment.rendererKeyHint
        ? `Backend pack hint: ${enrichment.rendererKeyHint}. Exact look requires a bound Puppeteer pack.`
        : 'Relies on a backend report pack when bound and activated.',
      layoutSourceCode: enrichment.layoutSourceCode,
    };
  }

  return {
    id: 'historical_unverified',
    label: LABEL.historical_unverified,
    detail:
      'No verified distinct sample or dedicated native renderer. JSON/template presence alone is not a native layout.',
    layoutSourceCode: enrichment?.layoutSourceCode ?? shared?.layoutSourceCode ?? null,
  };
}

/** Preview/generate path honesty (Phase 0 labels — not layout redraw). */
export type CatalogPreviewSourceId =
  | 'official_sample'
  | 'native_layout'
  | 'shared_layout'
  | 'client_layout'
  | 'backend_pack';

export function catalogPreviewSourceLabel(opts: {
  entityBound?: boolean;
  preferOfficialSample?: boolean;
  isNativePilot?: boolean;
  isSharedLayout?: boolean;
  usingBackendPack?: boolean;
}): { id: CatalogPreviewSourceId; label: string; detail: string } {
  if (opts.usingBackendPack) {
    return {
      id: 'backend_pack',
      label: 'Backend Report Pack',
      detail: 'Generated via POST /reports/generate pack.',
    };
  }
  if (opts.isNativePilot) {
    return {
      id: 'native_layout',
      label: 'Native Layout',
      detail: 'Dedicated format renderer (not a shared shell).',
    };
  }
  if (!opts.entityBound && opts.preferOfficialSample) {
    return {
      id: 'official_sample',
      label: 'Official Sample',
      detail:
        'Official Fresa reference sample (unmodified third-party artwork). Not a Freightnest-generated document.',
    };
  }
  if (opts.isSharedLayout) {
    return {
      id: 'shared_layout',
      label: 'Shared Layout',
      detail: 'Rendering an aliased shared shell — not a unique design for this code.',
    };
  }
  return {
    id: 'client_layout',
    label: 'Client Layout',
    detail: 'Client JSON/template preview — not a Fresa pixel-match claim.',
  };
}

export function catalogFormatStatusTone(
  id: CatalogFormatStatusId,
): { bg: string; text: string; border: string } {
  switch (id) {
    case 'official_sample':
      return {
        bg: 'bg-[var(--color-primary-50)]',
        text: 'text-[var(--color-primary-800)]',
        border: 'border-[var(--color-primary-200)]',
      };
    case 'native_layout':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-900',
        border: 'border-emerald-200',
      };
    case 'shared_layout':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-950',
        border: 'border-amber-200',
      };
    case 'backend_pack':
      return {
        bg: 'bg-[var(--color-neutral-100)]',
        text: 'text-[var(--color-neutral-800)]',
        border: 'border-[var(--color-neutral-300)]',
      };
    default:
      return {
        bg: 'bg-[var(--color-neutral-50)]',
        text: 'text-[var(--color-neutral-600)]',
        border: 'border-[var(--color-neutral-200)]',
      };
  }
}
