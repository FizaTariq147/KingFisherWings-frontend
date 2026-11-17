export type JobCloseBlockerKind =
  | 'uninvoiced_sale_charges'
  | 'unposted_vouchers'
  | 'open_shipments'
  | 'other';

export interface JobCloseBlocker {
  kind: JobCloseBlockerKind;
  code: string;
  message: string;
  count?: number;
  /** Deep-link hint for FE (costing / vouchers / shipments). */
  resolveHint?: 'costing' | 'vouchers' | 'shipments';
}

export interface JobCloseChecklist {
  can_close: boolean;
  blockers: JobCloseBlocker[];
  raw?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function pickCount(...values: unknown[]): number | undefined {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) {
      return Number(v);
    }
    if (Array.isArray(v)) return v.length;
  }
  return undefined;
}

function classifyKind(raw: string): JobCloseBlockerKind {
  const s = raw.toLowerCase();
  if (
    /uninvoice|sale.?charge|not.?invoice|job_not_invoiced|pending.?sale|billable/.test(
      s,
    )
  ) {
    return 'uninvoiced_sale_charges';
  }
  if (/voucher|unposted/.test(s)) return 'unposted_vouchers';
  if (/shipment|open.?ship/.test(s)) return 'open_shipments';
  return 'other';
}

function resolveHintFor(kind: JobCloseBlockerKind): JobCloseBlocker['resolveHint'] {
  if (kind === 'uninvoiced_sale_charges') return 'costing';
  if (kind === 'unposted_vouchers') return 'vouchers';
  if (kind === 'open_shipments') return 'shipments';
  return undefined;
}

function defaultMessage(kind: JobCloseBlockerKind, count?: number): string {
  const n = count != null ? ` (${count})` : '';
  if (kind === 'uninvoiced_sale_charges') {
    return `Uninvoiced sale charges${n} — invoice them from Costing before closing.`;
  }
  if (kind === 'unposted_vouchers') {
    return `Unposted vouchers${n} — post or clear vouchers before closing.`;
  }
  if (kind === 'open_shipments') {
    return `Open shipments${n} — complete or detach open shipments before closing.`;
  }
  return `Close checklist blocker${n}.`;
}

