import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { exchangeRateLatest, masterById } from '../api/masterPaths';
import type {
  MasterListParams,
  MasterListResult,
  MasterRecord,
  PaginationMeta,
} from '../types/master.types';
import { normalizeMasterRecord, normalizeMasterRecords } from '../utils/normalizeMasterRecord';
import { prepareMasterPayload } from '../utils/prepareMasterPayload';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapListPayload(raw: unknown): { items: unknown[]; meta?: PaginationMeta } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };

  const data = envelope.data;
  if (Array.isArray(data)) {
    return { items: data, meta: normalizeMeta(envelope.meta, data.length) };
  }

  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.records) && nested.records) ||
      [];
    return {
      items: list,
      meta: normalizeMeta(nested.meta ?? envelope.meta, list.length),
    };
  }

  return { items: [] };
}

function normalizeMeta(raw: unknown, fallbackTotal: number): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? 1) || 1;
  const limit = Number(record?.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

function buildListQuery(params: MasterListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  if (params.order) query.order = params.order;
  if (params.extra) {
    for (const [key, value] of Object.entries(params.extra)) {
      if (value === undefined || value === null || value === '') continue;
      query[key] = value;
    }
  }
  return query;
}

function formatAxiosError(error: unknown, context?: { basePath?: string }): Error {
  if (!error || typeof error !== 'object') return new Error('Request failed.');
  const axiosErr = error as {
    response?: {
      data?: unknown;
      status?: number;
    };
    message?: string;
  };
  const status = axiosErr.response?.status;
  const data = axiosErr.response?.data;
  const record =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  const rawMsg = record?.message;
  const detail = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;

  if (status === 502 || status === 503 || status === 504) {
    return new Error(
      'API gateway timed out (502). The Render backend may be waking up — wait ~30 seconds and try again.',
    );
  }

  if (typeof detail === 'string' && detail.trim() && !/internal server error/i.test(detail)) {
    return new Error(detail);
  }

    if (status === 500) {
    const bodyPreview =
      data == null
        ? ''
        : typeof data === 'string'
          ? data.slice(0, 280)
          : JSON.stringify(data).slice(0, 280);
    const isHoliday = context?.basePath?.includes('/masters/holidays');
    const isTaxRate = context?.basePath?.includes('/masters/tax-rates');
    const isTariff = context?.basePath?.includes('/quotations/tariffs');
    if (isHoliday) {
      return new Error(
        'Holidays create failed with HTTP 500 from the API (no useful error body). ' +
          'The frontend already sends a valid CreateHolidayDto and tried alternate date formats. ' +
          'This needs a backend fix — check Render/API logs for the HolidaysController create stack trace ' +
          '(often a DB constraint, missing column, or unhandled Prisma error).',
      );
    }
    if (isTaxRate) {
      return new Error(
        'Tax Rates create failed with HTTP 500 from the API — the request body matches CreateTaxRateDto. ' +
          'This is a backend bug (same class as Holidays). Check Render logs for TaxRatesController / Prisma. ' +
          'Verify in Swagger with the same JSON; if Swagger also 500s, the API must be fixed.',
      );
    }
    if (isTariff) {
      return new Error(
        'Online Tariff API rejected the request (often empty/invalid UUID on port, charge code, or customer). Leave optional fields empty, pick Charge code from the list, then retry. If it still fails with HTTP 500, check Render logs.',
      );
    }
    return new Error(
      `Server error while saving (500). ${bodyPreview || 'Check Network → Response for details.'}`,
    );
  }

  if (typeof record?.error === 'string' && record.error.trim()) {
    return new Error(record.error);
  }
  if (typeof axiosErr.message === 'string' && axiosErr.message.trim()) {
    return new Error(axiosErr.message);
  }
  return new Error('Request failed.');
}

/** Holidays DTO only — strip extra fields that can crash strict Nest/Prisma handlers. */
function prepareHolidayCreatePayload(dto: Record<string, unknown>): Record<string, unknown> {
  const prepared = prepareMasterPayload(dto);
  const country = String(prepared.country_code ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 2);
  const dateRaw = String(prepared.date ?? '').trim().slice(0, 10);
  const name = String(prepared.name ?? '').trim();
  const recurring =
    typeof prepared.is_recurring === 'boolean' ? prepared.is_recurring : undefined;

  const body: Record<string, unknown> = {
    country_code: country,
    date: dateRaw,
    name,
  };
  if (recurring !== undefined) body.is_recurring = recurring;
  return body;
}

function isHttpStatus(error: unknown, status: number): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { response?: { status?: number } }).response?.status === status
  );
}

