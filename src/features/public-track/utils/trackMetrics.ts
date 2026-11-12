import type { PublicTrackResult } from '../types/publicTrack.types';

function parseMs(value?: string): number | null {
  if (!value?.trim()) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

export function formatTrackDateShort(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value.trim();
  return new Date(t).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function deriveTrackAtd(result: PublicTrackResult): string | undefined {
  const fromMilestones = [...(result.milestones ?? [])]
    .reverse()
    .find((m) => {
      const blob = `${m.move ?? ''} ${m.label ?? ''} ${m.eventType ?? ''}`.toUpperCase();
      return (
        blob.includes('DEPART') ||
        blob.includes('ATD') ||
        blob.includes('SAILED') ||
        blob.includes('VESSEL DEPARTURE')
      );
    });
  return (
    fromMilestones?.completedAt ||
    fromMilestones?.occurredAt ||
    result.route?.portOfCall.find((p) => p.atd)?.atd ||
    result.route?.legs.find((l) => l.etd)?.etd
  );
}

function detailedScheduleField(
  result: PublicTrackResult,
  ...keys: string[]
): string | undefined {
  const data = result.cargoInfo?.detailedData;
  if (!data) return undefined;
  for (const key of keys) {
    const v = data[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

export function deriveTrackEta(result: PublicTrackResult): string | undefined {
  return (
    result.expectedDelivery ||
    result.route?.portOfCall.find((p) => p.eta && !p.ata)?.eta ||
    result.route?.legs.find((l) => l.eta)?.eta ||
    detailedScheduleField(result, 'eta', 'ETA', 'expected_delivery', 'expectedDelivery')
  );
}

/** Planned / current ETD (prefer origin / first leg, not ATD). */
export function deriveTrackEtd(result: PublicTrackResult): string | undefined {
  const originPoc = result.route?.portOfCall.find((p) =>
    /ORIGIN|POL/i.test(String(p.role ?? p.code ?? '')),
  );
  return (
    originPoc?.etd ||
    result.route?.portOfCall.find((p) => p.etd && !p.atd)?.etd ||
    result.route?.firstLeg?.etd ||
    result.route?.legs.find((l) => l.etd)?.etd ||
    result.route?.atBefore ||
    result.etd ||
    detailedScheduleField(result, 'etd', 'ETD', 'flight_date', 'flightDate')
  );
}

/** True when tracking status / destination ATA / POD means cargo has arrived or been delivered. */
export function isTrackDelivered(result: PublicTrackResult): boolean {
  const blob = `${result.currentStatus ?? ''} ${result.status ?? ''}`.toUpperCase();
  if (/\b(UNDELIVER|NOT[_\s-]?DELIVER)\b/.test(blob)) return false;
  if (
    /\b(DELIVERED|DELIVERY COMPLETE|PROOF OF DELIVERY|POD COMPLETE|COMPLETED|CLOSED|ARRIVED AT DEST)\b/.test(
      blob,
    )
  ) {
    return true;
  }

  const destPoc = result.route?.portOfCall.find((p) =>
    /POD|DEST|DESTINATION/i.test(String(p.role ?? p.code ?? '')),
  );
  if (destPoc?.ata) return true;

  const legs = result.progressLegs ?? [];
  const pod = [...legs]
    .reverse()
    .find((l) => /POD|DEST|DESTINATION/i.test(String(l.code ?? l.id ?? '')));
  if (pod?.completed === true) return true;

  const lastMilestone = [...(result.milestones ?? [])]
    .reverse()
    .find((m) => !m.pending);
  if (lastMilestone) {
    const mBlob =
      `${lastMilestone.move ?? ''} ${lastMilestone.label ?? ''} ${lastMilestone.eventType ?? ''} ${lastMilestone.status ?? ''}`.toUpperCase();
    if (/\b(DELIVERED|PROOF OF DELIVERY|POD|GATE OUT.*FULL|ARRIVED AT DEST)\b/.test(mBlob)) {
      return true;
    }
  }

  return false;
}

function progressFromLegs(result: PublicTrackResult): number | null {
  const legs = result.progressLegs ?? [];
  if (legs.length < 2) return null;

  const lastIdx = legs.length - 1;
  let idx = legs.findIndex((l) => l.current);
  if (idx < 0) {
    // Last completed leg index.
    for (let i = legs.length - 1; i >= 0; i -= 1) {
      if (legs[i].completed) {
        idx = i;
        break;
      }
    }
  }
  if (idx < 0) return null;

  const atDest = /POD|DEST|DESTINATION/i.test(String(legs[idx].code ?? legs[idx].id ?? ''));
  if (atDest && (legs[idx].completed || isTrackDelivered(result))) {
    return 100;
  }
  // Current at destination without delivered → nearly there, not full.
  if (atDest) return 92;

  return Math.max(0, Math.min(100, Math.round((idx / lastIdx) * 100)));
}

function progressFromMilestones(result: PublicTrackResult): number | null {
  const milestones = result.milestones ?? [];
  if (milestones.length < 2) return null;
  const completed = milestones.filter((m) => m.pending !== true).length;
  const ratio = completed / milestones.length;
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  return Math.max(0, Math.min(99, Math.round(ratio * 100)));
}

function progressFromSchedule(
  atdMs: number | null,
  etaMs: number | null,
  nowMs: number,
): number | null {
  if (atdMs == null || etaMs == null || etaMs <= atdMs) return null;
  if (nowMs >= etaMs) return 99;
  if (nowMs <= atdMs) return 2;
  return Math.max(
    2,
    Math.min(99, Math.round(((nowMs - atdMs) / (etaMs - atdMs)) * 100)),
  );
}

export function computeTrackMetrics(
  result: PublicTrackResult,
  nowMs: number = Date.now(),
) {
  const containerCount = Math.max(
    result.containers?.length ?? 0,
    result.containerNumber ? 1 : 0,
  );

  const tsFromLegs = (result.progressLegs ?? []).filter((l) =>
    /PTS|TS|TRANSSHIP/i.test(String(l.code)),
  ).length;
  const tsFromPoc = Math.max(0, (result.route?.portOfCall.length ?? 0) - 2);
  const transshipments = Math.max(tsFromLegs, tsFromPoc, 0);

  const atd = deriveTrackAtd(result);
  const etd = deriveTrackEtd(result);
  const eta = deriveTrackEta(result);
  const atdMs = parseMs(atd);
  const etaMs = parseMs(eta);
  let transitDays: number | undefined;
  if (atdMs != null && etaMs != null && etaMs >= atdMs) {
    transitDays = Math.max(1, Math.round((etaMs - atdMs) / (24 * 60 * 60 * 1000)));
  }

  const co2 =
    result.qtyGwVol?.extras?.co2 ||
    result.qtyGwVol?.extras?.CO2 ||
    (typeof result.cargoInfo?.detailedData?.co2 === 'string'
      ? result.cargoInfo.detailedData.co2
      : typeof result.cargoInfo?.detailedData?.CO2 === 'string'
        ? String(result.cargoInfo.detailedData.CO2)
        : undefined);

  const delivered = isTrackDelivered(result);
  let progressPct = Math.max(0, Math.min(100, Number(result.progress ?? 0) || 0));

  if (delivered) {
    progressPct = 100;
  } else {
    if (progressPct <= 0) {
      progressPct =
        progressFromLegs(result) ??
        progressFromSchedule(atdMs, etaMs, nowMs) ??
        progressFromMilestones(result) ??
        0;
    } else {
      // Keep API progress, but still advance with schedule when API is stale/low.
      const scheduled = progressFromSchedule(atdMs, etaMs, nowMs);
      const fromLegs = progressFromLegs(result);
      progressPct = Math.max(progressPct, scheduled ?? 0, fromLegs ?? 0);
      progressPct = Math.min(99, progressPct);
    }
  }

  return {
    containerCount,
    transshipments,
    transitDays,
    co2: co2 ? String(co2) : undefined,
    progressPct,
    delivered,
    atd,
    etd,
    eta,
    origin: result.route?.originLabel || result.route?.from || result.origin,
    destination: result.route?.destLabel || result.route?.to || result.destination,
  };
}
