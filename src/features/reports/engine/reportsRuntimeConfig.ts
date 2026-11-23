/**
 * Runtime reports kill switch. Fetched at app start from
 * `/reports-config.json` with cache disabled. There is no settings API field
 * for reports.engine today — this public file is the runtime source.
 *
 * Build-time VITE_REPORTS_* values apply only when a successful response omits
 * a field. If the fetch fails or is unreachable, engine defaults to `legacy`.
 */
import type { ReportsCatalogueGate, ReportsEngine } from './reportsEngine';

export const REPORTS_RUNTIME_CONFIG_URL = '/reports-config.json';

export type ReportsRuntimeConfig = {
  engine: ReportsEngine;
  gate: ReportsCatalogueGate;
  disabledCodes: string[];
  /** How the values were obtained. */
  source: 'runtime' | 'build-default' | 'fetch-failure';
};

export type ReportsRuntimeConfigFile = {
  engine?: string;
  gate?: string;
  disabledCodes?: unknown;
};

type LoadOptions = {
  /** Override fetch (tests). */
  fetchImpl?: typeof fetch;
  /** Override URL (tests / proof). */
  url?: string;
  /** Build-time engine default when a successful payload omits engine. */
  buildEngine?: ReportsEngine;
  /** Build-time gate default when a successful payload omits gate. */
  buildGate?: ReportsCatalogueGate;
};

let loaded: ReportsRuntimeConfig | null = null;

export function buildTimeReportsEngine(): ReportsEngine {
  const raw = String(import.meta.env?.VITE_REPORTS_ENGINE ?? '').trim().toLowerCase();
  return raw === 'v2' ? 'v2' : 'legacy';
}

export function buildTimeReportsGate(): ReportsCatalogueGate {
  const raw = String(import.meta.env?.VITE_REPORTS_GATE ?? '').trim().toLowerCase();
  return raw === 'hard' ? 'hard' : 'soft';
}

function parseEngine(raw: unknown, fallback: ReportsEngine): ReportsEngine {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'v2') return 'v2';
  if (value === 'legacy') return 'legacy';
  return fallback;
}

function parseGate(raw: unknown, fallback: ReportsCatalogueGate): ReportsCatalogueGate {
  const value = String(raw ?? '').trim().toLowerCase();
  if (value === 'hard') return 'hard';
  if (value === 'soft') return 'soft';
  return fallback;
}

function parseDisabledCodes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => String(item || '').trim().toUpperCase())
    .filter(Boolean);
}

/** Pure merge used by tests and the loader. */
export function mergeReportsRuntimeConfig(
  file: ReportsRuntimeConfigFile | null,
  options: {
    buildEngine?: ReportsEngine;
    buildGate?: ReportsCatalogueGate;
    source: ReportsRuntimeConfig['source'];
  },
): ReportsRuntimeConfig {
  const buildEngine = options.buildEngine ?? buildTimeReportsEngine();
  const buildGate = options.buildGate ?? buildTimeReportsGate();
  if (!file) {
    return {
      engine: options.source === 'fetch-failure' ? 'legacy' : buildEngine,
      gate: options.source === 'fetch-failure' ? 'soft' : buildGate,
      disabledCodes: [],
      source: options.source,
    };
  }
  return {
    engine: parseEngine(file.engine, buildEngine),
    gate: parseGate(file.gate, buildGate),
    disabledCodes: parseDisabledCodes(file.disabledCodes),
    source: options.source,
  };
}

export function getReportsRuntimeConfig(): ReportsRuntimeConfig {
  if (loaded) return loaded;
  // Before load (or in tests that never load): build-time defaults only.
  return {
    engine: buildTimeReportsEngine(),
    gate: buildTimeReportsGate(),
    disabledCodes: [],
    source: 'build-default',
  };
}

/** Test / proof helper — replaces the in-memory runtime config. */
export function setReportsRuntimeConfigForTests(config: ReportsRuntimeConfig | null): void {
  loaded = config;
}

export function reportsRuntimeDisabledCodes(): string[] {
  return getReportsRuntimeConfig().disabledCodes;
}

export function isReportsCodeRuntimeDisabled(code: string): boolean {
  const key = String(code || '').trim().toUpperCase();
  return getReportsRuntimeConfig().disabledCodes.includes(key);
}

/**
 * Fetch `/reports-config.json` with cache disabled. Call once at app start.
 */
export async function loadReportsRuntimeConfig(options: LoadOptions = {}): Promise<ReportsRuntimeConfig> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = options.url ?? REPORTS_RUNTIME_CONFIG_URL;
  const buildEngine = options.buildEngine ?? buildTimeReportsEngine();
  const buildGate = options.buildGate ?? buildTimeReportsGate();
  try {
    const response = await fetchImpl(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      loaded = mergeReportsRuntimeConfig(null, {
        buildEngine,
        buildGate,
        source: 'fetch-failure',
      });
      return loaded;
    }
    const body = (await response.json()) as ReportsRuntimeConfigFile;
    loaded = mergeReportsRuntimeConfig(body, {
      buildEngine,
      buildGate,
      source: 'runtime',
    });
    return loaded;
  } catch {
    loaded = mergeReportsRuntimeConfig(null, {
      buildEngine,
      buildGate,
      source: 'fetch-failure',
    });
    return loaded;
  }
}