/**
 * Nest/Prisma holiday creates sometimes 500 on date-only strings or optional flags.
 * Try a few Swagger-compatible shapes before surfacing the error.
 */
async function postHolidayWithFallbacks(
  basePath: string,
  dto: Record<string, unknown>,
): Promise<unknown> {
  const base = prepareHolidayCreatePayload(dto);
  const dateOnly = String(base.date ?? '').slice(0, 10);
  const isoMidnight = dateOnly ? `${dateOnly}T00:00:00.000Z` : '';
  const recurring = base.is_recurring;

  const variants: Record<string, unknown>[] = [
    { country_code: base.country_code, date: dateOnly, name: base.name, ...(recurring !== undefined ? { is_recurring: recurring } : {}) },
    { country_code: base.country_code, date: dateOnly, name: base.name },
    { country_code: base.country_code, date: isoMidnight, name: base.name, ...(recurring !== undefined ? { is_recurring: recurring } : {}) },
    { country_code: base.country_code, date: isoMidnight, name: base.name },
    // Some backends use holiday_date instead of date despite Swagger
    { country_code: base.country_code, holiday_date: dateOnly, name: base.name, ...(recurring !== undefined ? { is_recurring: recurring } : {}) },
  ];

  let lastError: unknown;
  for (const body of variants) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<MasterRecord> | MasterRecord>(basePath, body),
      );
      return res.data;
    } catch (error) {
      lastError = error;
      // Only keep trying on opaque 500s — validation (400) etc. should fail fast
      if (!isHttpStatus(error, 500)) throw error;
    }
  }
  throw lastError;
}

const TAX_TYPES = new Set(['VAT', 'GST', 'CUSTOMS', 'WITHHOLDING', 'NONE']);

/** Whitelist CreateTaxRateDto — invalid tax_type enums often crash Prisma as HTTP 500. */
function prepareTaxRateCreatePayload(dto: Record<string, unknown>): Record<string, unknown> {
  const prepared = prepareMasterPayload(dto);
  const taxTypeRaw = String(prepared.tax_type ?? 'VAT')
    .trim()
    .toUpperCase();
  const tax_type = TAX_TYPES.has(taxTypeRaw) ? taxTypeRaw : 'VAT';
  const rate = Number(prepared.rate);
  const body: Record<string, unknown> = {
    name: String(prepared.name ?? '').trim(),
    code: String(prepared.code ?? '').trim().toUpperCase(),
    tax_type,
    rate: Number.isFinite(rate) ? rate : 0,
    country_code: String(prepared.country_code ?? '')
      .trim()
      .toUpperCase()
      .slice(0, 2),
    effective_from: String(prepared.effective_from ?? '').trim().slice(0, 10),
  };
  // Never send effective_to: null — some Nest/Prisma handlers 500 on explicit null
  if (typeof prepared.effective_to === 'string' && prepared.effective_to.trim()) {
    body.effective_to = prepared.effective_to.trim().slice(0, 10);
  }
  if (typeof prepared.is_default === 'boolean') body.is_default = prepared.is_default;
  if (typeof prepared.is_active === 'boolean') body.is_active = prepared.is_active;
  return body;
}

async function postTaxRateWithFallbacks(
  basePath: string,
  dto: Record<string, unknown>,
): Promise<unknown> {
  const base = prepareTaxRateCreatePayload(dto);
  const from = String(base.effective_from ?? '').slice(0, 10);
  const fromIso = from ? `${from}T00:00:00.000Z` : from;

  const variants: Record<string, unknown>[] = [
    { ...base },
    {
      name: base.name,
      code: base.code,
      tax_type: base.tax_type,
      rate: base.rate,
      country_code: base.country_code,
      effective_from: from,
      is_active: true,
    },
    {
      name: base.name,
      code: base.code,
      tax_type: base.tax_type,
      rate: base.rate,
      country_code: base.country_code,
      effective_from: from,
      is_default: false,
      is_active: true,
    },
    {
      name: base.name,
      code: base.code,
      tax_type: base.tax_type,
      rate: base.rate,
      country_code: base.country_code,
      effective_from: fromIso,
      is_active: true,
    },
  ];

  let lastError: unknown;
  for (const body of variants) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<MasterRecord> | MasterRecord>(basePath, body),
      );
      return res.data;
    } catch (error) {
      lastError = error;
      if (!isHttpStatus(error, 500)) throw error;
    }
  }
  throw lastError;
}