function blockerFromUnknown(raw: unknown, fallbackKind?: JobCloseBlockerKind): JobCloseBlocker | null {
  if (typeof raw === 'string' && raw.trim()) {
    const kind = fallbackKind ?? classifyKind(raw);
    return {
      kind,
      code: raw.trim().toUpperCase().replace(/\s+/g, '_'),
      message: raw.trim(),
      resolveHint: resolveHintFor(kind),
    };
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  const code = pickString(
    rec.code,
    rec.key,
    rec.type,
    rec.name,
    rec.id,
    rec.blocker,
  );
  const message = pickString(
    rec.message,
    rec.label,
    rec.description,
    rec.reason,
    rec.detail,
    code,
  );
  if (!code && !message) return null;
  const kind = classifyKind(`${code} ${message}` || fallbackKind || 'other');
  const count = pickCount(rec.count, rec.total, rec.items, rec.charges, rec.vouchers, rec.shipments);
  return {
    kind: fallbackKind && kind === 'other' ? fallbackKind : kind,
    code: code || kind.toUpperCase(),
    message: message || defaultMessage(kind, count),
    ...(count != null ? { count } : {}),
    resolveHint: resolveHintFor(
      fallbackKind && kind === 'other' ? fallbackKind : kind,
    ),
  };
}

function pushArrayBlockers(
  out: JobCloseBlocker[],
  seen: Set<string>,
  items: unknown,
  kind: JobCloseBlockerKind,
) {
  if (!Array.isArray(items) || items.length === 0) return;
  // Prefer a single summary row when the array is a list of entities.
  const first = asRecord(items[0]);
  const looksLikeEntity = Boolean(
    first && (first.id || first.charge_id || first.shipment_id || first.voucher_id),
  );
  if (looksLikeEntity) {
    const summary: JobCloseBlocker = {
      kind,
      code: kind.toUpperCase(),
      message: defaultMessage(kind, items.length),
      count: items.length,
      resolveHint: resolveHintFor(kind),
    };
    const key = `${summary.kind}:${summary.code}:${summary.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(summary);
    }
    return;
  }
  for (const row of items) {
    const b = blockerFromUnknown(row, kind);
    if (!b) continue;
    const key = `${b.kind}:${b.code}:${b.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(b);
  }
}

/**
 * Normalize GET /jobs/:id/close-checklist.
 * BE summary: uninvoiced sale charges, unposted vouchers, open shipments.
 */
export function normalizeJobCloseChecklist(raw: unknown): JobCloseChecklist {
  const root = asRecord(raw) ?? {};
  const nested =
    asRecord(root.data) ??
    asRecord(root.checklist) ??
    asRecord(root.result) ??
    root;

  const blockers: JobCloseBlocker[] = [];
  const seen = new Set<string>();

  const listCandidates = [
    nested.blockers,
    nested.items,
    nested.checks,
    nested.issues,
    nested.failures,
  ];
  for (const list of listCandidates) {
    if (!Array.isArray(list)) continue;
    for (const row of list) {
      const rec = asRecord(row);
      // Skip green/ok checks.
      if (rec) {
        const ok =
          rec.ok === true ||
          rec.passed === true ||
          rec.clear === true ||
          rec.blocking === false ||
          rec.is_blocker === false;
        if (ok) continue;
        const blocking =
          rec.blocking === true ||
          rec.is_blocker === true ||
          rec.ok === false ||
          rec.passed === false ||
          rec.status === 'blocked' ||
          rec.status === 'fail' ||
          rec.status === 'failed';
        // If status-like flags absent, treat as blocker (array named blockers/issues).
        if (
          rec.ok === undefined &&
          rec.passed === undefined &&
          rec.blocking === undefined &&
          rec.is_blocker === undefined &&
          rec.status === undefined
        ) {
          // fall through
        } else if (!blocking) {
          continue;
        }
      }
      const b = blockerFromUnknown(row);
      if (!b) continue;
      const key = `${b.kind}:${b.code}:${b.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blockers.push(b);
    }
  }

  pushArrayBlockers(
    blockers,
    seen,
    nested.uninvoiced_sale_charges ??
      nested.uninvoicedSaleCharges ??
      nested.uninvoiced_charges ??
      nested.sale_charges_uninvoiced,
    'uninvoiced_sale_charges',
  );
  pushArrayBlockers(
    blockers,
    seen,
    nested.unposted_vouchers ?? nested.unpostedVouchers ?? nested.vouchers_unposted,
    'unposted_vouchers',
  );
  pushArrayBlockers(
    blockers,
    seen,
    nested.open_shipments ?? nested.openShipments ?? nested.shipments_open,
    'open_shipments',
  );

  // Numeric counters without arrays.
  const counterSpecs: Array<[JobCloseBlockerKind, unknown]> = [
    [
      'uninvoiced_sale_charges',
      nested.uninvoiced_sale_charges_count ??
        nested.uninvoiced_count ??
        nested.pending_sale_charges,
    ],
    [
      'unposted_vouchers',
      nested.unposted_vouchers_count ?? nested.unposted_voucher_count,
    ],
    ['open_shipments', nested.open_shipments_count ?? nested.open_shipment_count],
  ];
  for (const [kind, value] of counterSpecs) {
    const count = pickCount(value);
    if (count == null || count <= 0) continue;
    if (blockers.some((b) => b.kind === kind)) continue;
    blockers.push({
      kind,
      code: kind.toUpperCase(),
      message: defaultMessage(kind, count),
      count,
      resolveHint: resolveHintFor(kind),
    });
  }

  const explicitCanClose =
    typeof nested.can_close === 'boolean'
      ? nested.can_close
      : typeof nested.ready === 'boolean'
        ? nested.ready
        : typeof nested.ready_to_close === 'boolean'
          ? nested.ready_to_close
          : typeof nested.blocked === 'boolean'
            ? !nested.blocked
            : undefined;

  return {
    can_close: explicitCanClose ?? blockers.length === 0,
    blockers,
    raw,
  };
}
