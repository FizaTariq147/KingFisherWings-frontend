/**
 * Honesty layer for JSON shell aliases.
 * Many registry Format-N codes share one canonical layout object — that is FE
 * coverage, not a Fresa requirement for unique designs per code.
 */

import { resolveArrivalLayoutSourceCode } from './arrivalNoticeFormatUiLayouts';
import { resolveDeliveryOrderLayoutSourceCode } from './deliveryOrderFormatUiLayouts';
import { resolveHawbLayoutSourceCode } from './hawbFormatUiLayouts';
import { resolveHblLayoutSourceCode } from './hblFormatUiLayouts';

export type SharedLayoutFamily = 'hbl' | 'hawb' | 'arrival_notice' | 'delivery_order';

export type SharedLayoutSource = {
  requestedCode: string;
  /** Canonical JSON layout code actually used for rendering. */
  layoutSourceCode: string;
  /** True when requestedCode is not the canonical shell. */
  isSharedLayout: boolean;
  family: SharedLayoutFamily;
};

function ownsFamily(code: string, family: SharedLayoutFamily): boolean {
  const c = code.toUpperCase();
  switch (family) {
    case 'arrival_notice':
      return /ARRIVAL_NOTICE|CARGO_ARRIVAL/i.test(c);
    case 'delivery_order':
      return /DELIVERY_ORDER/i.test(c);
    case 'hawb':
      return /^HAWB_/i.test(c);
    case 'hbl':
      return /^HBL_|^FG_HBL_|LEFTOVER_HBL/i.test(c);
    default:
      return false;
  }
}

/**
 * Resolve shared-shell metadata for HBL / HAWB / Arrival / DO codes.
 * Returns null when the code is outside those alias families or has no JSON shell.
 */
export function getSharedLayoutSource(code: string): SharedLayoutSource | null {
  const needle = code.trim().toUpperCase();
  if (!needle) return null;

  const probes: Array<{
    family: SharedLayoutFamily;
    resolve: (c: string) => string | undefined;
  }> = [
    { family: 'arrival_notice', resolve: resolveArrivalLayoutSourceCode },
    { family: 'delivery_order', resolve: resolveDeliveryOrderLayoutSourceCode },
    { family: 'hawb', resolve: resolveHawbLayoutSourceCode },
    { family: 'hbl', resolve: resolveHblLayoutSourceCode },
  ];

  for (const probe of probes) {
    if (!ownsFamily(needle, probe.family)) continue;
    const layoutSourceCode = probe.resolve(needle);
    if (!layoutSourceCode) continue;
    return {
      requestedCode: needle,
      layoutSourceCode,
      isSharedLayout: layoutSourceCode !== needle,
      family: probe.family,
    };
  }
  return null;
}

export function sharedLayoutBadgeLabel(info: SharedLayoutSource): string {
  const short = shortShellLabel(info.layoutSourceCode);
  return `Shares layout with ${short}`;
}

function shortShellLabel(sourceCode: string): string {
  const c = sourceCode.toUpperCase();
  if (c.includes('JASPER')) return 'Format-1 (Jasper)';
  if (c.includes('HKG')) return 'FG HKG shell';
  if (c === 'HAWB_DRAFT_REPORT_FORMAT') return 'HAWB draft shell';
  if (c === 'HBL_DRAFT_REPORT_FORMAT_11') return 'Format-11';
  if (c === 'DELIVERY_ORDER_REPORT_FORMAT_17') return 'Format-17';
  const formatMatch = c.match(/FORMAT[_-]?(\d+)/);
  if (formatMatch) return `Format-${formatMatch[1]}`;
  return sourceCode.replace(/_/g, ' ').slice(0, 42);
}

/** True when this code is a distinct (canonical) layout source, or has no alias family. */
export function isDistinctLayoutCode(code: string): boolean {
  const info = getSharedLayoutSource(code);
  if (!info) return true;
  return !info.isSharedLayout;
}