const TARIFF_SERVICE_TYPES = new Set([
  'AIR_EXPORT',
  'AIR_IMPORT',
  'SEA_FCL_EXPORT',
  'SEA_FCL_IMPORT',
  'SEA_LCL_EXPORT',
  'SEA_LCL_IMPORT',
  'LAND',
  'COURIER',
  'CUSTOMS_CLEARANCE',
  'NVOCC_EXPORT',
  'NVOCC_IMPORT',
  'SERVICE_JOB',
  'WAREHOUSE',
]);

function optionalUuid(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return isUuid(trimmed) ? trimmed : undefined;
}

/** Whitelist CreateTariffDto — omit empty UUIDs/nulls that often crash Nest/Prisma as 500. */
function prepareTariffCreatePayload(dto: Record<string, unknown>): Record<string, unknown> {
  const prepared = prepareMasterPayload(dto);
  const serviceRaw = String(prepared.service_type ?? '')
    .trim()
    .toUpperCase();
  const service_type = TARIFF_SERVICE_TYPES.has(serviceRaw) ? serviceRaw : '';
  const sale = Number(prepared.sale_rate);
  const cost = Number(prepared.cost_rate);
  const currency = String(prepared.currency_code ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 3);
  const charge_code_id = String(prepared.charge_code_id ?? '').trim();

  const body: Record<string, unknown> = {
    service_type,
    charge_code_id,
    sale_rate: Number.isFinite(sale) ? sale : 0,
    cost_rate: Number.isFinite(cost) ? cost : 0,
    currency_code: currency,
    valid_from: String(prepared.valid_from ?? '').trim().slice(0, 10),
  };

  const origin = optionalUuid(prepared.origin_port_id);
  const dest = optionalUuid(prepared.dest_port_id);
  const container = optionalUuid(prepared.container_type_id);
  const customer = optionalUuid(prepared.customer_id);
  if (origin) body.origin_port_id = origin;
  if (dest) body.dest_port_id = dest;
  if (container) body.container_type_id = container;
  if (customer) body.customer_id = customer;

  if (typeof prepared.unit === 'string' && prepared.unit.trim()) {
    body.unit = prepared.unit.trim();
  }
  if (typeof prepared.valid_to === 'string' && prepared.valid_to.trim()) {
    body.valid_to = prepared.valid_to.trim().slice(0, 10);
  }
  if (typeof prepared.is_active === 'boolean') body.is_active = prepared.is_active;

  return body;
}

/**
 * Opaque Nest 500s on tariffs — try Swagger-compatible variants
 * (date-only vs ISO, minimal required fields, numeric vs string rates).
 */
async function postTariffWithFallbacks(
  basePath: string,
  dto: Record<string, unknown>,
): Promise<unknown> {
  const base = prepareTariffCreatePayload(dto);
  const chargeId = String(base.charge_code_id ?? '');
  if (!isUuid(chargeId)) {
    throw new Error('Charge code is required and must be a valid UUID from Masters → Charge Codes.');
  }
  if (!base.service_type || !TARIFF_SERVICE_TYPES.has(String(base.service_type))) {
    throw new Error('Service type is required — pick a value from the dropdown.');
  }
  if (!base.currency_code || String(base.currency_code).length !== 3) {
    throw new Error('Currency is required (3-letter code, e.g. AED).');
  }
  if (!base.valid_from) {
    throw new Error('Valid from date is required.');
  }

  const from = String(base.valid_from).slice(0, 10);
  const fromIso = `${from}T00:00:00.000Z`;
  const sale = base.sale_rate;
  const cost = base.cost_rate;

  const requiredOnly: Record<string, unknown> = {
    service_type: base.service_type,
    charge_code_id: chargeId,
    sale_rate: sale,
    cost_rate: cost,
    currency_code: base.currency_code,
    valid_from: from,
  };

  const withOptionals: Record<string, unknown> = { ...requiredOnly };
  for (const key of [
    'origin_port_id',
    'dest_port_id',
    'container_type_id',
    'customer_id',
    'unit',
    'valid_to',
    'is_active',
  ] as const) {
    if (base[key] !== undefined) withOptionals[key] = base[key];
  }

  const variants: Record<string, unknown>[] = [
    withOptionals,
    requiredOnly,
    { ...requiredOnly, unit: 'Per Container', is_active: true },
    { ...requiredOnly, valid_from: fromIso },
    {
      ...requiredOnly,
      sale_rate: String(sale),
      cost_rate: String(cost),
    },
  ];

  let lastError: unknown;
  for (const body of variants) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<ApiEnvelope<MasterRecord> | MasterRecord>(basePath, body),
      );
      return res.data;
    } catch (error) {
      lastError = error;
      if (!isHttpStatus(error, 500)) throw error;
    }
  }
  throw lastError;
}

