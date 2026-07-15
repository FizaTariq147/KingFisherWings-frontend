import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { TARIFF_API } from '../api/tariff.api';
import { normalizeTariff, normalizeTariffs } from '../utils/normalizeTariff';
import { prepareTariffPayload } from '../utils/prepareTariffPayload';
import {
  forgetSessionTariff,
  listSessionTariffs,
  rememberSessionTariff,
} from '../utils/tariffSessionRegistry';
import type {
  CreateTariffDto,
  PaginationMeta,
  Tariff,
  TariffListParams,
  TariffListResult,
  UpdateTariffDto,
} from '../types/tariff.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: TariffListParams,
): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

function pickArray(...candidates: unknown[]): unknown[] | null {
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
}

/**
 * Accept common Nest list envelopes. Missing this → create works but list shows "No tariffs found".
 */
function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };

  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };

  const named = pickArray(
    envelope.items,
    envelope.results,
    envelope.records,
    envelope.tariffs,
    envelope.rows,
  );
  if (named) return { items: named, meta: envelope.meta };

  if (Array.isArray(envelope.data)) {
    return { items: envelope.data, meta: envelope.meta };
  }

  const nested = asRecord(envelope.data);
  if (nested) {
    const list =
      pickArray(
        nested.items,
        nested.results,
        nested.records,
        nested.tariffs,
        nested.rows,
        nested.data,
      ) ?? [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }

  for (const value of Object.values(envelope)) {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((row) => row && typeof row === 'object' && 'id' in (row as object))
    ) {
      return { items: value, meta: envelope.meta };
    }
  }

  return { items: [] };
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  if ('data' in envelope) {
    const data = envelope.data;
    const nested = asRecord(data);
    if (nested && (nested.id || nested.quotation_id)) return data;
    if (nested?.tariff) return nested.tariff;
    return data;
  }
  if (envelope.tariff) return envelope.tariff;
  return raw;
}

function extractId(raw: unknown): string | null {
  const stack: unknown[] = [raw, unwrapEntity(raw)];
  const seen = new Set<unknown>();
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const key of ['id', 'tariff_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.tariff, rec.result]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: {
      status?: number;
      data?: {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };
    };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  const status = axiosErr.response?.status;
  if (status) return new Error(`Request failed (${status})`);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string): asserts id is string {
  if (!id || !isUuid(id)) throw new Error('Invalid tariff id.');
}

