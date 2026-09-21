/** Remember CONVERTED when booking→job succeeds but API still returns APPROVED. */

const STORAGE_KEY = 'kfw.quotationConverted.v1';

type Entry = { jobId?: string; at: number };

function readMap(): Record<string, Entry> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Entry>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, Entry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function rememberQuotationConverted(quotationId: string, jobId?: string) {
  if (!quotationId) return;
  const map = readMap();
  map[quotationId] = { jobId: jobId || undefined, at: Date.now() };
  writeMap(map);
  try {
    window.dispatchEvent(
      new CustomEvent('kfw-quotation-converted', {
        detail: { id: quotationId, jobId },
      }),
    );
  } catch {
    /* ignore */
  }
}

export function clearQuotationConverted(quotationId: string) {
  if (!quotationId) return;
  const map = readMap();
  if (!(quotationId in map)) return;
  delete map[quotationId];
  writeMap(map);
}

export function getRememberedQuotationConverted(
  quotationId: string,
): Entry | null {
  if (!quotationId) return null;
  return readMap()[quotationId] ?? null;
}

export function isRememberedQuotationConverted(quotationId: string): boolean {
  return Boolean(getRememberedQuotationConverted(quotationId));
}
