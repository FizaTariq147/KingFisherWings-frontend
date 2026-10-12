import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import {
  SHIPMENT_API,
  SHIPMENT_DETAIL_TABS,
  SHIPMENT_SHOW_ALL_TAB_ALIASES,
  isShipmentShowAllTab,
} from '../api/shipment.api';
import type {
  ChangeShipmentBlStatusDto,
  ChangeShipmentDepartmentDto,
  ChangeShipmentStatusDto,
  CopyShipmentChargesDto,
  CreateShipmentChargeDto,
  CreateShipmentDto,
  GenerateJobFromShipmentDto,
  GetShipmentChargesDto,
  MergeShipmentsDto,
  PaginationMeta,
  Shipment,
  ShipmentListParams,
  ShipmentListResult,
  SplitShipmentDto,
  UpdateShipmentDto,
} from '../types/shipment.types';
import {
  normalizeShipment,
  normalizeShipments,
  unwrapShipmentPayload,
} from '../utils/normalizeShipment';
import { formatShipmentsPermissionError } from '../utils/shipmentPermissions';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: { page?: number; limit?: number },
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

function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.shipments) && nested.shipments) ||
      (Array.isArray(nested.data) && nested.data) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  const topLevel =
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.shipments) && envelope.shipments) ||
    [];
  if (topLevel.length) return { items: topLevel, meta: envelope.meta };
  return { items: [] };
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return new Error(formatShipmentsPermissionError(error.message));
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  const raw =
    (Array.isArray(message) && message.map(String).join('; ')) ||
    (typeof message === 'string' && message.trim() && message) ||
    (typeof data?.error === 'string' && data.error.trim() && data.error) ||
    axiosErr.message ||
    'Request failed';
  return new Error(formatShipmentsPermissionError(String(raw)));
}

function assertId(id: string) {
  if (!isUuid(id)) throw new Error('Invalid shipment id.');
}

function extractJobId(raw: unknown): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  const nested = asRecord(data.job);
  for (const value of [data.job_id, data.jobId, nested?.id, root?.job_id, root?.jobId]) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return undefined;
}

function extractShipmentId(raw: unknown): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  const nested = asRecord(data.shipment);
  for (const value of [
    data.id,
    data.shipment_id,
    data.shipmentId,
    nested?.id,
    root?.shipment_id,
  ]) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return undefined;
}

function buildListQuery(params: ShipmentListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  if (params.job_type) query.job_type = params.job_type;
  const customerId =
    (params.customer_id && isUuid(params.customer_id) && params.customer_id) ||
    (params.party_id && isUuid(params.party_id) && params.party_id) ||
    undefined;
  if (customerId) query.customer_id = customerId;
  if (params.job_id && isUuid(params.job_id)) query.job_id = params.job_id;
  if (params.quotation_id && isUuid(params.quotation_id)) {
    query.quotation_id = params.quotation_id;
  }
  return query;
}

/** OpenAPI CreateShipmentDto / UpdateShipmentDto keys only (forbidNonWhitelisted). */
const SHIPMENT_WRITE_KEYS = new Set([
  'job_type',
  'customer_id',
  'quotation_id',
  'enquiry_id',
  'company_id',
  'branch_id',
  'department_id',
  'shipper_id',
  'consignee_id',
  'notify_party_id',
  'delivery_agent_id',
  'carrier_agent_id',
  'salesperson_id',
  'carrier_id',
  'origin_port_id',
  'dest_port_id',
  'por_port_id',
  'pof_port_id',
  'place_of_delivery',
  'shipment_date',
  'customer_address',
  'freight_terms',
  'freight_payable_at',
  'freight_payment_type',
  'marks_numbers',
  'is_cross_trade',
  'etd',
  'eta',
  'atd',
  'ata',
  'onboard_date',
  'vessel_name',
  'voyage_number',
  'flight_number',
  'commodity',
  'hs_code',
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'pieces',
  'container_type_id',
  'container_count',
  'container_numbers',
  'seal_numbers',
  'incoterms',
  'is_dg',
  'dg_class',
  'notes',
  'hbl_number',
  'hbl_date',
  'bl_status',
  'charges',
  'status',
]);

