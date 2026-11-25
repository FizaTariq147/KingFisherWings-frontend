import { REPORT_BRANDING_SLOTS } from './brandingSlots.generated';
import type { ReportBrandingSlots } from './officialFace.types';

const BY_CODE = new Map(
  REPORT_BRANDING_SLOTS.map((row) => [row.code.toUpperCase(), row]),
);

const ALIAS_STRIP =
  /(_REF|_BOOKING_CONFIRMATION|_XLSX|_COPY|_V\d+)$/i;

function aliasCandidates(code: string): string[] {
  const raw = code.trim().toUpperCase();
  const out = new Set<string>([raw]);
  let cursor = raw;
  for (let i = 0; i < 3; i += 1) {
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