function isQuotationRouteShadowError(error: unknown): boolean {
  const axiosErr = error as {
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const status = axiosErr.response?.status;
  if (status !== 400 && status !== 422) return false;
  const message = axiosErr.response?.data?.message;
  const text = Array.isArray(message) ? message.join(' ') : String(message ?? '');
  return /uuid is expected/i.test(text);
}

function buildListQuery(params: TariffListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.order === 'asc' || params.order === 'desc') query.order = params.order;
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

function filterLocalTariffs(items: Tariff[], params: TariffListParams): Tariff[] {
  let next = [...items];
  if (typeof params.is_active === 'boolean') {
    next = next.filter((t) => (t.is_active !== false) === params.is_active);
  }
  const q = params.search?.trim().toLowerCase();
  if (q) {
    next = next.filter((t) => {
      const hay = [
        t.service_type,
        t.charge_code,
        t.charge_name,
        t.charge_code_id,
        t.currency_code,
        t.origin_port_code,
        t.dest_port_code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }
  next.sort((a, b) => {
    const left = a.created_at || a.valid_from || a.id;
    const right = b.created_at || b.valid_from || b.id;
    return params.order === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
  });
  return next;
}

async function fetchTariffById(id: string): Promise<Tariff> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get<ApiEnvelope<Tariff> | Tariff>(TARIFF_API.byId(id), {
      withCredentials: false,
    }),
  );
  const tariff = normalizeTariff(unwrapEntity(res.data));
  if (!tariff) throw new Error('Tariff not found.');
  return tariff;
}

async function hydrateSessionTariffs(): Promise<Tariff[]> {
  const remembered = listSessionTariffs();
  if (remembered.length === 0) return [];
  const out: Tariff[] = [];
  for (const row of remembered) {
    if (!isUuid(row.id)) {
      out.push(row);
      continue;
    }
    try {
      const fresh = await fetchTariffById(row.id);
      rememberSessionTariff(fresh);
      out.push(fresh);
    } catch {
      out.push(row);
    }
  }
  return out;
}

export const tariffService = {
  async list(params: TariffListParams = {}): Promise<TariffListResult> {
    const tryRemote = async (path: string, query?: Record<string, string | number | boolean>) => {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(path, {
          params: query,
          withCredentials: false,
        }),
      );
      const { items, meta } = unwrapList(res.data);
      const tariffs = normalizeTariffs(items);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info('[tariff.list]', {
          path,
          unwrapped: items.length,
          normalized: tariffs.length,
        });
      }
      return { tariffs, meta: normalizeMeta(meta, tariffs.length, params) };
    };

    try {
      // Prefer plain list path; minimal query first (some gateways choke on extra params).
      try {
        return await tryRemote(TARIFF_API.list, {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        });
      } catch (firstError) {
        if (!isQuotationRouteShadowError(firstError)) {
          // Retry full query before falling through.
          return await tryRemote(TARIFF_API.list, buildListQuery(params));
        }
        throw firstError;
      }
    } catch (error) {
      if (!isQuotationRouteShadowError(error)) {
        throw formatAxiosError(error);
      }

      // Collection GET is shadowed. Load known tariffs via GET /quotations/tariffs/{id}.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(
          '[tariff.list] GET /quotations/tariffs shadowed — loading via GET /quotations/tariffs/{id}',
        );
      }

      const sessionRows = filterLocalTariffs(await hydrateSessionTariffs(), params);
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const start = (page - 1) * limit;
      const slice = sessionRows.slice(start, start + limit);
      return {
        tariffs: slice,
        meta: {
          page,
          limit,
          total: sessionRows.length,
          totalPages: Math.max(1, Math.ceil(sessionRows.length / Math.max(limit, 1))),
        },
        backendListUnavailable: true,
      };
    }
  },

  async getById(id: string): Promise<Tariff> {
    assertId(id);
    try {
      const tariff = await fetchTariffById(id);
      rememberSessionTariff(tariff);
      return tariff;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateTariffDto): Promise<Tariff> {
    try {
      const prepared = prepareTariffPayload(dto as Record<string, unknown>);
      if (!isUuid(String(prepared.charge_code_id ?? ''))) {
        throw new Error('Charge code is required and must be a valid UUID.');
      }
      if (typeof prepared.sale_rate !== 'number' || typeof prepared.cost_rate !== 'number') {
        throw new Error('Sale rate and cost rate are required.');
      }
      if (!prepared.currency_code || !prepared.valid_from || !prepared.service_type) {
        throw new Error('Service type, currency, and valid from are required.');
      }

      // Exact CreateTariffDto fields only — never send company_id (not in Swagger; Prisma can 500).
      const requiredBody: Record<string, unknown> = {
        service_type: String(prepared.service_type),
        charge_code_id: String(prepared.charge_code_id),
        sale_rate: Number(prepared.sale_rate),
        cost_rate: Number(prepared.cost_rate),
        currency_code: String(prepared.currency_code).toUpperCase().slice(0, 3),
        valid_from: String(prepared.valid_from).slice(0, 10),
      };

      const fullBody: Record<string, unknown> = { ...requiredBody };
      if (prepared.unit && String(prepared.unit).trim()) {
        fullBody.unit = String(prepared.unit).trim();
      }
      if (prepared.valid_to && String(prepared.valid_to).trim()) {
        fullBody.valid_to = String(prepared.valid_to).slice(0, 10);
      }
      if (typeof prepared.is_active === 'boolean') {
        fullBody.is_active = prepared.is_active;
      }

      const postTariff = (payload: Record<string, unknown>) =>
        withGatewayRetry(() =>
          axiosInstance.post<unknown>(TARIFF_API.list, payload, {
            withCredentials: false,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      const isServerError = (error: unknown) =>
        (error as { response?: { status?: number } })?.response?.status === 500;

      // Attempt order: Swagger-shaped body → required-only → ISO dates → string rates
      const attempts: Record<string, unknown>[] = [
        fullBody,
        requiredBody,
        {
          ...requiredBody,
          valid_from: `${String(requiredBody.valid_from)}T00:00:00.000Z`,
        },
        {
          ...requiredBody,
          sale_rate: String(requiredBody.sale_rate),
          cost_rate: String(requiredBody.cost_rate),
        },
      ];

      let lastError: unknown;
      let usedBody = fullBody;

      for (let i = 0; i < attempts.length; i++) {
        const payload = attempts[i];
        usedBody = payload;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.info(
            `[tariff.create] attempt ${i + 1}/${attempts.length} POST /quotations/tariffs`,
            JSON.stringify(payload, null, 2),
          );
        }
        try {
          const res = await postTariff(payload);
          const tariff = normalizeTariff(unwrapEntity(res.data));
          if (!tariff) {
            const id = extractId(res.data);
            if (id) return this.getById(id);
            throw new Error('Create succeeded but no tariff was returned.');
          }

          const patch: Record<string, unknown> = {};
          if (prepared.origin_port_id) patch.origin_port_id = prepared.origin_port_id;
          if (prepared.dest_port_id && prepared.dest_port_id !== prepared.origin_port_id) {
            patch.dest_port_id = prepared.dest_port_id;
          }
          if (prepared.container_type_id) patch.container_type_id = prepared.container_type_id;
          if (prepared.customer_id) patch.customer_id = prepared.customer_id;
          if (Object.keys(patch).length > 0) {
            try {
              const updated = await this.update(tariff.id, patch as UpdateTariffDto);
              rememberSessionTariff(updated);
              return updated;
            } catch {
              rememberSessionTariff(tariff);
              return tariff;
            }
          }
          rememberSessionTariff(tariff);
          return tariff;
        } catch (err) {
          lastError = err;
          // Only keep trying alternate shapes on opaque 500s.
          if (!isServerError(err) || i === attempts.length - 1) break;
        }
      }

      if (import.meta.env.DEV) {
        const axiosErr = lastError as { response?: { status?: number; data?: unknown } };
        // eslint-disable-next-line no-console
        console.error('[tariff.create] failed', {
          status: axiosErr?.response?.status,
          response: axiosErr?.response?.data,
          lastRequestBody: usedBody,
        });
      }
      throw lastError;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateTariffDto): Promise<Tariff> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          TARIFF_API.byId(id),
          prepareTariffPayload(dto as Record<string, unknown>),
          { withCredentials: false },
        ),
      );
      const tariff = normalizeTariff(unwrapEntity(res.data));
      if (!tariff) throw new Error('Update succeeded but no tariff was returned.');
      rememberSessionTariff(tariff);
      return tariff;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(TARIFF_API.byId(id), { withCredentials: false }),
      );
      forgetSessionTariff(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async setActive(id: string, is_active: boolean): Promise<Tariff> {
    return this.update(id, { is_active });
  },
};
