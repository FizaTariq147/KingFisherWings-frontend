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
  const legs = result.progressLegs ?? [];
  const pol = legs.find((l) => /POL|ORIGIN/i.test(String(l.code)));
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
  void pol;
  return (
    fromMilestones?.completedAt ||
    fromMilestones?.occurredAt ||
    result.route?.portOfCall.find((p) => p.atd)?.atd ||
    result.route?.legs.find((l) => l.etd)?.etd
  );
}

export function deriveTrackEta(result: PublicTrackResult): string | undefined {
  return (
    result.expectedDelivery ||
    result.route?.portOfCall.find((p) => p.eta && !p.ata)?.eta ||
    result.route?.legs.find((l) => l.eta)?.eta
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
    result.route?.atBefore
  );
}

export function computeTrackMetrics(result: PublicTrackResult) {
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

  let progressPct = Math.max(0, Math.min(100, Number(result.progress ?? 0) || 0));
  // When API omits progress %, estimate from ATD→ETA so the vessel sits mid-route.
  if (progressPct <= 0 && atdMs != null && etaMs != null && etaMs > atdMs) {
    const now = Date.now();
    progressPct = Math.max(
      0,
      Math.min(100, Math.round(((now - atdMs) / (etaMs - atdMs)) * 100)),
    );
  }

  return {
    containerCount,
    transshipments,
    transitDays,
    co2: co2 ? String(co2) : undefined,
    progressPct,
    atd,
    etd,
    eta,
    origin: result.route?.originLabel || result.route?.from || result.origin,
    destination: result.route?.destLabel || result.route?.to || result.destination,
  };
}
