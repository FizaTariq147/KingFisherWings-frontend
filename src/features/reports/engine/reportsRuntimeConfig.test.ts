import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadReportsRuntimeConfig,
  mergeReportsRuntimeConfig,
  setReportsRuntimeConfigForTests,
} from './reportsRuntimeConfig';
import {
  flowCodeGeneratable,
  reportsCatalogCodeVisible,
  reportsCodeGenerateBlocked,
} from './invoiceV2Gate';
import { reportsCatalogueGate, reportsEngine } from './reportsEngine';

afterEach(() => {
  setReportsRuntimeConfigForTests(null);
});

describe('mergeReportsRuntimeConfig', () => {
  it('uses build-time defaults when a successful file omits fields', () => {
    const merged = mergeReportsRuntimeConfig(
      { disabledCodes: ['INVOICE_FLOW_TAX_INVOICE_1'] },
      { buildEngine: 'v2', buildGate: 'hard', source: 'runtime' },
    );
    expect(merged.engine).toBe('v2');
    expect(merged.gate).toBe('hard');
    expect(merged.disabledCodes).toEqual(['INVOICE_FLOW_TAX_INVOICE_1']);
    expect(merged.source).toBe('runtime');
  });

  it('defaults engine to legacy on fetch failure', () => {
    const merged = mergeReportsRuntimeConfig(null, {
      buildEngine: 'v2',
      buildGate: 'hard',
      source: 'fetch-failure',
    });
    expect(merged.engine).toBe('legacy');
    expect(merged.gate).toBe('soft');
    expect(merged.disabledCodes).toEqual([]);
    expect(merged.source).toBe('fetch-failure');
  });
});

describe('loadReportsRuntimeConfig', () => {
  it('loads runtime JSON with cache disabled', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ engine: 'v2', gate: 'soft', disabledCodes: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const loaded = await loadReportsRuntimeConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      buildEngine: 'legacy',
      buildGate: 'soft',
    });
    expect(loaded.engine).toBe('v2');
    expect(loaded.source).toBe('runtime');
    expect(fetchImpl).toHaveBeenCalledWith(
      '/reports-config.json',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(reportsEngine()).toBe('v2');
    expect(reportsCatalogueGate()).toBe('soft');
  });

  it('falls back to legacy when fetch fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });
    const loaded = await loadReportsRuntimeConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      buildEngine: 'v2',
      buildGate: 'hard',
    });
    expect(loaded.engine).toBe('legacy');
    expect(loaded.source).toBe('fetch-failure');
    expect(reportsEngine()).toBe('legacy');
    expect(
      reportsCatalogCodeVisible({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        status: 'accepted',
      }),
    ).toBe(false);
  });

  it('falls back to legacy when response is not ok', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('missing', { status: 404 }),
    );
    const loaded = await loadReportsRuntimeConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      buildEngine: 'v2',
      buildGate: 'hard',
    });
    expect(loaded.engine).toBe('legacy');
    expect(loaded.source).toBe('fetch-failure');
  });
});

describe('flowCodeGeneratable + catalogue runtime', () => {
  it('allows generate only when accepted + engine v2 + not disabled', () => {
    expect(
      flowCodeGeneratable({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'v2',
        status: 'accepted',
        disabledCodes: [],
      }),
    ).toBe(true);
    expect(
      flowCodeGeneratable({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'v2',
        status: 'reference_only',
        disabledCodes: [],
      }),
    ).toBe(false);
    expect(
      flowCodeGeneratable({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'legacy',
        status: 'accepted',
        disabledCodes: [],
      }),
    ).toBe(false);
    expect(
      flowCodeGeneratable({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'v2',
        status: 'accepted',
        disabledCodes: ['INVOICE_FLOW_TAX_INVOICE_1'],
      }),
    ).toBe(false);
  });

  it('hides disabled codes from the catalogue even under soft v2', () => {
    expect(
      reportsCatalogCodeVisible({
        code: 'QUOTATION_FLOW_1',
        engine: 'v2',
        gate: 'soft',
        status: 'accepted',
        disabledCodes: ['QUOTATION_FLOW_1'],
      }),
    ).toBe(false);
    expect(
      reportsCatalogCodeVisible({
        code: 'QUOTATION_FLOW_1',
        engine: 'v2',
        gate: 'soft',
        status: 'accepted',
        disabledCodes: [],
      }),
    ).toBe(true);
  });

  it('blocks generate for flow codes that are not accepted even under soft gate', () => {
    expect(
      reportsCodeGenerateBlocked({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'v2',
        gate: 'soft',
        status: 'reference_only',
        disabledCodes: [],
      }),
    ).toBe(true);
    expect(
      reportsCodeGenerateBlocked({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        engine: 'v2',
        gate: 'soft',
        status: 'accepted',
        disabledCodes: [],
      }),
    ).toBe(false);
  });

  it('runtime legacy after load hides all gated catalogue codes', () => {
    setReportsRuntimeConfigForTests({
      engine: 'legacy',
      gate: 'soft',
      disabledCodes: [],
      source: 'runtime',
    });
    expect(reportsEngine()).toBe('legacy');
    expect(
      reportsCatalogCodeVisible({
        code: 'INVOICE_FLOW_TAX_INVOICE_1',
        status: 'accepted',
      }),
    ).toBe(false);
    expect(
      reportsCatalogCodeVisible({
        code: 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE',
        status: 'accepted',
      }),
    ).toBe(false);
  });
});