/** Map FE party_id → OpenAPI customer_id; strip unknown / empty fields. */
function prepareShipmentWriteBody(
  dto: CreateShipmentDto | UpdateShipmentDto,
): Record<string, unknown> {
  const src = { ...dto } as Record<string, unknown> & {
    party_id?: string;
    customer_id?: string;
  };
  if (!src.customer_id && src.party_id && isUuid(String(src.party_id))) {
    src.customer_id = src.party_id;
  }
  delete src.party_id;

  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(src)) {
    if (!SHIPMENT_WRITE_KEYS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && !value.trim()) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    body[key] = value;
  }
  return body;
}

async function postAndNormalize(
  url: string,
  body?: unknown,
): Promise<Shipment> {
  const res = await withGatewayRetry(() =>
    body === undefined
      ? axiosInstance.post(url)
      : axiosInstance.post(url, body),
  );
  const item = normalizeShipment(unwrapShipmentPayload(res.data));
  if (item) return item;
  throw new Error('Unexpected response from shipment API.');
}

export const shipmentService = {
  async list(params: ShipmentListParams = {}): Promise<ShipmentListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.list, { params: buildListQuery(params) }),
      );
      const raw = unwrapList(res.data);
      const shipments = normalizeShipments(raw.items);
      return { shipments, meta: normalizeMeta(raw.meta, shipments.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.byId(id)));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment not found.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * Shipment detail — OpenAPI GET /shipments/:id, enriched with GET /shipments/:id/detail
   * (tabs, actions) when available.
   */
  async getDetail(id: string): Promise<Shipment> {
    assertId(id);
    const basic = await this.getById(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.detail(id)));
      const enriched = normalizeShipment(unwrapShipmentPayload(res.data) ?? res.data);
      if (enriched) return { ...basic, ...enriched, id: basic.id };
    } catch (error) {
      const err = formatAxiosError(error);
      if (!/404|not found/i.test(err.message)) throw err;
    }
    return basic;
  },

  /** GET /shipments/:id/detail/:tab — lazy tab payload. */
  async getDetailTab(id: string, tab: string): Promise<Record<string, unknown>> {
    assertId(id);
    const key = tab.trim();
    if (!key) throw new Error('Tab key is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.detailTab(id, key)),
      );
      const payload = unwrapShipmentPayload(res.data);
      return asRecord(payload) ?? asRecord(res.data) ?? { raw: payload ?? res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * Soft GET for optional related payloads — returns null on 404 / missing.
   */
  async tryGetRecord(
    url: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(url));
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data);
    } catch {
      return null;
    }
  },

  async tryGetList(url: string, listKeys: string[] = ['items', 'data', 'results']): Promise<unknown[]> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(url));
      const payload = unwrapShipmentPayload(res.data);
      if (Array.isArray(payload)) return payload;
      const rec = asRecord(payload) ?? asRecord(res.data);
      if (!rec) return [];
      for (const key of listKeys) {
        if (Array.isArray(rec[key])) return rec[key] as unknown[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fresa Show All — try dedicated `detail/show-all` keys, then aggregate every
   * other detail tab + related read APIs (charges, routing, booking-form, BL, AWB).
   */
  async getShowAll(
    id: string,
    siblingTabKeys: string[] = [],
  ): Promise<{
    sections: Array<{ key: string; title: string; data: Record<string, unknown> }>;
    arrays: Array<{ key: string; title: string; rows: unknown[] }>;
  }> {
    assertId(id);

    const sections: Array<{ key: string; title: string; data: Record<string, unknown> }> = [];
    const arrays: Array<{ key: string; title: string; rows: unknown[] }> = [];

    const pushSection = (key: string, title: string, data: Record<string, unknown> | null | undefined) => {
      if (!data || !Object.keys(data).length) return;
      sections.push({ key, title, data });
    };
    const pushArray = (key: string, title: string, rows: unknown[]) => {
      if (!rows.length) return;
      arrays.push({ key, title, rows });
    };

    // 1) Dedicated Show All endpoint(s)
    for (const alias of SHIPMENT_SHOW_ALL_TAB_ALIASES) {
      try {
        const data = await this.getDetailTab(id, alias);
        pushSection(`api-${alias}`, 'Show All', data);
        // If backend returned a rich payload, still continue aggregating so we miss nothing.
        break;
      } catch {
        /* try next alias */
      }
    }

    // 2) Core shipment record
    try {
      const basic = await this.getById(id);
      pushSection('shipment', 'Shipment', asRecord(basic) ?? {});
    } catch {
      /* ignore */
    }

    // 3) Every sibling detail tab (skip show-all itself)
    const tabKeys = Array.from(
      new Set(
        [
          ...siblingTabKeys,
          ...SHIPMENT_DETAIL_TABS,
        ]
          .map((k) => k.trim())
          .filter((k) => k && !isShipmentShowAllTab(k)),
      ),
    );

    await Promise.all(
      tabKeys.map(async (tab) => {
        try {
          const data = await this.getDetailTab(id, tab);
          const title = tab
            .replace(/[-_]/g, ' ')
            .replace(/\borgani[sz]ation\b/i, 'Party')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          // Split arrays out of tab payloads for table rendering
          const root = { ...data };
          let pushedChargeLike = false;
          for (const [k, v] of Object.entries(data)) {
            if (!Array.isArray(v)) continue;
            delete root[k];
            const isChargeLike = /charge|line/i.test(k);
            // Costing tab often returns both `charges` and `lines` — keep one table only
            if (isChargeLike) {
              if (pushedChargeLike) continue;
              pushedChargeLike = true;
              pushArray(`${tab}-charges`, `${title} · Charges`, v);
              continue;
            }
            pushArray(`${tab}-${k}`, `${title} · ${k.replace(/[-_]/g, ' ')}`, v);
          }
          pushSection(tab, title, root);
        } catch {
          /* tab may not exist for this shipment type */
        }
      }),
    );

    // 4) Related read APIs — skip when a detail tab already contributed the same list
    // (costing tab often returns charges/lines; avoid a second identical Charges block)
    const hasChargeArray = arrays.some((a) =>
      /charge|costing|lines/i.test(`${a.key} ${a.title}`),
    );
    const hasRoutingArray = arrays.some((a) =>
      /routing|leg/i.test(`${a.key} ${a.title}`),
    );

    const [charges, legs, bookingForm, bls, awb, kpi, tracking] = await Promise.all([
      hasChargeArray
        ? Promise.resolve([] as unknown[])
        : this.tryGetList(SHIPMENT_API.charges(id), ['items', 'charges', 'lines', 'data']),
      hasRoutingArray
        ? Promise.resolve([] as unknown[])
        : this.routingLegs(id).catch(() => [] as unknown[]),
      this.tryGetRecord(SHIPMENT_API.bookingForm(id)),
      this.listBillsOfLading(id).catch(() => [] as unknown[]),
      this.tryGetRecord(SHIPMENT_API.awb(id)),
      this.kpi(id).catch(() => null),
      this.tracking(id).catch(() => null),
    ]);

    if (!hasChargeArray) pushArray('charges', 'Charges', charges);
    if (!hasRoutingArray) pushArray('routing-legs', 'Routing legs', legs);
    if (bookingForm) pushSection('booking-form', 'Booking form', bookingForm);
    pushArray('bills-of-lading', 'Bills of lading', bls);
    if (awb) {
      if (Array.isArray((awb as { items?: unknown }).items)) {
        pushArray('awb', 'AWB', (awb as { items: unknown[] }).items);
      } else {
        pushSection('awb', 'AWB', awb);
      }
    }
    if (kpi) pushSection('kpi', 'KPI', kpi);
    if (tracking) pushSection('tracking', 'Track & Trace', tracking);

    // Final guard: at most one charge-like table (costing + /charges + lines aliases)
    let keptChargeBlock = false;
    const dedupedArrays = arrays.filter((block) => {
      const isChargeLike = /charge|costing|(^|[^a-z])lines([^a-z]|$)/i.test(
        `${block.key} ${block.title}`,
      );
      if (!isChargeLike) return true;
      if (keptChargeBlock) return false;
      keptChargeBlock = true;
      return true;
    });

    return { sections, arrays: dedupedArrays };
  },

  /** POST /shipments/:id/routing-legs */
  async createRoutingLeg(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.routingLegs(id), body),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** PATCH /shipments/:id/routing-legs/:legId */
  async updateRoutingLeg(
    id: string,
    legId: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    if (!isUuid(legId)) throw new Error('Invalid routing leg id.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(SHIPMENT_API.routingLegById(id, legId), body),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    try {
      const body = prepareShipmentWriteBody(dto);
      const res = await withGatewayRetry(() => axiosInstance.post(SHIPMENT_API.create, body));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment was created but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    assertId(id);
    try {
      const body = prepareShipmentWriteBody(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(SHIPMENT_API.byId(id), body),
      );
      return normalizeShipment(unwrapShipmentPayload(res.data)) ?? this.getById(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeStatus(id: string, dto: ChangeShipmentStatusDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.changeStatus(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeBlStatus(id: string, dto: ChangeShipmentBlStatusDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.changeBlStatus(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async changeDepartment(
    id: string,
    dto: ChangeShipmentDepartmentDto,
  ): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(SHIPMENT_API.changeDepartment(id), dto),
      );
      return (
        normalizeShipment(unwrapShipmentPayload(res.data)) ?? (await this.getDetail(id))
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateJob(
    id: string,
    dto: GenerateJobFromShipmentDto = { mode: 'HOUSE' },
  ): Promise<Shipment & { job_id?: string }> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.generateJob(id), dto),
      );
      const jobId = extractJobId(res.data) ?? extractJobId(unwrapShipmentPayload(res.data));
      const shipment =
        normalizeShipment(unwrapShipmentPayload(res.data)) ?? (await this.getDetail(id));
      return { ...shipment, ...(jobId ? { job_id: jobId } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async copy(id: string): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(SHIPMENT_API.copy(id)));
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (!item) throw new Error('Shipment was copied but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async split(id: string, dto: SplitShipmentDto = {}): Promise<Shipment> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.split(id), dto),
      );
      const item = normalizeShipment(unwrapShipmentPayload(res.data));
      if (item) return item;
      const newId = extractShipmentId(res.data);
      if (newId) return this.getDetail(newId);
      throw new Error('Split completed but new shipment was not returned.');
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async merge(id: string, dto: MergeShipmentsDto): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.merge(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async switchBl(id: string, body: Record<string, unknown> = {}): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.switchBl(id), body);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createSubmaster(id: string): Promise<Shipment> {
    assertId(id);
    try {
      return await postAndNormalize(SHIPMENT_API.createSubmaster(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async edi(id: string, action: string, body: Record<string, unknown> = {}): Promise<unknown> {
    assertId(id);
    if (!action.trim()) throw new Error('EDI action is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.edi(id, action.trim()), body),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async kpi(id: string): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.kpi(id)));
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async tracking(id: string): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.tracking(id)));
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async routingLegs(id: string): Promise<unknown[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.routingLegs(id)),
      );
      const payload = unwrapShipmentPayload(res.data);
      if (Array.isArray(payload)) return payload;
      const rec = asRecord(payload);
      if (Array.isArray(rec?.items)) return rec.items;
      if (Array.isArray(rec?.legs)) return rec.legs;
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /shipments/:id/charges — list sale/cost lines. */
  async listCharges(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.charges(id)));
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/charges — add charge line. */
  async addCharge(id: string, dto: CreateShipmentChargeDto): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.charges(id), dto),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/get-charges — pull from quote / party standards. */
  async pullCharges(id: string, dto: GetShipmentChargesDto = {}): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.getCharges(id), dto),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/copy-charges */
  async copyCharges(id: string, dto: CopyShipmentChargesDto): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.copyCharges(id), dto),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/documents/booking-confirmation (requires linked job). */
  async queueBookingConfirmation(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.documentBookingConfirmation(id)),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/documents/hbl (requires linked job). */
  async queueHblDocument(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.documentHbl(id)),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /shipments/:id/booking-form */
  async getBookingForm(id: string): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.bookingForm(id)),
      );
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** PUT /shipments/:id/booking-form */
  async upsertBookingForm(
    id: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.put(SHIPMENT_API.bookingForm(id), body),
      );
      return asRecord(unwrapShipmentPayload(res.data)) ?? asRecord(res.data) ?? {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /shipments/:id/booking-form/complete */
  async completeBookingForm(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(SHIPMENT_API.bookingFormComplete(id)),
      );
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listBillsOfLading(id: string): Promise<unknown[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(SHIPMENT_API.billsOfLading(id)),
      );
      const payload = unwrapShipmentPayload(res.data);
      if (Array.isArray(payload)) return payload;
      const rec = asRecord(payload);
      if (Array.isArray(rec?.items)) return rec.items;
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getAwb(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(SHIPMENT_API.awb(id)));
      return unwrapShipmentPayload(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