export const masterService = {
  async list(basePath: string, params: MasterListParams = {}): Promise<MasterListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(basePath, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapListPayload(res.data);
      const records = normalizeMasterRecords(items);
      return {
        items: records,
        meta: meta ?? normalizeMeta(undefined, records.length),
      };
    } catch (error) {
      throw formatAxiosError(error, { basePath });
    }
  },

  async getById(basePath: string, id: string): Promise<MasterRecord> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<MasterRecord> | MasterRecord>(masterById(basePath, id)),
      );
      const raw = res.data;
      const envelope = asRecord(raw);
      const data = envelope && 'data' in envelope ? envelope.data : raw;
      const record = normalizeMasterRecord(data);
      if (!record) throw new Error('Master record not found.');
      return record;
    } catch (error) {
      throw formatAxiosError(error, { basePath });
    }
  },

  async create(basePath: string, dto: Record<string, unknown>): Promise<MasterRecord> {
    try {
      let raw: unknown;
      if (basePath.includes('/masters/holidays')) {
        raw = await postHolidayWithFallbacks(basePath, dto);
      } else if (basePath.includes('/masters/tax-rates')) {
        raw = await postTaxRateWithFallbacks(basePath, dto);
      } else if (basePath.includes('/quotations/tariffs')) {
        raw = await postTariffWithFallbacks(basePath, dto);
      } else {
        raw = (
          await withGatewayRetry(() =>
            axiosInstance.post<ApiEnvelope<MasterRecord> | MasterRecord>(
              basePath,
              prepareMasterPayload(dto),
            ),
          )
        ).data;
      }

      const envelope = asRecord(raw);
      const data = envelope && 'data' in envelope ? envelope.data : raw;
      const record = normalizeMasterRecord(data);
      if (!record) throw new Error('Create succeeded but no record was returned.');
      return record;
    } catch (error) {
      throw formatAxiosError(error, { basePath });
    }
  },

  async update(
    basePath: string,
    id: string,
    dto: Record<string, unknown>,
  ): Promise<MasterRecord> {
    try {
      if (!isUuid(id)) {
        throw new Error('Record id must be a valid UUID.');
      }
      const body = basePath.includes('/quotations/tariffs')
        ? prepareTariffCreatePayload(dto)
        : prepareMasterPayload(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<ApiEnvelope<MasterRecord> | MasterRecord>(
          masterById(basePath, id),
          body,
        ),
      );
      const envelope = asRecord(res.data);
      const data = envelope && 'data' in envelope ? envelope.data : res.data;
      const record = normalizeMasterRecord(data);
      if (!record) throw new Error('Update succeeded but no record was returned.');
      return record;
    } catch (error) {
      throw formatAxiosError(error, { basePath });
    }
  },

  async softDelete(basePath: string, id: string): Promise<void> {
    try {
      if (!isUuid(id)) {
        throw new Error('Record id must be a valid UUID.');
      }
      await withGatewayRetry(() =>
        axiosInstance.delete(masterById(basePath, id), {
          validateStatus: (status) => status === 204 || (status >= 200 && status < 300),
        }),
      );
    } catch (error) {
      throw formatAxiosError(error, { basePath });
    }
  },

  async setActive(basePath: string, id: string, is_active: boolean): Promise<MasterRecord> {
    return this.update(basePath, id, { is_active });
  },

  async getLatestExchangeRate(currencyId: string): Promise<MasterRecord | null> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(exchangeRateLatest(currencyId)),
      );
      const envelope = asRecord(res.data);
      const data = envelope && 'data' in envelope ? envelope.data : res.data;
      return normalizeMasterRecord(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
