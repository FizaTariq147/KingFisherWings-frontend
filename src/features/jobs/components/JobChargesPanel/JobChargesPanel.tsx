import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ClipboardList,
  Copy,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  History,
  ListOrdered,
  Package,
  Paperclip,
  Pencil,
  Percent,
  Plus,
  Receipt,
  Scale,
  ShoppingCart,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useFileDownload } from '@/features/files/hooks/useFileDownload';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { AddChargeCodeModal } from '@/features/masters/components/AddChargeCodeModal';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { JobSearchSelect, ShipmentSearchSelect } from '@/features/shared/entity-search';
import { useAuthStore } from '@/store/authStore';
import { VOUCHER_ROUTE_PREFIX } from '@/features/vouchers/api/voucher.api';
import {
  VOUCHER_TYPE_LABELS,
  VOUCHER_TYPES,
  type VoucherType,
} from '@/features/vouchers/constants/voucher.constants';
import {
  normalizeVoucher,
  voucherDisplayNumber,
} from '@/features/vouchers/utils/normalizeVoucher';
import type { Voucher } from '@/features/vouchers/types/voucher.types';
import { erpTable } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { useJobActions, useJobChargeMutations } from '../../hooks/useJobActions';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import {
  useJobBulkPurchasePreview,
  useJobChargeAttachments,
  useJobCharges,
  useJobChargesHistory,
  useJobGpum,
  useJobHouseJobs,
  useJobPnl,
  useJobPnlCustomDuty,
  useJobShipmentsList,
  useJobVouchersList,
  useProfitShareAccounts,
  useProfitShareCalculator,
} from '../../hooks/useJobs';
import type {
  CreateJobChargesCompositeDto,
  Job,
  JobCharge,
} from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { jobDisplayNumber } from '../../utils/jobRoute';
import { normalizeJobCharges } from '../../utils/normalizeJob';
import { resolveJobDocumentFileUrl } from '../../utils/resolveJobDocumentFileUrl';
import { ApiDataView } from '../ApiDataView';
import {
  JobInvoiceFormModal,
  type JobInvoiceFormKind,
} from '../JobInvoiceFormModal';
import { JobPnlSummary } from '../JobPnlPanel/JobPnlPanel';
import { enrichPartiesIncludedNames } from '../../utils/normalizeCostingParties';
import { PartiesIncludedSummary } from '../PartiesIncludedSummary';

/** Fresa Costing toolbar — each action has a unique solid color */
const COSTING_COLORS = {
  accrued: { backgroundColor: '#EAB308', borderColor: '#CA8A04', color: '#FFFFFF' },
  vendorInv: { backgroundColor: '#A855F7', borderColor: '#7C3AED', color: '#FFFFFF' },
  profitShare: { backgroundColor: '#F97316', borderColor: '#EA580C', color: '#FFFFFF' },
  sale: { backgroundColor: '#FF751F', borderColor: '#E55F00', color: '#FFFFFF' },
  cost: { backgroundColor: '#38BDF8', borderColor: '#0284C7', color: '#FFFFFF' },
  charges: { backgroundColor: '#9333EA', borderColor: '#7E22CE', color: '#FFFFFF' },
  getCharges: { backgroundColor: '#B45309', borderColor: '#92400E', color: '#FFFFFF' },
  getJobCharges: { backgroundColor: '#78716C', borderColor: '#57534E', color: '#FFFFFF' },
  add: { backgroundColor: '#2563EB', borderColor: '#1D4ED8', color: '#FFFFFF' },
  cancelProrate: { backgroundColor: '#EF4444', borderColor: '#DC2626', color: '#FFFFFF' },
  generateProrate: { backgroundColor: '#3B82F6', borderColor: '#1D4ED8', color: '#FFFFFF' },
  vouchersList: { backgroundColor: '#EC4899', borderColor: '#DB2777', color: '#FFFFFF' },
  generateVoucher: { backgroundColor: '#C026D3', borderColor: '#A21CAF', color: '#FFFFFF' },
  salesInv: { backgroundColor: '#FB923C', borderColor: '#EA580C', color: '#FFFFFF' },
  purchaseInv: { backgroundColor: '#0EA5E9', borderColor: '#0369A1', color: '#FFFFFF' },
  purchaseBulk: { backgroundColor: '#0369A1', borderColor: '#0C4A6E', color: '#FFFFFF' },
  jobProfit: { backgroundColor: '#7C3AED', borderColor: '#5B21B6', color: '#FFFFFF' },
  customDuty: { backgroundColor: '#14B8A6', borderColor: '#0F766E', color: '#FFFFFF' },
  vouchersOs: { backgroundColor: '#F43F5E', borderColor: '#BE123C', color: '#FFFFFF' },
  addlChg: { backgroundColor: '#64748B', borderColor: '#475569', color: '#FFFFFF' },
  history: { backgroundColor: '#334155', borderColor: '#1E293B', color: '#FFFFFF' },
  copyCharges: { backgroundColor: '#06B6D4', borderColor: '#0E7490', color: '#FFFFFF' },
} as const;

function CostingBtn({
  color,
  children,
  disabled,
  onClick,
  title,
  icon,
}: {
  color: CSSProperties;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  icon?: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      title={title}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      style={{
        ...color,
        borderWidth: 1,
        borderStyle: 'solid',
        boxShadow: '0 1px 0 rgba(10, 41, 66, 0.12)',
      }}
    >
      {children}
    </Button>
  );
}

const ICO = 'h-3.5 w-3.5';

function vouchersFromUnknown(raw: unknown): Voucher[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeVoucher).filter((v): v is Voucher => Boolean(v));
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    for (const key of ['vouchers', 'items', 'data', 'results']) {
      if (Array.isArray(rec[key])) return vouchersFromUnknown(rec[key]);
    }
  }
  return [];
}

/** Costing grid — white column dividers */
const COSTING_COL = 'border-r border-white last:border-r-0';
/** Sale columns — match Sale toolbar (#FF751F) */
const SALE_TH = `bg-[#FF751F] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px] uppercase tracking-wide ${COSTING_COL}`;
const SALE_TD = `bg-[#FFE8CC] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums ${COSTING_COL}`;
/** Cost columns — match Cost toolbar (#38BDF8) */
const COST_TH = `bg-[#38BDF8] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px] uppercase tracking-wide ${COSTING_COL}`;
const COST_TD = `bg-[#D9F1FB] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums ${COSTING_COL}`;
const COSTING_TH = `${erpTable.th} ${COSTING_COL}`;
const COSTING_TD = `bg-white px-3 py-1.5 text-[13px] text-[#334155] align-middle ${COSTING_COL}`;

function CostingGridIconButton({
  title,
  disabled,
  onClick,
  icon,
  badge,
  tone,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  badge?: number;
  tone: 'sale' | 'cost';
}) {
  const iconColor =
    tone === 'sale' ? 'text-[#FF751F]' : 'text-[#0284C7]';
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className={`inline-flex items-center justify-center p-0.5 transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-35 ${iconColor}`}
        title={title}
        aria-label={title}
        disabled={disabled}
        onClick={onClick}
      >
        {icon}
      </button>
      {badge != null && badge > 0 ? (
        <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--color-primary,#0A2942)] px-0.5 text-[9px] font-bold leading-none text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </span>
  );
}
const FIELD_LABEL =
  'mb-1 block text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]';
const FIELD_CONTROL =
  'w-full rounded-sm bg-white px-2 py-1.5 text-[13px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]';
const TAB_BTN =
  'px-3 py-1.5 text-[13px] font-medium border-b-2 -mb-px transition-colors';
const TAB_ACTIVE =
  'border-[#FF751F] text-[var(--fresa-header-text,#0A2942)]';
const TAB_IDLE =
  'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--fresa-header-text,#0A2942)]';

const PROFIT_SHARE_AGENT_TYPES = new Set([
  'AGENT',
  'SUPPLIER',
  'VENDOR',
  'SHIPPING_LINE',
  'AIRLINE',
  'OVERSEAS_AGENT',
  'CFS_PORT_AGENT',
]);

type DialogKey =
  | 'add'
  | 'getJobCharges'
  | 'getCharges'
  | 'copyCharges'
  | 'profitShare'
  | 'prorate'
  | 'generateVoucher'
  | 'addlChg'
  | 'bulkPurchase'
  | null;

type GridFilter = 'all' | 'sale' | 'cost' | 'accrued';
type SidePanel = 'vouchers' | 'vouchersOs' | 'pnl' | 'customDuty' | 'gpum' | null;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function shipmentOptions(raw: unknown): { id: string; label: string }[] {
  const list = Array.isArray(raw)
    ? raw
    : (() => {
        const rec = asRecord(raw);
        if (!rec) return [];
        for (const key of ['items', 'shipments', 'data', 'results']) {
          if (Array.isArray(rec[key])) return rec[key] as unknown[];
        }
        return [];
      })();
  return list
    .map((item) => {
      const r = asRecord(item);
      if (!r) return null;
      const id = String(r.id ?? r.shipment_id ?? '').trim();
      if (!id || !isUuid(id)) return null;
      const number = String(
        r.shipment_number ?? r.shipmentNumber ?? r.reference ?? '',
      ).trim();
      const party = String(
        r.customer_name ??
          r.customerName ??
          r.shipper_name ??
          r.shipperName ??
          r.billing_party_name ??
          r.party_name ??
          '',
      ).trim();
      const date = String(
        r.shipment_date ?? r.shipmentDate ?? r.created_at ?? r.createdAt ?? '',
      ).trim();
      const dateLabel = date
        ? date.slice(0, 10).toUpperCase().replace(/-/g, '-')
        : '';
      // Fresa: "SHIPMENT_NO / PARTY / DATE"
      const parts = [number || id.slice(0, 8), party, dateLabel].filter(Boolean);
      return { id, label: parts.join(' / ') };
    })
    .filter((x): x is { id: string; label: string } => Boolean(x));
}

function previewChargeRows(raw: unknown): JobCharge[] {
  const normalized = normalizeJobCharges(raw);
  if (normalized.length > 0) return normalized;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['charges', 'preview_charges', 'lines', 'items', 'data']) {
    const nested = normalizeJobCharges(rec[key]);
    if (nested.length > 0) return nested;
  }
  return [];
}

function pickNum(rec: Record<string, unknown> | null, ...keys: string[]): number | undefined {
  if (!rec) return undefined;
  for (const k of keys) {
    const n = Number(rec[k]);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickStr(rec: Record<string, unknown> | null, ...keys: string[]): string {
  if (!rec) return '';
  for (const k of keys) {
    const v = rec[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

/** Normalize profit-share preview payload into Sale / Cost summary + line grids. */
function parseProfitSharePreview(raw: unknown): {
  saleAmount?: number;
  costAmount?: number;
  currency?: string;
  grossProfit?: number;
  ourProfitShare?: number;
  ourProfitShareLabel?: string;
  shipmentNumbers?: string;
  saleLines: JobCharge[];
  costLines: JobCharge[];
  details: Record<string, unknown>;
} {
  const rec = asRecord(raw) ?? {};
  const sale = asRecord(rec.sale) ?? asRecord(rec.sale_details) ?? asRecord(rec.saleDetails);
  const cost = asRecord(rec.cost) ?? asRecord(rec.cost_details) ?? asRecord(rec.costDetails);
  const ourShare =
    asRecord(rec.our_profit_share) ??
    asRecord(rec.ourProfitShare) ??
    (typeof rec.our_profit_share === 'number' ? { amount: rec.our_profit_share } : null);
  const saleLines = previewChargeRows(
    rec.declared_sale_lines ??
      rec.declaredSaleLines ??
      rec.sale_lines ??
      rec.saleLines ??
      rec.declared_sale ??
      rec.declaredSale ??
      sale?.lines ??
      sale?.items ??
      rec.charges,
  ).filter((c) => c.sale_amount != null || Boolean(c.sale) || !c.is_cost);
  const costLines = previewChargeRows(
    rec.declared_cost_lines ??
      rec.declaredCostLines ??
      rec.cost_lines ??
      rec.costLines ??
      rec.declared_cost ??
      rec.declaredCost ??
      cost?.lines ??
      cost?.items,
  ).filter((c) => c.cost_amount != null || Boolean(c.cost) || Boolean(c.is_cost));
  // If API returns a flat charge list, split by dual-sided amounts (not is_cost alone)
  const allLines = previewChargeRows(raw);
  const saleFromAll = allLines.filter(
    (c) => c.sale_amount != null || Boolean(c.sale) || !c.is_cost,
  );
  const costFromAll = allLines.filter(
    (c) => c.cost_amount != null || Boolean(c.cost) || Boolean(c.is_cost),
  );
  const saleAmount =
    pickNum(
      rec,
      'declared_sale_total',
      'declaredSaleTotal',
      'sale_amount',
      'saleAmount',
      'total_sale',
      'totalSale',
    ) ??
    pickNum(sale, 'amount', 'total', 'line_total', 'lineTotal') ??
    (saleLines.length
      ? saleLines.reduce((s, c) => s + Number(c.line_total ?? c.unit_price ?? 0), 0)
      : undefined);
  const costAmount =
    pickNum(
      rec,
      'declared_cost_total',
      'declaredCostTotal',
      'cost_amount',
      'costAmount',
      'total_cost',
      'totalCost',
    ) ??
    pickNum(cost, 'amount', 'total', 'line_total', 'lineTotal') ??
    (costLines.length
      ? costLines.reduce((s, c) => s + Number(c.line_total ?? c.unit_price ?? 0), 0)
      : undefined);
  const currency =
    pickStr(rec, 'currency', 'currency_code', 'currencyCode') ||
    pickStr(sale, 'currency', 'currency_code', 'currencyCode') ||
    pickStr(cost, 'currency', 'currency_code', 'currencyCode') ||
    undefined;
  const grossProfit =
    pickNum(rec, 'gross_profit', 'grossProfit', 'profit', 'gp') ??
    (saleAmount != null && costAmount != null ? saleAmount - costAmount : undefined);
  const ourProfitShare =
    pickNum(ourShare ?? {}, 'amount', 'value', 'total') ??
    pickNum(rec, 'our_profit_share', 'ourProfitShare');
  const ourProfitShareLabel =
    pickStr(ourShare ?? {}, 'label', 'name', 'title') ||
    (ourProfitShare != null ? 'Our Profit Share' : undefined);
  const shipmentRaw =
    rec.shipment_numbers ??
    rec.shipmentNumbers ??
    rec.shipment_no ??
    rec.shipmentNo;
  const shipmentNumbers = Array.isArray(shipmentRaw)
    ? shipmentRaw.map(String).filter(Boolean).join(', ')
    : typeof shipmentRaw === 'string'
      ? shipmentRaw.trim()
      : undefined;
  return {
    saleAmount,
    costAmount,
    currency,
    grossProfit,
    ourProfitShare,
    ourProfitShareLabel,
    shipmentNumbers: shipmentNumbers || undefined,
    saleLines: saleLines.length ? saleLines : saleFromAll,
    costLines: costLines.length ? costLines : costFromAll,
    details: rec,
  };
}

function parseProfitShareCalculator(raw: unknown): {
  grossWeight?: number;
  netWeight?: number;
  volumeCbm?: number;
  chargeableWeight?: number;
  pieces?: number;
  shipmentNumbers?: string;
} {
  const rec = asRecord(raw) ?? {};
  const data = asRecord(rec.data) ?? rec;
  const shipmentRaw =
    data.shipment_numbers ?? data.shipmentNumbers ?? data.shipment_no ?? data.shipmentNo;
  return {
    grossWeight: pickNum(data, 'gross_weight', 'grossWeight', 'g_weight', 'G'),
    netWeight: pickNum(data, 'net_weight', 'netWeight', 'n_weight', 'N'),
    volumeCbm: pickNum(data, 'volume_cbm', 'volumeCbm', 'volume', 'cbm'),
    chargeableWeight: pickNum(
      data,
      'chargeable_weight',
      'chargeableWeight',
      'chargeable',
    ),
    pieces: pickNum(data, 'pieces', 'pkgs', 'packages'),
    shipmentNumbers: Array.isArray(shipmentRaw)
      ? shipmentRaw.map(String).filter(Boolean).join(', ')
      : typeof shipmentRaw === 'string'
        ? shipmentRaw.trim() || undefined
        : undefined,
  };
}

function parseProfitShareAccounts(raw: unknown): {
  id: string;
  label: string;
}[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(asRecord(raw)?.items)
      ? (asRecord(raw)!.items as unknown[])
      : Array.isArray(asRecord(raw)?.data)
        ? (asRecord(raw)!.data as unknown[])
        : Array.isArray(asRecord(asRecord(raw)?.data)?.items)
          ? (asRecord(asRecord(raw)!.data)!.items as unknown[])
          : [];
  return list
    .map((item) => {
      const r = asRecord(item);
      if (!r) return null;
      const id = String(r.id ?? '').trim();
      if (!isUuid(id)) return null;
      const code = String(r.code ?? r.account_code ?? '').trim();
      const name = String(r.name ?? r.account_name ?? r.label ?? '').trim();
      return {
        id,
        label: code && name ? `${code} — ${name}` : name || code || id.slice(0, 8),
      };
    })
    .filter((x): x is { id: string; label: string } => Boolean(x));
}

interface JobChargesPanelProps {
  job: Job;
  onChanged?: () => void;
}

export function JobChargesPanel({ job, onChanged }: JobChargesPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [gridFilter, setGridFilter] = useState<GridFilter>('all');
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [voucherType, setVoucherType] = useState<VoucherType>('JOURNAL');
  const [voucherSide, setVoucherSide] = useState<'SALE' | 'COST'>('SALE');
  const [voucherChargeIds, setVoucherChargeIds] = useState<Set<string>>(new Set());
  const [voucherNarration, setVoucherNarration] = useState('');
  const [addlPercent, setAddlPercent] = useState('');
  const [addlBaseChargeId, setAddlBaseChargeId] = useState('');

  const chargesQuery = useJobCharges(job.id);
  const chargesHistoryQuery = useJobChargesHistory(job.id, showHistory);
  const shipmentsQuery = useJobShipmentsList(job.id);
  const houseJobsQuery = useJobHouseJobs(
    job.id,
    Boolean(job.id && !job.parent_job_id),
  );
  const tabResources = useJobTabResourceMutations(job.id);
  const vouchersQuery = useJobVouchersList(
    job.id,
    sidePanel === 'vouchers' || sidePanel === 'vouchersOs',
  );
  const pnlQuery = useJobPnl(job.id, true);
  const customDutyQuery = useJobPnlCustomDuty(job.id, sidePanel === 'customDuty');
  const gpumQuery = useJobGpum(job.id, sidePanel === 'gpum');
  const mutations = useJobChargeMutations(job.id);
  const actions = useJobActions(job.id);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  const { downloadStoredFile } = useFileDownload();
  const [invoiceForm, setInvoiceForm] = useState<{
    kind: JobInvoiceFormKind;
    allowPdf?: boolean;
  } | null>(null);

  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );
  const { data: taxRates = [] } = useMasterOptions(
    'tax-rates',
    MASTER_PATHS['tax-rates'],
    true,
  );
  const { data: customersResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: agentsResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'AGENT',
    order: 'asc',
  });
  const { data: suppliersResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'SUPPLIER',
    order: 'asc',
  });
  const { data: vendorsResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'VENDOR',
    order: 'asc',
  });
  const { data: shippingLinesResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'SHIPPING_LINE',
    order: 'asc',
  });
  const { data: airlinesResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'AIRLINE',
    order: 'asc',
  });

  const charges = useMemo(() => {
    if (chargesQuery.data?.charges?.length) return chargesQuery.data.charges;
    return job.charges ?? [];
  }, [chargesQuery.data, job.charges]);

  const partiesIncludedRaw = chargesQuery.data?.parties_included ?? [];

  const visibleCharges = useMemo(() => {
    if (gridFilter === 'sale')
      return charges.filter(
        (c) =>
          c.sale_amount != null ||
          Boolean(c.sale) ||
          (!c.is_cost && c.cost_amount == null),
      );
    if (gridFilter === 'cost')
      return charges.filter(
        (c) =>
          c.cost_amount != null ||
          Boolean(c.cost) ||
          Boolean(c.is_cost),
      );
    if (gridFilter === 'accrued')
      return charges.filter((c) => Boolean(c.is_provisional) || Boolean(c.is_cost));
    return charges;
  }, [charges, gridFilter]);

  const vouchers = useMemo(
    () => vouchersFromUnknown(vouchersQuery.data),
    [vouchersQuery.data],
  );

  const vouchersOs = useMemo(
    () =>
      vouchers.filter((v) => {
        const status = String(v.status ?? '').toUpperCase();
        return (
          status.includes('OPEN') ||
          status.includes('OUTSTAND') ||
          status.includes('PENDING') ||
          status.includes('DRAFT') ||
          status.includes('UNPAID')
        );
      }),
    [vouchers],
  );

  const shipmentOpts = useMemo(
    () => shipmentOptions(shipmentsQuery.data),
    [shipmentsQuery.data],
  );

  const attachedShipmentCount = useMemo(() => {
    const ids = new Set(shipmentOpts.map((s) => s.id));
    if (job.shipment_id && isUuid(job.shipment_id)) ids.add(job.shipment_id);
    return ids.size;
  }, [shipmentOpts, job.shipment_id]);

  const houseJobs = houseJobsQuery.data ?? [];
  const houseJobCount = houseJobs.length;

  const partyAccountOpts = useMemo(() => {
    const list = [
      ...(customersResult?.parties ?? []),
      ...(agentsResult?.parties ?? []),
    ].filter((p) => isUuid(p.id));
    const seen = new Set<string>();
    return list.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [customersResult?.parties, agentsResult?.parties]);

  const vendorOpts = useMemo(() => {
    const list = [
      ...(suppliersResult?.parties ?? []),
      ...(vendorsResult?.parties ?? []),
      ...(shippingLinesResult?.parties ?? []),
      ...(airlinesResult?.parties ?? []),
      ...(agentsResult?.parties ?? []),
    ].filter((p) => isUuid(p.id));
    const seen = new Set<string>();
    return list.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [
    suppliersResult?.parties,
    vendorsResult?.parties,
    shippingLinesResult?.parties,
    airlinesResult?.parties,
    agentsResult?.parties,
  ]);

  const profitShareAgentOpts = useMemo(() => {
    return vendorOpts.filter((p) => PROFIT_SHARE_AGENT_TYPES.has(p.party_type));
  }, [vendorOpts]);

  const partyNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of [...partyAccountOpts, ...vendorOpts]) {
      const name = String(p.name ?? '').trim();
      if (isUuid(p.id) && name) map.set(p.id, name);
    }
    return map;
  }, [partyAccountOpts, vendorOpts]);

  const partiesIncluded = useMemo(
    () => enrichPartiesIncludedNames(partiesIncludedRaw, partyNameById),
    [partiesIncludedRaw, partyNameById],
  );

  const chargeCodeOpts = useMemo(
    () =>
      chargeCodes
        .filter((c) => isUuid(String(c.id)))
        .map((c) => ({
          id: String(c.id),
          code: String(c.code ?? '').trim(),
          label: String(c.code ?? c.name ?? c.id),
          name: String(c.name ?? c.code ?? '').trim(),
        })),
    [chargeCodes],
  );

  const taxRateOptions = useMemo(
    () =>
      taxRates
        .filter((t) => isUuid(String(t.id)))
        .map((t) => {
          const name = String(t.name ?? t.label ?? '').trim();
          const code = String(t.code ?? '').trim();
          const rate = t.rate != null ? `${t.rate}%` : '';
          const label = [name || code || 'Tax rate', rate].filter(Boolean).join(' · ');
          return { value: String(t.id), label };
        })
        .filter((o) => o.label && !isUuid(o.label)),
    [taxRates],
  );

  const chargeLineOptions = useMemo(
    () =>
      charges
        .filter((c) => isUuid(c.id))
        .map((c) => ({
          value: c.id,
          label:
            c.description ||
            c.charge_code ||
            c.charge_code_name ||
            'Charge',
        })),
    [charges],
  );

  /** Master job cost-side lines — required by POST …/prorate-to-shipments. */
  const costCharges = useMemo(
    () =>
      charges.filter(
        (c) =>
          c.cost_amount != null || Boolean(c.cost) || Boolean(c.is_cost),
      ),
    [charges],
  );

  const isHouseJob = Boolean(job.parent_job_id && isUuid(job.parent_job_id));

  const [dialog, setDialog] = useState<DialogKey>(null);
  const bulkPurchasePreviewQuery = useJobBulkPurchasePreview(
    job.id,
    dialog === 'bulkPurchase',
  );
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Add charge — Fresa Charge / Sale / Cost tabs → POST composite (all OpenAPI fields)
  const [addTab, setAddTab] = useState<'charge' | 'sale' | 'cost'>('charge');
  const [chargeCodeId, setChargeCodeId] = useState('');
  const [addChargeCodeOpen, setAddChargeCodeOpen] = useState(false);
  const [addChargeCodeTarget, setAddChargeCodeTarget] = useState<
    'charge' | 'profitShare' | 'prorate'
  >('charge');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [ppCc, setPpCc] = useState<'PP' | 'CC' | ''>('');
  const [lineNo, setLineNo] = useState('');
  const [ofdType, setOfdType] = useState('');
  const [chargeRemarks, setChargeRemarks] = useState('');
  const [isProvisional, setIsProvisional] = useState(false);
  const [saleBillTo, setSaleBillTo] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleQty, setSaleQty] = useState('1');
  const [saleCurrency, setSaleCurrency] = useState('AED');
  const [saleExRate, setSaleExRate] = useState('1');
  const [saleFcy, setSaleFcy] = useState('');
  const [saleTaxAmount, setSaleTaxAmount] = useState('');
  const [saleTaxGroup, setSaleTaxGroup] = useState('');
  const [saleTaxRateId, setSaleTaxRateId] = useState('');
  const [saleTaxable, setSaleTaxable] = useState('');
  const [saleDrCr, setSaleDrCr] = useState<'DR' | 'CR' | ''>('CR');
  const [saleRemarks, setSaleRemarks] = useState('');
  const [costVendor, setCostVendor] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costCurrency, setCostCurrency] = useState('AED');
  const [costExRate, setCostExRate] = useState('1');
  const [costFcy, setCostFcy] = useState('');
  const [costTaxAmount, setCostTaxAmount] = useState('');
  const [costDrCr, setCostDrCr] = useState<'DR' | 'CR' | ''>('DR');
  const [costRemarks, setCostRemarks] = useState('');
  const [costDeclarationNo, setCostDeclarationNo] = useState('');
  const [costDeclarationDate, setCostDeclarationDate] = useState('');
  const [costReferenceNo, setCostReferenceNo] = useState('');
  const [costDate, setCostDate] = useState('');

  // Get Job Charges (Fresa: Type=Shipment → Shipment No. → select → Submit)
  const [gjcShipmentId, setGjcShipmentId] = useState('');
  const [gjcSideFilter, setGjcSideFilter] = useState<'ALL' | 'SALE' | 'COST'>('ALL');
  const [gjcPreview, setGjcPreview] = useState<JobCharge[]>([]);
  const [gjcSelected, setGjcSelected] = useState<Set<string>>(new Set());
  const [gjcLoading, setGjcLoading] = useState(false);

  const gjcVisible = useMemo(() => {
    if (gjcSideFilter === 'SALE') return gjcPreview.filter((c) => !c.is_cost);
    if (gjcSideFilter === 'COST') return gjcPreview.filter((c) => Boolean(c.is_cost));
    return gjcPreview;
  }, [gjcPreview, gjcSideFilter]);

  // Get Charges
  const [fromQuotation, setFromQuotation] = useState(true);
  const [fromPartyStandard, setFromPartyStandard] = useState(false);

  // Copy Charges
  const [copyFromJobId, setCopyFromJobId] = useState('');
  const [copyFromShipmentId, setCopyFromShipmentId] = useState('');
  const [copyFromQuotationId, setCopyFromQuotationId] = useState('');
  const [copySale, setCopySale] = useState(true);
  const [copyCost, setCopyCost] = useState(true);

  // Profit Share calculator (Fresa blog steps 4–7)
  const [psChargeCodeId, setPsChargeCodeId] = useState('');
  const [psPercent, setPsPercent] = useState('');
  const [psAgentId, setPsAgentId] = useState('');
  const [psAccountId, setPsAccountId] = useState('');
  const [psAccountSearch, setPsAccountSearch] = useState('');
  const [psPreview, setPsPreview] = useState<ReturnType<
    typeof parseProfitSharePreview
  > | null>(null);
  const psCalculatorQuery = useProfitShareCalculator(
    job.id,
    dialog === 'profitShare',
  );
  const psAccountsQuery = useProfitShareAccounts(
    job.id,
    psAccountSearch,
    dialog === 'profitShare',
  );
  const psCalculator = useMemo(
    () => parseProfitShareCalculator(psCalculatorQuery.data),
    [psCalculatorQuery.data],
  );
  const psCoaAccounts = useMemo(
    () => parseProfitShareAccounts(psAccountsQuery.data),
    [psAccountsQuery.data],
  );

  // Prorate
  const [prorateCodeId, setProrateCodeId] = useState('');
  const [prorateChargeId, setProrateChargeId] = useState('');
  const [prorateAttachShipmentId, setProrateAttachShipmentId] = useState('');

  // Storage / attachments (secondary)
  const [storageUpto, setStorageUpto] = useState('');
  const [storagePreview, setStoragePreview] = useState<unknown>(null);
  const [attachChargeId, setAttachChargeId] = useState('');
  const [attachFileName, setAttachFileName] = useState('');
  const [attachFileUrl, setAttachFileUrl] = useState('');
  const [attachPickFile, setAttachPickFile] = useState<File | null>(null);
  const [attachSide, setAttachSide] = useState<'CHARGE' | 'SALE' | 'COST'>('CHARGE');
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const attachListQuery = useJobChargeAttachments(
    job.id,
    attachChargeId,
    attachModalOpen && isUuid(attachChargeId),
    attachSide === 'CHARGE' ? 'CHARGE' : attachSide,
  );
  const [sideEdit, setSideEdit] = useState<{
    chargeId: string;
    side: 'SALE' | 'COST';
    amount: string;
    taxAmount: string;
    drCr: string;
    remarks: string;
  } | null>(null);

  const closeDialog = () => setDialog(null);

  const openSideEdit = (c: JobCharge, side: 'SALE' | 'COST') => {
    const view = side === 'SALE' ? c.sale : c.cost;
    setSideEdit({
      chargeId: c.id,
      side,
      amount: String(
        view?.local_amount ??
          view?.amount ??
          (side === 'SALE' && !c.is_cost
            ? c.unit_price
            : side === 'COST' && c.is_cost
              ? c.unit_price
              : '') ??
          '',
      ),
      taxAmount: String(
        (side === 'SALE' ? c.sale_tax_amount : c.cost_tax_amount) ??
          view?.tax_amount ??
          '',
      ),
      drCr: String(
        (side === 'SALE' ? c.sale_dr_cr : c.cost_dr_cr) ??
          view?.dr_cr ??
          (side === 'SALE' ? 'CR' : 'DR'),
      ),
      remarks: String(view?.remarks ?? c.remarks ?? ''),
    });
  };

  const saveSideEdit = async () => {
    if (!sideEdit) return;
    const amount = Number(sideEdit.amount);
    const taxAmount = sideEdit.taxAmount.trim()
      ? Number(sideEdit.taxAmount)
      : undefined;
    const dto = {
      amount: Number.isFinite(amount) ? amount : undefined,
      tax_amount:
        taxAmount != null && Number.isFinite(taxAmount) ? taxAmount : undefined,
      dr_cr:
        sideEdit.drCr === 'DR' || sideEdit.drCr === 'CR'
          ? sideEdit.drCr
          : undefined,
      remarks: sideEdit.remarks.trim() || undefined,
    };
    setError(null);
    setMsg(null);
    try {
      if (sideEdit.side === 'SALE') {
        await mutations.updateSale.mutateAsync({
          chargeId: sideEdit.chargeId,
          dto,
        });
      } else {
        await mutations.updateCost.mutateAsync({
          chargeId: sideEdit.chargeId,
          dto,
        });
      }
      setMsg(`${sideEdit.side} updated.`);
      setSideEdit(null);
      onChanged?.();
      void chargesQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openSideAttach = (chargeId: string, side: 'SALE' | 'COST') => {
    setAttachChargeId(chargeId);
    setAttachSide(side);
    setAttachFileName('');
    setAttachFileUrl('');
    setAttachPickFile(null);
    setSidePanel(null);
    setAttachModalOpen(true);
  };

  const submitChargeAttachment = async () => {
    const chargeId = attachChargeId.trim();
    if (!isUuid(chargeId)) {
      setError('Invalid charge id.');
      return;
    }
    if (attachPickFile) {
      await run(
        () =>
          actions.uploadChargeAttachmentFile.mutateAsync({
            chargeId,
            file: attachPickFile,
            side: attachSide,
          }),
        `${attachSide} attachment uploaded.`,
      );
      setAttachPickFile(null);
      setAttachModalOpen(false);
      return;
    }
    if (!attachFileName.trim() || !attachFileUrl.trim()) {
      setError('Choose a file to upload or enter file name and URL.');
      return;
    }
    await run(
      () =>
        actions.createChargeAttachment.mutateAsync({
          chargeId,
          dto: {
            file_name: attachFileName.trim(),
            file_url: attachFileUrl.trim(),
            side: attachSide,
          },
        }),
      `${attachSide} attachment added.`,
    );
    setAttachModalOpen(false);
  };

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      if (success) setMsg(success);
      onChanged?.();
      void chargesQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadGetJobChargesPreview = async (shipmentId: string) => {
    if (!isUuid(shipmentId)) return;
    setGjcLoading(true);
    setError(null);
    try {
      const raw = await actions.getJobChargesFromShipment.mutateAsync({
        type: 'SHIPMENT',
        shipment_id: shipmentId,
        confirm: false,
      });
      const rows = previewChargeRows(raw);
      setGjcPreview(rows);
      setGjcSelected(new Set(rows.map((c) => c.id).filter(Boolean)));
    } catch (err) {
      setError(getErrorMessage(err));
      setGjcPreview([]);
      setGjcSelected(new Set());
    } finally {
      setGjcLoading(false);
    }
  };

  const resetAddForm = () => {
    setChargeCodeId('');
    setDescription('');
    setQuantity('1');
    setUnit('');
    setPpCc('');
    setLineNo('');
    setOfdType('');
    setChargeRemarks('');
    setIsProvisional(false);
    setSaleBillTo(job.billing_party_id || job.shipper_id || '');
    setSaleAmount('');
    setSaleQty('1');
    setSaleCurrency(job.currency_code || 'AED');
    setSaleExRate('1');
    setSaleFcy('');
    setSaleTaxAmount('');
    setSaleTaxGroup('');
    setSaleTaxRateId('');
    setSaleTaxable('');
    setSaleDrCr('CR');
    setSaleRemarks('');
    setCostVendor('');
    setCostAmount('');
    setCostCurrency(job.currency_code || 'AED');
    setCostExRate('1');
    setCostFcy('');
    setCostTaxAmount('');
    setCostDrCr('DR');
    setCostRemarks('');
    setCostDeclarationNo('');
    setCostDeclarationDate('');
    setCostReferenceNo('');
    setCostDate('');
    setAddTab('charge');
  };

  const openDialog = (key: DialogKey) => {
    setError(null);
    setMsg(null);
    if (key === 'getJobCharges') {
      setGjcPreview([]);
      setGjcSelected(new Set());
      setGjcSideFilter('ALL');
      const initial = gjcShipmentId || shipmentOpts[0]?.id || '';
      if (initial && initial !== gjcShipmentId) setGjcShipmentId(initial);
      if (isUuid(initial)) void loadGetJobChargesPreview(initial);
    }
    if (key === 'add') {
      resetAddForm();
    }
    if (key === 'profitShare') {
      setPsPreview(null);
      setPsPercent('');
      // Prefer a freight-like charge already on the job when present
      const freight = charges.find((c) =>
        /freight/i.test(`${c.description ?? ''} ${c.charge_code ?? ''}`),
      );
      if (freight?.charge_code_id && isUuid(freight.charge_code_id)) {
        setPsChargeCodeId(freight.charge_code_id);
      }
    }
    if (key === 'prorate') {
      setProrateCodeId('');
      setProrateChargeId('');
      setProrateAttachShipmentId('');
      void shipmentsQuery.refetch();
      void houseJobsQuery.refetch();
      const firstCost = charges.find(
        (c) => c.cost_amount != null || Boolean(c.cost) || Boolean(c.is_cost),
      );
      if (firstCost?.id) {
        setProrateChargeId(firstCost.id);
        if (firstCost.charge_code_id && isUuid(firstCost.charge_code_id)) {
          setProrateCodeId(firstCost.charge_code_id);
        }
      }
    }
    if (key === 'bulkPurchase') {
      void bulkPurchasePreviewQuery.refetch();
    }
    setDialog(key);
  };

  const addCharge = async () => {
    if (!isUuid(chargeCodeId.trim())) {
      setError('Select a Freight / charge code on the Charge tab.');
      setAddTab('charge');
      return;
    }
    const chargeOpt = chargeCodeOpts.find((c) => c.id === chargeCodeId.trim());
    const desc =
      description.trim() ||
      chargeOpt?.name ||
      chargeOpt?.label ||
      '';
    if (!desc) {
      setError('Description is required on the Charge tab.');
      setAddTab('charge');
      return;
    }
    const qty = quantity === '' ? 1 : Number(quantity);
    const saleAmt = saleAmount === '' ? undefined : Number(saleAmount);
    const costAmt = costAmount === '' ? undefined : Number(costAmount);
    if (saleAmt == null && costAmt == null) {
      setError('Enter a Sale amount and/or Cost amount.');
      setAddTab(saleAmt == null ? 'sale' : 'cost');
      return;
    }

    const billToParty = partyAccountOpts.find((p) => p.id === saleBillTo.trim());
    const vendorParty = vendorOpts.find((p) => p.id === costVendor.trim());
    const sQty = saleQty === '' ? qty : Number(saleQty);
    const dto: CreateJobChargesCompositeDto = {
      charge: {
        ...(isUuid(chargeCodeId.trim())
          ? { charge_code_id: chargeCodeId.trim() }
          : {}),
        ...(chargeOpt?.code ? { charge_code: chargeOpt.code } : {}),
        ...(chargeOpt?.name ? { charge_code_name: chargeOpt.name } : {}),
        description: desc,
        quantity: Number.isFinite(qty) ? qty : 1,
        ...(unit.trim() ? { unit: unit.trim() } : {}),
        ...(ppCc ? { pp_cc: ppCc } : {}),
        ...(lineNo !== '' && Number.isFinite(Number(lineNo))
          ? { line_no: Number(lineNo) }
          : {}),
        ...(ofdType.trim() ? { ofd_type: ofdType.trim() } : {}),
        ...(chargeRemarks.trim() ? { remarks: chargeRemarks.trim() } : {}),
      },
      is_provisional: isProvisional || undefined,
      ...(saleAmt != null && Number.isFinite(saleAmt)
        ? {
            sale: {
              amount: saleAmt,
              qty: Number.isFinite(sQty) ? sQty : 1,
              currency: saleCurrency.trim().toUpperCase() || 'AED',
              ex_rate: Number(saleExRate) || 1,
              ...(isUuid(saleBillTo.trim()) ? { bill_to: saleBillTo.trim() } : {}),
              ...(billToParty?.code?.trim()
                ? { bill_to_code: billToParty.code.trim() }
                : {}),
              ...(billToParty?.name?.trim()
                ? { bill_to_name: billToParty.name.trim() }
                : {}),
              ...(saleFcy !== '' && Number.isFinite(Number(saleFcy))
                ? { fcy_amount: Number(saleFcy) }
                : {}),
              ...(saleTaxAmount !== '' && Number.isFinite(Number(saleTaxAmount))
                ? { tax_amount: Number(saleTaxAmount) }
                : {}),
              ...(saleTaxGroup.trim()
                ? { tax_group_code: saleTaxGroup.trim() }
                : {}),
              ...(isUuid(saleTaxRateId.trim())
                ? { tax_rate_id: saleTaxRateId.trim() }
                : {}),
              ...(saleTaxable !== '' && Number.isFinite(Number(saleTaxable))
                ? { taxable_amount: Number(saleTaxable) }
                : {}),
              ...(saleDrCr ? { dr_cr: saleDrCr } : {}),
              ...(saleRemarks.trim() ? { remarks: saleRemarks.trim() } : {}),
            },
          }
        : {}),
      ...(costAmt != null && Number.isFinite(costAmt)
        ? {
            cost: {
              amount: costAmt,
              currency: costCurrency.trim().toUpperCase() || 'AED',
              ex_rate: Number(costExRate) || 1,
              ...(isUuid(costVendor.trim()) ? { vendor: costVendor.trim() } : {}),
              ...(vendorParty?.code?.trim()
                ? { vendor_code: vendorParty.code.trim() }
                : {}),
              ...(vendorParty?.name?.trim()
                ? { vendor_name: vendorParty.name.trim() }
                : {}),
              ...(costFcy !== '' && Number.isFinite(Number(costFcy))
                ? { fcy_amount: Number(costFcy) }
                : {}),
              ...(costTaxAmount !== '' && Number.isFinite(Number(costTaxAmount))
                ? { tax_amount: Number(costTaxAmount) }
                : {}),
              ...(costDrCr ? { dr_cr: costDrCr } : {}),
              ...(costRemarks.trim() ? { remarks: costRemarks.trim() } : {}),
              ...(costDeclarationNo.trim()
                ? { declaration_no: costDeclarationNo.trim() }
                : {}),
              ...(costDeclarationDate
                ? { declaration_date: costDeclarationDate }
                : {}),
              ...(costReferenceNo.trim()
                ? { reference_no: costReferenceNo.trim() }
                : {}),
              ...(costDate ? { date: costDate } : {}),
            },
          }
        : {}),
    };

    await run(async () => {
      await mutations.createComposite.mutateAsync(dto);
      resetAddForm();
      closeDialog();
    }, 'Charge added with Sale / Cost.');
  };

  const confirmGetJobCharges = async () => {
    if (!isUuid(gjcShipmentId)) {
      setError('Select a shipment.');
      return;
    }
    const chargeIds = [...gjcSelected];
    if (chargeIds.length === 0) {
      setError('Select at least one charge, then Submit.');
      return;
    }
    await run(
      () =>
        actions.getJobChargesFromShipment.mutateAsync({
          type: 'SHIPMENT',
          shipment_id: gjcShipmentId,
          confirm: true,
          charge_ids: chargeIds,
        }),
      'Selected shipment charges added to Job Costing.',
    );
    closeDialog();
  };

  const submitGetCharges = async () => {
    await run(
      () =>
        actions.pullJobCharges.mutateAsync({
          from_quotation: fromQuotation,
          from_party_standard: fromPartyStandard,
        }),
      'Charges pulled.',
    );
    closeDialog();
  };

  const submitCopyCharges = async () => {
    const dto = {
      from_job_id: isUuid(copyFromJobId.trim()) ? copyFromJobId.trim() : undefined,
      from_shipment_id: isUuid(copyFromShipmentId.trim())
        ? copyFromShipmentId.trim()
        : undefined,
      from_quotation_id: isUuid(copyFromQuotationId.trim())
        ? copyFromQuotationId.trim()
        : undefined,
      copy_sale: copySale,
      copy_cost: copyCost,
    };
    if (!dto.from_job_id && !dto.from_shipment_id && !dto.from_quotation_id) {
      setError('Select a source job, shipment, or quotation.');
      return;
    }
    await run(() => actions.copyJobCharges.mutateAsync(dto), 'Charges copied.');
    closeDialog();
  };

  const runProfitPreview = async () => {
    if (!isUuid(psChargeCodeId.trim())) {
      setError('Select the Profit Share Calculation Charge Code.');
      return;
    }
    setError(null);
    try {
      const raw = await actions.profitSharePreview.mutateAsync({
        charge_code_id: psChargeCodeId.trim(),
      });
      setPsPreview(parseProfitSharePreview(raw));
    } catch (err) {
      setError(getErrorMessage(err));
      setPsPreview(null);
    }
  };

  const submitProfitShare = async () => {
    const percent = Number(psPercent);
    if (!isUuid(psChargeCodeId.trim())) {
      setError('Select the Profit Share Calculation Charge Code.');
      return;
    }
    if (!psPreview) {
      setError('Click Calculate Profit Share first.');
      return;
    }
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      setError('Enter Profit Share Percentage (0–100).');
      return;
    }
    if (!isUuid(psAgentId.trim())) {
      setError(
        'Select Profit Share Agent (must be Carrier, Agent, Supplier, or Vendor).',
      );
      return;
    }
    await run(
      () =>
        actions.profitShareAdd.mutateAsync({
          charge_code_id: psChargeCodeId.trim(),
          profit_share_percent: percent,
          profit_share_agent_id: psAgentId.trim(),
          profit_share_account_id: isUuid(psAccountId.trim())
            ? psAccountId.trim()
            : undefined,
        }),
      'Profit Share line added to Job Costing.',
    );
    setPsPreview(null);
    setPsPercent('');
    setPsAgentId('');
    setPsAccountId('');
    closeDialog();
  };

  const resolveProrateChargeCodeId = (): string | null => {
    const code = prorateCodeId.trim();
    if (isUuid(code)) return code;
    const chargeId = prorateChargeId.trim();
    const row = costCharges.find((c) => c.id === chargeId);
    if (row?.charge_code_id && isUuid(row.charge_code_id)) return row.charge_code_id;
    return null;
  };

  const submitProrate = async () => {
    if (isHouseJob) {
      setError(
        'Prorate runs on the master job. Open the parent job and add a cost line there first.',
      );
      return;
    }
    if (!costCharges.length) {
      setError(
        'No cost line on this job to prorate. Add a Cost amount for the charge (Costing → Add → Cost tab), then try again.',
      );
      return;
    }
    if (attachedShipmentCount === 0) {
      setError(
        houseJobCount > 0
          ? 'No attached shipments. Attach or create a shipment below, or use “Prorate to house jobs”.'
          : 'This master job has no attached shipments to prorate to. Attach an existing shipment or create one on this job first.',
      );
      return;
    }
    const code = prorateCodeId.trim();
    const chargeId = prorateChargeId.trim();
    if (!isUuid(code) && !isUuid(chargeId)) {
      setError('Select a cost job charge, or a charge code that has a cost line on this master job.');
      return;
    }
    await run(
      () =>
        actions.prorateToShipments.mutateAsync({
          charge_code_id: isUuid(code) ? code : undefined,
          job_charge_id: isUuid(chargeId) ? chargeId : undefined,
        }),
      'Prorated to shipments.',
    );
    closeDialog();
  };

  const submitProrateToHouses = async () => {
    if (isHouseJob) {
      setError('Prorate runs on the master job, not a house job.');
      return;
    }
    if (!costCharges.length) {
      setError('Add a cost line on this master job first.');
      return;
    }
    const chargeCodeId = resolveProrateChargeCodeId();
    if (!chargeCodeId) {
      setError('Select a cost line (or charge code) to prorate to house jobs.');
      return;
    }
    if (!houseJobCount) {
      setError('No house jobs on this master. Attach shipments or create house jobs first.');
      return;
    }
    await run(
      () => actions.prorateCost.mutateAsync(chargeCodeId),
      'Prorated cost to house jobs.',
    );
    closeDialog();
  };

  const attachShipmentForProrate = async () => {
    const sid = prorateAttachShipmentId.trim();
    if (!isUuid(sid)) {
      setError('Select a valid shipment to attach.');
      return;
    }
    setError(null);
    setMsg(null);
    try {
      const body = { shipment_ids: [sid] };
      try {
        await tabResources.attachExistingShipments.mutateAsync(body);
      } catch {
        await tabResources.createLinkShipments.mutateAsync(body);
      }
      setProrateAttachShipmentId('');
      setMsg('Shipment attached to this master job.');
      await shipmentsQuery.refetch();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const createShipmentForProrate = async () => {
    const customerId = job.shipper_id || job.billing_party_id || '';
    if (!job.job_type) {
      setError('Job type is required to create a shipment.');
      return;
    }
    if (!isUuid(customerId)) {
      setError('Job needs a shipper (customer) before a shipment can be created.');
      return;
    }
    setError(null);
    setMsg(null);
    try {
      await tabResources.createLinkShipments.mutateAsync({
        create: {
          job_type: job.job_type,
          customer_id: customerId,
          ...(job.company_id && isUuid(job.company_id)
            ? { company_id: job.company_id }
            : {}),
          ...(job.branch_id && isUuid(job.branch_id) ? { branch_id: job.branch_id } : {}),
          ...(job.quotation_id && isUuid(job.quotation_id)
            ? { quotation_id: job.quotation_id }
            : {}),
        },
      });
      setMsg('Shipment created and linked to this master job.');
      await shipmentsQuery.refetch();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openAddCostForProrate = () => {
    const code = prorateCodeId.trim();
    closeDialog();
    resetAddForm();
    if (isUuid(code)) setChargeCodeId(code);
    setAddTab('cost');
    setDialog('add');
  };

  const submitGenerateVoucher = async () => {
    const ids = [...voucherChargeIds].filter((id) => isUuid(id));
    if (!ids.length) {
      setError('Select at least one charge for the voucher.');
      return;
    }
    await run(
      () =>
        actions.generateVoucher.mutateAsync({
          voucher_type: voucherType,
          charge_ids: ids,
          side: voucherSide,
          narration: voucherNarration.trim() || undefined,
          currency_code: job.currency_code || undefined,
        }),
      'Draft voucher generated from costing.',
    );
    setSidePanel('vouchers');
    closeDialog();
  };

  const submitAddlChg = async () => {
    const pct = Number(addlPercent);
    const base = charges.find((c) => c.id === addlBaseChargeId);
    if (!base || !isUuid(base.charge_code_id)) {
      setError('Select a base charge line.');
      return;
    }
    if (!Number.isFinite(pct) || pct <= 0) {
      setError('Enter Addl. Chg% greater than 0.');
      return;
    }
    const baseAmt = Number(base.unit_price ?? 0);
    const addlAmt = (baseAmt * pct) / 100;
    await run(async () => {
      await mutations.create.mutateAsync({
        charge_code_id: base.charge_code_id,
        description: `${base.description || 'Charge'} — Addl. ${pct}%`,
        unit_price: addlAmt,
        currency_code: base.currency_code || job.currency_code || 'AED',
        quantity: base.quantity ?? 1,
        is_cost: Boolean(base.is_cost),
        ...(base.party_id && isUuid(base.party_id)
          ? { party_id: base.party_id }
          : {}),
      });
      setAddlPercent('');
      setAddlBaseChargeId('');
      closeDialog();
    }, `Additional ${pct}% charge added.`);
  };

  const toggleGjc = (id: string) => {
    setGjcSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="kf-section-enter space-y-4">
      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}

      {/* Fresa Costing toolbar — every button a unique color */}
      <div className="kf-section-ambient space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-3 py-2.5">
        <div className="flex flex-wrap gap-2">
          <CostingBtn
            color={COSTING_COLORS.accrued}
            icon={<Wallet className={ICO} />}
            title="Show accrued / provisional cost lines"
            onClick={() => {
              setGridFilter('accrued');
              setSidePanel('gpum');
              void gpumQuery.refetch();
            }}
          >
            Accrued Cost
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.vendorInv}
            icon={<Truck className={ICO} />}
            title="Purchase / vendor invoice form (optional PDF upload)"
            onClick={() => setInvoiceForm({ kind: 'purchase', allowPdf: true })}
          >
            Vendor INV Upload
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.profitShare}
            icon={<Calculator className={ICO} />}
            onClick={() => openDialog('profitShare')}
          >
            Profit Share
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.sale}
            icon={<ShoppingCart className={ICO} />}
            title="Show sale charges"
            onClick={() => setGridFilter('sale')}
          >
            Sale
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.cost}
            icon={<Package className={ICO} />}
            title="Show cost charges"
            onClick={() => setGridFilter('cost')}
          >
            Cost
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.charges}
            icon={<ListOrdered className={ICO} />}
            title="Show all charges"
            onClick={() => setGridFilter('all')}
          >
            Charges
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.getCharges}
            icon={<ClipboardList className={ICO} />}
            onClick={() => openDialog('getCharges')}
          >
            Get Charges
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.getJobCharges}
            icon={<FileSpreadsheet className={ICO} />}
            onClick={() => openDialog('getJobCharges')}
          >
            Get Job Charges
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.add}
            icon={<Plus className={ICO} />}
            onClick={() => openDialog('add')}
          >
            Add
          </CostingBtn>
        </div>
        <div className="flex flex-wrap gap-2">
          <CostingBtn
            color={COSTING_COLORS.cancelProrate}
            icon={<X className={ICO} />}
            disabled={actions.cancelProrateToShipments.isPending}
            onClick={() =>
              void run(
                () => actions.cancelProrateToShipments.mutateAsync({}),
                'Prorate cancelled.',
              )
            }
          >
            Cancel Prorate
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.generateProrate}
            icon={<Scale className={ICO} />}
            onClick={() => openDialog('prorate')}
          >
            Generate Prorate
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.vouchersList}
            icon={<Receipt className={ICO} />}
            onClick={() =>
              setSidePanel((p) => (p === 'vouchers' ? null : 'vouchers'))
            }
          >
            Vouchers List
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.generateVoucher}
            icon={<FilePlus2 className={ICO} />}
            onClick={() => {
              setVoucherChargeIds(
                new Set(charges.map((c) => c.id).filter((id) => isUuid(id))),
              );
              openDialog('generateVoucher');
            }}
          >
            Generate Voucher
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.salesInv}
            icon={<FileText className={ICO} />}
            title="Sales invoice form (sale charges → quotation → empty)"
            onClick={() => setInvoiceForm({ kind: 'sale' })}
          >
            Generate Sales Invoice
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.purchaseInv}
            icon={<FileText className={ICO} />}
            title="Purchase invoice form (vendor offer → costing → empty)"
            onClick={() => setInvoiceForm({ kind: 'purchase' })}
          >
            Generate Purchase Invoice
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.purchaseBulk}
            icon={<FileSpreadsheet className={ICO} />}
            title="Bulk purchase invoice preview + generate (one PI per vendor)"
            disabled={actions.generateBulkPurchaseInvoice.isPending}
            onClick={() => openDialog('bulkPurchase')}
          >
            Bulk Purchase Invoice
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.jobProfit}
            icon={<Calculator className={ICO} />}
            disabled={actions.generateJobPnl.isPending}
            onClick={() => {
              setSidePanel('pnl');
              void run(
                () => actions.generateJobPnl.mutateAsync({}),
                'Job Profit Sheet queued.',
              );
            }}
          >
            Job Profit Sheet
          </CostingBtn>
        </div>
        <div className="flex flex-wrap gap-2">
          <CostingBtn
            color={COSTING_COLORS.customDuty}
            icon={<Percent className={ICO} />}
            disabled={actions.generateJobPnlCustomDuty.isPending}
            onClick={() => {
              setSidePanel('customDuty');
              void run(
                () => actions.generateJobPnlCustomDuty.mutateAsync({}),
                'Job Profit Sheet / Custom Duty queued.',
              );
            }}
          >
            Job Profit Sheet / Custom Duty
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.vouchersOs}
            icon={<Receipt className={ICO} />}
            onClick={() =>
              setSidePanel((p) => (p === 'vouchersOs' ? null : 'vouchersOs'))
            }
          >
            Vouchers List with OS
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.addlChg}
            icon={<Percent className={ICO} />}
            onClick={() => openDialog('addlChg')}
          >
            Addl. Chg%
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.copyCharges}
            icon={<Copy className={ICO} />}
            onClick={() => openDialog('copyCharges')}
          >
            Copy Charges
          </CostingBtn>
          <CostingBtn
            color={COSTING_COLORS.history}
            icon={<History className={ICO} />}
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? 'Hide History' : 'Costing History'}
          </CostingBtn>
        </div>
      </div>

      {/* Charge grid — Fresa Costing table chrome */}
      <Card
        padding="none"
        className="kf-section-enter border-[var(--fresa-border,#C9D3DF)] shadow-none overflow-hidden"
      >
        <CardHeader className="mb-0 border-b border-[var(--fresa-border,#C9D3DF)] bg-white px-4 py-2.5">
          <CardTitle className="text-[#0f172a]">
            Costing
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto bg-white">
          {chargesQuery.isLoading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              Loading charges…
            </p>
          ) : visibleCharges.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              {charges.length === 0
                ? 'No charges yet. Use + Add or Get Job Charges.'
                : `No charges for filter “${gridFilter}”.`}
            </p>
          ) : (
            <table className="w-full min-w-[1280px] border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  <th className={COSTING_TH}>Line No.</th>
                  <th className={COSTING_TH}>Charge</th>
                  <th className={COSTING_TH}>Unit</th>
                  <th className={COSTING_TH}>Qty</th>
                  <th className={COSTING_TH}>PP / CC</th>
                  <th className={COSTING_TH} title="Revision history lines">
                    Lines
                  </th>
                  <th className={SALE_TH}>Sale Amount</th>
                  <th className={SALE_TH}>Sale Tax</th>
                  <th className={SALE_TH}>Dr / Cr</th>
                  <th className={`${SALE_TH} w-10`} aria-label="Sale edit" />
                  <th className={`${SALE_TH} w-10`} aria-label="Sale attachments" />
                  <th className={COST_TH}>Cost Amount</th>
                  <th className={COST_TH}>Cost Tax</th>
                  <th className={COST_TH}>Dr / Cr</th>
                  <th className={`${COST_TH} w-10`} aria-label="Cost edit" />
                  <th className={`${COST_TH} w-10`} aria-label="Cost attachments" />
                  <th className={COSTING_TH}>GP</th>
                  <th className={COSTING_TH}>Party / Vendor</th>
                  <th className={COSTING_TH}>CCY</th>
                  <th className={COSTING_TH}>Status</th>
                  <th className={COSTING_TH} />
                </tr>
              </thead>
              <tbody>
                {visibleCharges.map((c: JobCharge, idx) => {
                  const saleAmt =
                    c.sale_amount ??
                    c.sale?.local_amount ??
                    c.sale?.amount ??
                    (!c.is_cost && c.cost_amount == null
                      ? (c.line_total ?? c.unit_price)
                      : undefined);
                  const costAmt =
                    c.cost_amount ??
                    c.cost?.local_amount ??
                    c.cost?.amount ??
                    (c.is_cost || (c.sale_amount == null && c.cost_amount != null)
                      ? (c.line_total ?? c.unit_price)
                      : undefined);
                  const gp =
                    c.gross_profit ??
                    (saleAmt != null && costAmt != null
                      ? Number(saleAmt) - Number(costAmt)
                      : undefined);
                  const saleEditable = c.sale?.editable !== false;
                  const costEditable = c.cost?.editable !== false;
                  const saleAtt =
                    c.sale?.attachment_count ?? c.attachment_count ?? 0;
                  const costAtt =
                    c.cost?.attachment_count ?? c.attachment_count ?? 0;
                  const linesCount = c.history_count;
                  return (
                  <tr key={c.id} className={erpTable.row}>
                    <td className={COSTING_TD}>{c.line_no ?? (idx + 1) * 10}</td>
                    <td className={`${COSTING_TD} font-medium`}>
                      {c.description || '—'}
                      {c.charge_code || c.charge_code_name ? (
                        <span className="ml-1 text-[11px] text-[#64748b]">
                          — {c.charge_code || c.charge_code_name}
                        </span>
                      ) : null}
                    </td>
                    <td className={COSTING_TD}>{c.unit || '—'}</td>
                    <td className={`${COSTING_TD} text-right tabular-nums`}>
                      {c.quantity ?? c.sale?.qty ?? '—'}
                    </td>
                    <td className={COSTING_TD}>
                      {c.pp_cc === 'PP'
                        ? 'PREPAID'
                        : c.pp_cc === 'CC'
                          ? 'COLLECT'
                          : c.pp_cc || '—'}
                    </td>
                    <td
                      className={`${COSTING_TD} tabular-nums`}
                      title="history_count from JobCostingGridLineDto"
                    >
                      {linesCount ?? '—'}
                    </td>
                    <td className={SALE_TD}>{saleAmt ?? '—'}</td>
                    <td className={SALE_TD}>
                      {c.sale_tax_amount ?? c.sale?.tax_amount ?? '—'}
                    </td>
                    <td className={SALE_TD}>
                      {c.sale_dr_cr ?? c.sale?.dr_cr ?? (!c.is_cost ? 'CR' : '—')}
                    </td>
                    <td className={`${SALE_TD} text-center`}>
                      <CostingGridIconButton
                        tone="sale"
                        icon={<Pencil className="h-4 w-4 stroke-[2.5]" />}
                        title={
                          saleEditable
                            ? 'Edit sale (PATCH …/sale)'
                            : 'Sale not editable'
                        }
                        disabled={!saleEditable || mutations.updateSale.isPending}
                        onClick={() => openSideEdit(c, 'SALE')}
                      />
                    </td>
                    <td className={`${SALE_TD} text-center`}>
                      <CostingGridIconButton
                        tone="sale"
                        icon={<Paperclip className="h-4 w-4 stroke-[2.5]" />}
                        title="Sale attachments (?side=SALE)"
                        badge={saleAtt}
                        onClick={() => openSideAttach(c.id, 'SALE')}
                      />
                    </td>
                    <td className={COST_TD}>{costAmt ?? '—'}</td>
                    <td className={COST_TD}>
                      {c.cost_tax_amount ?? c.cost?.tax_amount ?? '—'}
                    </td>
                    <td className={COST_TD}>
                      {c.cost_dr_cr ?? c.cost?.dr_cr ?? (c.is_cost ? 'DR' : '—')}
                    </td>
                    <td className={`${COST_TD} text-center`}>
                      <CostingGridIconButton
                        tone="cost"
                        icon={<Pencil className="h-4 w-4 stroke-[2.5]" />}
                        title={
                          costEditable
                            ? 'Edit cost (PATCH …/cost)'
                            : 'Cost not editable'
                        }
                        disabled={!costEditable || mutations.updateCost.isPending}
                        onClick={() => openSideEdit(c, 'COST')}
                      />
                    </td>
                    <td className={`${COST_TD} text-center`}>
                      <CostingGridIconButton
                        tone="cost"
                        icon={<Paperclip className="h-4 w-4 stroke-[2.5]" />}
                        title="Cost attachments (?side=COST)"
                        badge={costAtt}
                        onClick={() => openSideAttach(c.id, 'COST')}
                      />
                    </td>
                    <td
                      className={`${COSTING_TD} tabular-nums font-semibold ${
                        gp != null && gp >= 0
                          ? 'text-[var(--color-success-700)]'
                          : gp != null
                            ? 'text-[var(--color-danger-600)]'
                            : ''
                      }`}
                    >
                      {gp ?? '—'}
                    </td>
                    <td className={COSTING_TD}>
                      {c.sale?.bill_to_name ||
                        c.cost?.vendor_name ||
                        c.party_name ||
                        (c.sale?.bill_to
                          ? partyNameById.get(c.sale.bill_to)
                          : undefined) ||
                        (c.cost?.vendor
                          ? partyNameById.get(c.cost.vendor)
                          : undefined) ||
                        (c.party_id ? partyNameById.get(c.party_id) : undefined) ||
                        '—'}
                    </td>
                    <td className={COSTING_TD}>
                      {c.sale?.currency ||
                        c.cost?.currency ||
                        c.currency_code ||
                        '—'}
                    </td>
                    <td className={COSTING_TD}>
                      {c.prorated_status ||
                        (c.is_provisional ? 'PROVISIONAL' : '—')}
                    </td>
                    <td className={COSTING_TD}>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          void run(
                            () => mutations.remove.mutateAsync(c.id),
                            'Charge removed.',
                          )
                        }
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <PartiesIncludedSummary parties={partiesIncluded} />

      {showHistory ? (
        <Card className="kf-section-enter">
          <CardHeader>
            <CardTitle>Costing History</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mb-2"
              disabled={chargesHistoryQuery.isFetching}
              onClick={() => void chargesHistoryQuery.refetch()}
            >
              Refresh history
            </Button>
            {chargesHistoryQuery.isLoading || chargesHistoryQuery.isFetching ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading history…</p>
            ) : (
              <ApiDataView
                data={chargesHistoryQuery.data}
                emptyLabel="No history."
              />
            )}
          </div>
        </Card>
      ) : null}

      {sidePanel === 'vouchers' || sidePanel === 'vouchersOs' ? (
        <Card className="kf-section-enter kf-section-ambient">
          <CardHeader>
            <CardTitle>
              {sidePanel === 'vouchersOs'
                ? `Vouchers List with OS (${vouchersOs.length})`
                : `Vouchers List (${vouchers.length})`}
            </CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 space-y-2">
            {vouchersQuery.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading vouchers…</p>
            ) : (sidePanel === 'vouchersOs' ? vouchersOs : vouchers).length === 0 ? (
              <p className="text-sm text-[var(--color-neutral-400)]">
                {sidePanel === 'vouchersOs'
                  ? 'No open / outstanding vouchers.'
                  : 'No vouchers linked to this job.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {(sidePanel === 'vouchersOs' ? vouchersOs : vouchers).map((v) => (
                  <li
                    key={v.id}
                    className="rounded-sm bg-white px-3 py-2 text-[13px]"
                  >
                    <Link
                      className="font-medium text-[var(--color-primary-700)] hover:underline"
                      to={`${VOUCHER_ROUTE_PREFIX}/${v.id}`}
                    >
                      {voucherDisplayNumber(v)}
                    </Link>
                    <span className="ml-2 text-[12px] text-[#64748b]">
                      {v.voucher_type}
                      {v.status ? ` · ${v.status}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ) : null}

      {sidePanel === 'pnl' ? (
        <Card className="kf-section-enter kf-ambient-sale">
          <CardHeader>
            <CardTitle>Job Profit Sheet</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            {pnlQuery.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading P&amp;L…</p>
            ) : pnlQuery.data ? (
              <JobPnlSummary pnl={pnlQuery.data} />
            ) : (
              <p className="text-sm text-[var(--color-neutral-400)]">P&L unavailable.</p>
            )}
          </div>
        </Card>
      ) : null}

      {sidePanel === 'customDuty' ? (
        <Card className="kf-section-enter kf-ambient-cost">
          <CardHeader>
            <CardTitle>Job Profit Sheet / Custom Duty</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            {customDutyQuery.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">
                Loading custom duty…
              </p>
            ) : (
              <ApiDataView
                data={customDutyQuery.data}
                emptyLabel="No custom duty data."
              />
            )}
          </div>
        </Card>
      ) : null}

      {sidePanel === 'gpum' ? (
        <Card className="kf-section-enter kf-section-ambient">
          <CardHeader>
            <CardTitle>Accrued Cost / GPUM</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            {gpumQuery.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading GPUM…</p>
            ) : (
              <ApiDataView data={gpumQuery.data} emptyLabel="No GPUM allocations." />
            )}
          </div>
        </Card>
      ) : null}

      {/* Storage + attachments (secondary) */}
      <Card>
        <CardHeader>
          <CardTitle>Container storage charges</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Storage upto date"
              type="date"
              value={storageUpto}
              onChange={(e) => setStorageUpto(e.target.value)}
              className="max-w-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="warning"
              disabled={!storageUpto || actions.calculateStorageCharges.isPending}
              onClick={() =>
                void run(async () => {
                  const preview = await actions.calculateStorageCharges.mutateAsync({
                    storage_upto_date: storageUpto,
                  });
                  setStoragePreview(preview);
                }, 'Storage charges calculated.')
              }
            >
              Calculate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="success"
              disabled={!storageUpto || actions.confirmStorageCharges.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.confirmStorageCharges.mutateAsync({
                      storage_upto_date: storageUpto,
                    }),
                  'Storage charges confirmed to costing.',
                )
              }
            >
              Confirm to costing
            </Button>
          </div>
          {storagePreview != null ? (
            <ApiDataView
              data={storagePreview}
              emptyLabel="No storage preview."
              maxHeightClass="max-h-48"
            />
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charge attachments</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
          <SearchableSelect
            name="attach_charge_id"
            label="Charge"
            value={attachChargeId}
            options={chargeLineOptions}
            onChange={setAttachChargeId}
            placeholder="Search charge by description…"
            allowManualUuid={false}
          />
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Side
            </span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={attachSide}
              onChange={(e) =>
                setAttachSide(
                  e.target.value === 'SALE'
                    ? 'SALE'
                    : e.target.value === 'COST'
                      ? 'COST'
                      : 'CHARGE',
                )
              }
            >
              <option value="CHARGE">CHARGE</option>
              <option value="SALE">SALE</option>
              <option value="COST">COST</option>
            </select>
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              File
            </span>
            <input
              type="file"
              className="block w-full text-[13px] file:mr-2 file:rounded-sm file:border-0 file:bg-[var(--color-primary,#0A2942)] file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = '';
                setAttachPickFile(file);
                if (file && !attachFileName.trim()) {
                  setAttachFileName(file.name);
                }
              }}
            />
            {attachPickFile ? (
              <span className="text-[12px] text-[var(--color-neutral-600)]">
                Selected: {attachPickFile.name}
              </span>
            ) : null}
          </label>
          <Input
            label="File name (optional if uploading)"
            value={attachFileName}
            onChange={(e) => setAttachFileName(e.target.value)}
          />
          <Input
            label="File URL (optional — use if not uploading)"
            value={attachFileUrl}
            onChange={(e) => setAttachFileUrl(e.target.value)}
            className="sm:col-span-2"
          />
          <Button
            type="button"
            size="sm"
            variant="create"
            className="w-fit"
            disabled={
              !attachChargeId.trim() ||
              (!attachPickFile &&
                (!attachFileName.trim() || !attachFileUrl.trim())) ||
              actions.createChargeAttachment.isPending ||
              actions.uploadChargeAttachmentFile.isPending
            }
            onClick={() => void submitChargeAttachment()}
          >
            Attach to charge
          </Button>
        </div>
      </Card>

      {/* Add — Fresa: Charge + Sale (Party A/C) + Cost (Vendor) → composite */}
      <Modal
        open={dialog === 'add'}
        onClose={closeDialog}
        title="Add charge"
        size="full"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={mutations.createComposite.isPending}
              onClick={() => void addCharge()}
            >
              Save and Close
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-1 border-b border-[var(--fresa-border,#C9D3DF)]">
            {(
              [
                ['charge', 'Charge'],
                ['sale', 'Sale'],
                ['cost', 'Cost'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${TAB_BTN} ${addTab === key ? TAB_ACTIVE : TAB_IDLE} ${
                  key === 'sale'
                    ? addTab === key
                      ? 'bg-[#FFE8CC]'
                      : ''
                    : key === 'cost'
                      ? addTab === key
                        ? 'bg-[#D9F1FB]'
                        : ''
                      : ''
                }`}
                onClick={() => setAddTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {addTab === 'charge' ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="block text-sm sm:col-span-3">
                <span className={FIELD_LABEL}>Charge (Freight Charge)</span>
                <div className="flex items-end gap-2">
                  <select
                    className={`${FIELD_CONTROL} min-w-0 flex-1`}
                    value={chargeCodeId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setChargeCodeId(next);
                      const opt = chargeCodeOpts.find((c) => c.id === next);
                      if (opt && !description.trim()) {
                        setDescription(opt.name || opt.label);
                      }
                    }}
                  >
                    <option value="">Select charge…</option>
                    {chargeCodeOpts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Add charge code"
                    aria-label="Add charge code"
                    onClick={() => {
                      setAddChargeCodeTarget('charge');
                      setAddChargeCodeOpen(true);
                    }}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                label="Line No."
                type="number"
                value={lineNo}
                onChange={(e) => setLineNo(e.target.value)}
              />
              <Input
                label="Qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Input
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. SHPT"
              />
              <label className="block text-sm">
                <span className={FIELD_LABEL}>PP / CC</span>
                <select
                  className={FIELD_CONTROL}
                  value={ppCc}
                  onChange={(e) =>
                    setPpCc(e.target.value as 'PP' | 'CC' | '')
                  }
                >
                  <option value="">—</option>
                  <option value="PP">PREPAID</option>
                  <option value="CC">COLLECT</option>
                </select>
              </label>
              <Input
                label="OFD Type"
                value={ofdType}
                onChange={(e) => setOfdType(e.target.value)}
                placeholder="e.g. FREIGHT"
              />
              <Input
                label="Remarks"
                value={chargeRemarks}
                onChange={(e) => setChargeRemarks(e.target.value)}
                className="sm:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm sm:col-span-3">
                <input
                  type="checkbox"
                  checked={isProvisional}
                  onChange={(e) => setIsProvisional(e.target.checked)}
                />
                Provisional (accrued) charge
              </label>
            </div>
          ) : null}

          {addTab === 'sale' ? (
            <div className="kf-ambient-sale kf-section-enter grid gap-3 sm:grid-cols-3 rounded-sm border border-[#FF751F]/40 p-3">
              <label className="block text-sm sm:col-span-3">
                <span className={FIELD_LABEL}>Party Account (Bill-to)</span>
                <select
                  className={FIELD_CONTROL}
                  value={saleBillTo}
                  onChange={(e) => setSaleBillTo(e.target.value)}
                >
                  <option value="">Select party account…</option>
                  {partyAccountOpts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Sale amount"
                type="number"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
              />
              <Input
                label="Qty"
                type="number"
                value={saleQty}
                onChange={(e) => setSaleQty(e.target.value)}
              />
              <Input
                label="Currency"
                value={saleCurrency}
                onChange={(e) => setSaleCurrency(e.target.value)}
              />
              <Input
                label="Ex. Rate"
                type="number"
                value={saleExRate}
                onChange={(e) => setSaleExRate(e.target.value)}
              />
              <Input
                label="FCY Amount"
                type="number"
                value={saleFcy}
                onChange={(e) => setSaleFcy(e.target.value)}
              />
              <Input
                label="Tax Amount"
                type="number"
                value={saleTaxAmount}
                onChange={(e) => setSaleTaxAmount(e.target.value)}
              />
              <Input
                label="Taxable Amount"
                type="number"
                value={saleTaxable}
                onChange={(e) => setSaleTaxable(e.target.value)}
              />
              <Input
                label="Tax Group Code"
                value={saleTaxGroup}
                onChange={(e) => setSaleTaxGroup(e.target.value)}
              />
              <SearchableSelect
                name="sale_tax_rate_id"
                label="Tax rate"
                value={saleTaxRateId}
                options={taxRateOptions}
                onChange={setSaleTaxRateId}
                placeholder="Search tax rate by name…"
                allowManualUuid={false}
              />
              <label className="block text-sm">
                <span className={FIELD_LABEL}>Dr / Cr</span>
                <select
                  className={FIELD_CONTROL}
                  value={saleDrCr}
                  onChange={(e) =>
                    setSaleDrCr(e.target.value as 'DR' | 'CR' | '')
                  }
                >
                  <option value="">—</option>
                  <option value="CR">Cr (+)</option>
                  <option value="DR">Dr (+)</option>
                </select>
              </label>
              <Input
                label="Sale Remarks"
                value={saleRemarks}
                onChange={(e) => setSaleRemarks(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          ) : null}

          {addTab === 'cost' ? (
            <div className="kf-ambient-cost kf-section-enter grid gap-3 sm:grid-cols-3 rounded-sm border border-[#0EA5E9]/40 p-3">
              <label className="block text-sm sm:col-span-3">
                <span className={FIELD_LABEL}>Vendor</span>
                <select
                  className={FIELD_CONTROL}
                  value={costVendor}
                  onChange={(e) => setCostVendor(e.target.value)}
                >
                  <option value="">Select vendor…</option>
                  {vendorOpts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Cost amount"
                type="number"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
              />
              <Input
                label="Currency"
                value={costCurrency}
                onChange={(e) => setCostCurrency(e.target.value)}
              />
              <Input
                label="Ex. Rate"
                type="number"
                value={costExRate}
                onChange={(e) => setCostExRate(e.target.value)}
              />
              <Input
                label="FCY Amount"
                type="number"
                value={costFcy}
                onChange={(e) => setCostFcy(e.target.value)}
              />
              <Input
                label="Tax Amount"
                type="number"
                value={costTaxAmount}
                onChange={(e) => setCostTaxAmount(e.target.value)}
              />
              <label className="block text-sm">
                <span className={FIELD_LABEL}>Dr / Cr</span>
                <select
                  className={FIELD_CONTROL}
                  value={costDrCr}
                  onChange={(e) =>
                    setCostDrCr(e.target.value as 'DR' | 'CR' | '')
                  }
                >
                  <option value="">—</option>
                  <option value="DR">Dr (+)</option>
                  <option value="CR">Cr (+)</option>
                </select>
              </label>
              <Input
                label="Declaration No."
                value={costDeclarationNo}
                onChange={(e) => setCostDeclarationNo(e.target.value)}
              />
              <Input
                label="Declaration Date"
                type="date"
                value={costDeclarationDate}
                onChange={(e) => setCostDeclarationDate(e.target.value)}
              />
              <Input
                label="Reference No."
                value={costReferenceNo}
                onChange={(e) => setCostReferenceNo(e.target.value)}
              />
              <Input
                label="Cost Date"
                type="date"
                value={costDate}
                onChange={(e) => setCostDate(e.target.value)}
              />
              <Input
                label="Cost Remarks"
                value={costRemarks}
                onChange={(e) => setCostRemarks(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Get Job Charges — Fresa: Type=Shipment → Shipment No. → checkbox grid → Submit */}
      <Modal
        open={dialog === 'getJobCharges'}
        onClose={closeDialog}
        title="Get Job Charges"
        size="full"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={
                actions.getJobChargesFromShipment.isPending ||
                gjcLoading ||
                !gjcShipmentId ||
                gjcSelected.size === 0
              }
              onClick={() => void confirmGetJobCharges()}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className={FIELD_LABEL}>Type</span>
              <select
                className={FIELD_CONTROL}
                value="SHIPMENT"
                aria-label="Charge source type"
                onChange={() => undefined}
              >
                <option value="SHIPMENT">Shipment</option>
                <option value="JOB" disabled>
                  Job (use Copy Charges — API gap)
                </option>
                <option value="QUOTATION" disabled>
                  Quotation (use Get Charges — API gap)
                </option>
                <option value="CHARGE_TEMPLATE" disabled>
                  Charge Template (separate apply API)
                </option>
              </select>
            </label>
            <label className="block text-sm">
              <span className={FIELD_LABEL}>Sale / Cost</span>
              <select
                className={FIELD_CONTROL}
                value={gjcSideFilter}
                onChange={(e) =>
                  setGjcSideFilter(e.target.value as 'ALL' | 'SALE' | 'COST')
                }
                aria-label="Sale or cost filter"
              >
                <option value="ALL">All</option>
                <option value="SALE">Sale</option>
                <option value="COST">Cost</option>
              </select>
            </label>
            <label className="block text-sm sm:col-span-1">
              <span className={FIELD_LABEL}>Shipment No.</span>
              <select
                className={FIELD_CONTROL}
                value={gjcShipmentId}
                onChange={(e) => {
                  const next = e.target.value;
                  setGjcShipmentId(next);
                  setGjcPreview([]);
                  setGjcSelected(new Set());
                  if (isUuid(next)) void loadGetJobChargesPreview(next);
                }}
              >
                <option value="">Select shipment…</option>
                {shipmentOpts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {gjcLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">
              Loading shipment charges…
            </p>
          ) : null}
          {gjcVisible.length > 0 ? (
            <div className="max-h-72 overflow-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr>
                    <th className={`${erpTable.th} w-8`}>
                      <input
                        type="checkbox"
                        aria-label="Select all charges"
                        checked={
                          gjcVisible.length > 0 &&
                          gjcVisible.every((c) => gjcSelected.has(c.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGjcSelected(
                              (prev) =>
                                new Set([
                                  ...prev,
                                  ...gjcVisible.map((c) => c.id),
                                ]),
                            );
                          } else {
                            setGjcSelected((prev) => {
                              const next = new Set(prev);
                              for (const c of gjcVisible) next.delete(c.id);
                              return next;
                            });
                          }
                        }}
                      />
                    </th>
                    <th className={erpTable.th}>Charge</th>
                    <th className={erpTable.th}>Code</th>
                    <th className={`${erpTable.th} text-right`}>Qty</th>
                    <th className={SALE_TH}>Sale</th>
                    <th className={SALE_TH}>Currency</th>
                    <th className={COST_TH}>Cost</th>
                    <th className={COST_TH}>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {gjcVisible.map((c) => (
                    <tr key={c.id} className={erpTable.row}>
                      <td className={erpTable.td}>
                        <input
                          type="checkbox"
                          checked={gjcSelected.has(c.id)}
                          onChange={() => toggleGjc(c.id)}
                        />
                      </td>
                      <td className={`${erpTable.td} font-medium`}>
                        {c.description || '—'}
                      </td>
                      <td className={erpTable.td}>
                        {c.charge_code || c.charge_code_id?.slice(0, 8) || '—'}
                      </td>
                      <td className={`${erpTable.td} text-right tabular-nums`}>
                        {c.quantity ?? '—'}
                      </td>
                      <td className={SALE_TD}>
                        {!c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                      </td>
                      <td className={SALE_TD}>
                        {!c.is_cost ? c.currency_code : '—'}
                      </td>
                      <td className={COST_TD}>
                        {c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                      </td>
                      <td className={COST_TD}>
                        {c.is_cost ? c.currency_code : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !gjcLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">
              {gjcShipmentId
                ? gjcPreview.length > 0
                  ? 'No charges match the Sale / Cost filter.'
                  : 'No charges returned for this shipment.'
                : 'Select a shipment to list available charges.'}
            </p>
          ) : null}
          {gjcSelected.size > 0 ? (
            <p className="text-[12px] text-[var(--fresa-header-text,#0A2942)]">
              {gjcSelected.size} charge{gjcSelected.size === 1 ? '' : 's'} selected
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Get Charges */}
      <Modal
        open={dialog === 'getCharges'}
        onClose={closeDialog}
        title="Get Charges"
        size="sm"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={actions.pullJobCharges.isPending}
              onClick={() => void submitGetCharges()}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fromQuotation}
              onChange={(e) => setFromQuotation(e.target.checked)}
            />
            From quotation
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fromPartyStandard}
              onChange={(e) => setFromPartyStandard(e.target.checked)}
            />
            From party standard
          </label>
        </div>
      </Modal>

      {/* Copy Charges */}
      <Modal
        open={dialog === 'copyCharges'}
        onClose={closeDialog}
        title="Copy Charges"
        size="md"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={actions.copyJobCharges.isPending}
              onClick={() => void submitCopyCharges()}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <JobSearchSelect
            name="copy_from_job_id"
            label="From job"
            value={copyFromJobId}
            onChange={setCopyFromJobId}
            placeholder="Search job by number…"
          />
          <Input
            label="From shipment number / reference"
            value={copyFromShipmentId}
            onChange={(e) => setCopyFromShipmentId(e.target.value)}
            placeholder="Shipment number…"
          />
          <Input
            label="From quotation number / reference"
            value={copyFromQuotationId}
            onChange={(e) => setCopyFromQuotationId(e.target.value)}
            placeholder="Quotation number…"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={copySale}
              onChange={(e) => setCopySale(e.target.checked)}
            />
            Copy sale
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={copyCost}
              onChange={(e) => setCopyCost(e.target.checked)}
            />
            Copy cost
          </label>
        </div>
      </Modal>

      {/* Profit Share Calculator — full modal (blog steps 4–7), not a popup */}
      <Modal
        open={dialog === 'profitShare'}
        onClose={closeDialog}
        title="Profit Share Calculator"
        size="full"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={
                actions.profitShareAdd.isPending ||
                !psPreview ||
                !psPercent ||
                !isUuid(psAgentId)
              }
              onClick={() => void submitProfitShare()}
            >
              Add Profit Share
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase text-[var(--fresa-header-text,#0A2942)]">
                Job No.
              </p>
              <p className="text-[13px] font-medium">{jobDisplayNumber(job)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-[var(--fresa-header-text,#0A2942)]">
                Currency
              </p>
              <p className="text-[13px]">{job.currency_code || 'AED'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-[var(--fresa-header-text,#0A2942)]">
                Shipment No.
              </p>
              <p className="text-[13px]">
                {psPreview?.shipmentNumbers ||
                  psCalculator.shipmentNumbers ||
                  '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-[var(--fresa-header-text,#0A2942)]">
                G / N / Vol / Chg Wt / Pcs
              </p>
              <p className="text-[13px] tabular-nums">
                {psCalculatorQuery.isLoading
                  ? 'Loading…'
                  : [
                      psCalculator.grossWeight ?? '—',
                      psCalculator.netWeight ?? '—',
                      psCalculator.volumeCbm ?? '—',
                      psCalculator.chargeableWeight ?? '—',
                      psCalculator.pieces ?? '—',
                    ].join(' / ')}
              </p>
            </div>
            <Input
              label="Profit Percentage %"
              type="number"
              value={psPercent}
              onChange={(e) => setPsPercent(e.target.value)}
              placeholder="0–100"
            />
            <label className="block text-sm">
              <span className={FIELD_LABEL}>Profit Share Agent</span>
              <select
                className={FIELD_CONTROL}
                value={psAgentId}
                onChange={(e) => setPsAgentId(e.target.value)}
              >
                <option value="">-Select-</option>
                {profitShareAgentOpts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className={FIELD_LABEL}>Profit Share A/C (postable COA)</span>
              <Input
                label="Search accounts"
                value={psAccountSearch}
                onChange={(e) => setPsAccountSearch(e.target.value)}
                placeholder="Search chart of accounts…"
              />
              <select
                className={`${FIELD_CONTROL} mt-1`}
                value={psAccountId}
                onChange={(e) => setPsAccountId(e.target.value)}
              >
                <option value="">-Select-</option>
                {psCoaAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-[var(--color-neutral-500)]">
                Note: Profit Share Agent must be a Carrier, Agent, Supplier, or Vendor.
                A/C uses postable COA id as profit_share_account_id.
              </span>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className={FIELD_LABEL}>
                Profit Share Calculation Charge Code
              </span>
              <div className="flex gap-2">
                <select
                  className={`${FIELD_CONTROL} min-w-0 flex-1`}
                  value={psChargeCodeId}
                  onChange={(e) => {
                    setPsChargeCodeId(e.target.value);
                    setPsPreview(null);
                  }}
                >
                  <option value="">Select charge code…</option>
                  {chargeCodeOpts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Add charge code"
                  aria-label="Add charge code"
                  onClick={() => {
                    setAddChargeCodeTarget('profitShare');
                    setAddChargeCodeOpen(true);
                  }}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
                <Button
                  type="button"
                  variant="edit"
                  className="shrink-0"
                  disabled={
                    actions.profitSharePreview.isPending || !isUuid(psChargeCodeId)
                  }
                  onClick={() => void runProfitPreview()}
                >
                  Calculate Profit Share
                </Button>
              </div>
            </label>
          </div>

          {psPreview?.ourProfitShare != null ? (
            <div className="rounded-sm bg-white px-3 py-2 text-sm">
              <span className="font-semibold text-[var(--fresa-header-text,#0A2942)]">
                {psPreview.ourProfitShareLabel || 'Our Profit Share'}:{' '}
              </span>
              <span className="tabular-nums font-medium">
                {psPreview.ourProfitShare.toLocaleString()}
                {psPreview.currency ? ` ${psPreview.currency}` : ''}
              </span>
            </div>
          ) : null}

          {/* Declared Sale */}
          <div className="kf-section-enter overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
            <div className={`${SALE_TH} px-3 py-2`}>Declared Sale</div>
            {!psPreview ? (
              <p className="px-3 py-4 text-sm text-[var(--color-neutral-400)]">
                Calculate Profit Share to load Sale details.
              </p>
            ) : psPreview.saleLines.length === 0 ? (
              <div className="px-3 py-3 space-y-2">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      <th className={SALE_TH}>Total Sale</th>
                      <th className={SALE_TH}>Currency</th>
                      <th className={erpTable.th}>Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={erpTable.row}>
                      <td className={SALE_TD}>
                        {psPreview.saleAmount ?? '—'}
                      </td>
                      <td className={SALE_TD}>{psPreview.currency || '—'}</td>
                      <td className={`${erpTable.td} tabular-nums font-medium`}>
                        {psPreview.grossProfit ?? '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[13px]">
                  <thead>
                    <tr>
                      <th className={erpTable.th}>Line No.</th>
                      <th className={erpTable.th}>Charge</th>
                      <th className={erpTable.th}>OFD Type</th>
                      <th className={erpTable.th}>PP / CC</th>
                      <th className={SALE_TH}>Currency</th>
                      <th className={SALE_TH}>Ex. Rate</th>
                      <th className={SALE_TH}>Qty</th>
                      <th className={SALE_TH}>Amount / Qty</th>
                      <th className={SALE_TH}>FCY Amount</th>
                      <th className={SALE_TH}>Local Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psPreview.saleLines.map((c, i) => (
                      <tr key={c.id} className={erpTable.row}>
                        <td className={erpTable.td}>{c.line_no ?? (i + 1) * 10}</td>
                        <td className={erpTable.td}>{c.description}</td>
                        <td className={erpTable.td}>{c.ofd_type || '—'}</td>
                        <td className={erpTable.td}>{c.pp_cc || '—'}</td>
                        <td className={SALE_TD}>
                          {c.sale?.currency || c.currency_code}
                        </td>
                        <td className={SALE_TD}>
                          {c.sale?.ex_rate ?? c.exchange_rate ?? '—'}
                        </td>
                        <td className={SALE_TD}>{c.quantity ?? c.sale?.qty ?? '—'}</td>
                        <td className={SALE_TD}>
                          {c.sale?.amount_per_qty ?? c.unit_price}
                        </td>
                        <td className={SALE_TD}>{c.sale?.fcy_amount ?? '—'}</td>
                        <td className={SALE_TD}>
                          {c.sale?.local_amount ?? c.line_total ?? c.unit_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Declared Cost */}
          <div className="kf-section-enter overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
            <div className={`${COST_TH} px-3 py-2`}>Declared Cost</div>
            {!psPreview ? (
              <p className="px-3 py-4 text-sm text-[var(--color-neutral-400)]">
                Calculate Profit Share to load Cost details.
              </p>
            ) : psPreview.costLines.length === 0 ? (
              <div className="overflow-x-auto px-3 py-3">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      <th className={COST_TH}>Total Cost</th>
                      <th className={COST_TH}>Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={erpTable.row}>
                      <td className={COST_TD}>{psPreview.costAmount ?? '—'}</td>
                      <td className={COST_TD}>{psPreview.currency || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[13px]">
                  <thead>
                    <tr>
                      <th className={erpTable.th}>Line No.</th>
                      <th className={erpTable.th}>Charge</th>
                      <th className={erpTable.th}>OFD Type</th>
                      <th className={erpTable.th}>PP / CC</th>
                      <th className={COST_TH}>Currency</th>
                      <th className={COST_TH}>Ex. Rate</th>
                      <th className={COST_TH}>Qty</th>
                      <th className={COST_TH}>Amount / Qty</th>
                      <th className={COST_TH}>FCY Amount</th>
                      <th className={COST_TH}>Local Amount</th>
                      <th className={erpTable.th}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psPreview.costLines.map((c, i) => (
                      <tr key={c.id} className={erpTable.row}>
                        <td className={erpTable.td}>{c.line_no ?? (i + 1) * 10}</td>
                        <td className={erpTable.td}>{c.description}</td>
                        <td className={erpTable.td}>{c.ofd_type || '—'}</td>
                        <td className={erpTable.td}>{c.pp_cc || '—'}</td>
                        <td className={COST_TD}>
                          {c.cost?.currency || c.currency_code}
                        </td>
                        <td className={COST_TD}>
                          {c.cost?.ex_rate ?? c.exchange_rate ?? '—'}
                        </td>
                        <td className={COST_TD}>{c.quantity ?? c.cost?.qty ?? '—'}</td>
                        <td className={COST_TD}>
                          {c.cost?.amount_per_qty ?? c.unit_price}
                        </td>
                        <td className={COST_TD}>{c.cost?.fcy_amount ?? '—'}</td>
                        <td className={COST_TD}>
                          {c.cost?.local_amount ?? c.line_total ?? c.unit_price}
                        </td>
                        <td className={erpTable.td}>
                          {c.cost?.remarks || c.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Prorate — shipments and/or house jobs */}
      <Modal
        open={dialog === 'prorate'}
        onClose={closeDialog}
        title="Prorate cost"
        size="md"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            {houseJobCount > 0 ? (
              <Button
                type="button"
                variant="secondary"
                disabled={
                  actions.prorateCost.isPending ||
                  isHouseJob ||
                  !costCharges.length ||
                  !resolveProrateChargeCodeId()
                }
                onClick={() => void submitProrateToHouses()}
              >
                {actions.prorateCost.isPending
                  ? 'Prorating…'
                  : `Prorate to house jobs (${houseJobCount})`}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="success"
              disabled={
                actions.prorateToShipments.isPending ||
                isHouseJob ||
                !costCharges.length ||
                attachedShipmentCount === 0
              }
              onClick={() => void submitProrate()}
            >
              {actions.prorateToShipments.isPending
                ? 'Prorating…'
                : attachedShipmentCount
                  ? `Prorate to shipments (${attachedShipmentCount})`
                  : 'Prorate to shipments'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            Distributes a <span className="font-medium">cost line on this master job</span> onto
            attached shipments (or house jobs). Sale-only lines cannot be prorated.
          </p>
          {isHouseJob ? (
            <p className="text-xs text-[var(--color-warning-700,#a16207)]" role="alert">
              This job has a parent — open the master job, add a Cost amount for the charge, then
              prorate from there.
            </p>
          ) : null}
          {!isHouseJob && !costCharges.length ? (
            <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-700)]">
              <p>No cost lines on this job yet.</p>
              <button
                type="button"
                className="mt-1 font-medium text-[var(--color-primary-700)] hover:underline"
                onClick={openAddCostForProrate}
              >
                + Add cost line (Cost tab)
              </button>
            </div>
          ) : null}
          {!isHouseJob && costCharges.length > 0 && attachedShipmentCount === 0 ? (
            <div className="space-y-2 rounded-md border border-[var(--color-warning-200,#fde68a)] bg-[var(--color-warning-50,#fffbeb)] px-3 py-2 text-xs text-[var(--color-neutral-800)]">
              <p>
                This master job has <span className="font-medium">no attached shipments</span> to
                prorate to.
                {houseJobCount > 0
                  ? ` You can prorate to ${houseJobCount} house job(s), or attach/create a shipment below.`
                  : ' Attach an existing shipment or create one linked to this job.'}
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <ShipmentSearchSelect
                    name="prorate_attach_shipment_id"
                    label="Attach shipment"
                    value={prorateAttachShipmentId}
                    onChange={setProrateAttachShipmentId}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={
                    tabResources.attachExistingShipments.isPending ||
                    tabResources.createLinkShipments.isPending ||
                    !isUuid(prorateAttachShipmentId.trim())
                  }
                  onClick={() => void attachShipmentForProrate()}
                >
                  Attach
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    tabResources.createLinkShipments.isPending ||
                    !isUuid(job.shipper_id || job.billing_party_id || '')
                  }
                  onClick={() => void createShipmentForProrate()}
                >
                  {tabResources.createLinkShipments.isPending
                    ? 'Creating…'
                    : 'Create shipment on job'}
                </Button>
              </div>
              <p className="text-[11px] text-[var(--color-neutral-500)]">
                Or open the job <span className="font-medium">Shipments</span> tab after canceling.
              </p>
            </div>
          ) : null}
          {attachedShipmentCount > 0 ? (
            <p className="text-xs text-[var(--color-success-700)]">
              {attachedShipmentCount} shipment(s) attached
              {shipmentOpts[0] ? ` (e.g. ${shipmentOpts[0].label})` : ''}.
            </p>
          ) : null}
          <div className="block text-sm">
            <span className={FIELD_LABEL}>Charge code</span>
            <div className="flex items-end gap-2">
              <select
                className={`${FIELD_CONTROL} min-w-0 flex-1`}
                value={prorateCodeId}
                onChange={(e) => setProrateCodeId(e.target.value)}
              >
                <option value="">Select charge code…</option>
                {chargeCodeOpts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                title="Add charge code"
                aria-label="Add charge code"
                onClick={() => {
                  setAddChargeCodeTarget('prorate');
                  setAddChargeCodeOpen(true);
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <label className="block text-sm">
            <span className={FIELD_LABEL}>Cost job charge</span>
            <select
              className={FIELD_CONTROL}
              value={prorateChargeId}
              onChange={(e) => {
                const id = e.target.value;
                setProrateChargeId(id);
                const row = costCharges.find((c) => c.id === id);
                if (row?.charge_code_id && isUuid(row.charge_code_id)) {
                  setProrateCodeId(row.charge_code_id);
                }
              }}
            >
              <option value="">
                {costCharges.length ? 'Select cost line…' : 'No cost lines — add one first'}
              </option>
              {costCharges.map((c) => (
                <option key={c.id} value={c.id}>
                  {[
                    c.description || c.charge_code || c.id.slice(0, 8),
                    c.cost_amount != null ? `cost ${c.cost_amount}` : null,
                  ]
                    .filter(Boolean)
                    .join(' — ')}
                </option>
              ))}
            </select>
          </label>
          {costCharges.length ? (
            <button
              type="button"
              className="justify-self-start text-xs font-medium text-[var(--color-primary-700)] hover:underline"
              onClick={openAddCostForProrate}
            >
              + Add another cost line
            </button>
          ) : null}
        </div>
      </Modal>

      {/* Generate Voucher — POST /jobs/:id/vouchers/generate */}
      <Modal
        open={dialog === 'generateVoucher'}
        onClose={closeDialog}
        title="Generate Voucher"
        size="lg"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={actions.generateVoucher.isPending}
              onClick={() => void submitGenerateVoucher()}
            >
              Generate Voucher
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className={FIELD_LABEL}>Voucher type</span>
              <select
                className={FIELD_CONTROL}
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value as VoucherType)}
              >
                {VOUCHER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {VOUCHER_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className={FIELD_LABEL}>Side</span>
              <select
                className={FIELD_CONTROL}
                value={voucherSide}
                onChange={(e) => setVoucherSide(e.target.value as 'SALE' | 'COST')}
              >
                <option value="SALE">Sale</option>
                <option value="COST">Cost</option>
              </select>
            </label>
          </div>
          <Input
            label="Narration"
            value={voucherNarration}
            onChange={(e) => setVoucherNarration(e.target.value)}
          />
          <div className="max-h-56 overflow-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th className={`${erpTable.th} w-8`} />
                  <th className={erpTable.th}>Charge</th>
                  <th className={SALE_TH}>Sale</th>
                  <th className={COST_TH}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((c) => (
                  <tr key={c.id} className={erpTable.row}>
                    <td className={erpTable.td}>
                      <input
                        type="checkbox"
                        checked={voucherChargeIds.has(c.id)}
                        onChange={() => {
                          setVoucherChargeIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(c.id)) next.delete(c.id);
                            else next.add(c.id);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td className={erpTable.td}>{c.description || '—'}</td>
                    <td className={SALE_TD}>
                      {!c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                    </td>
                    <td className={COST_TD}>
                      {c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal
        open={dialog === 'bulkPurchase'}
        onClose={closeDialog}
        title="Bulk Purchase Invoice"
        size="lg"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={bulkPurchasePreviewQuery.isFetching}
              onClick={() => void bulkPurchasePreviewQuery.refetch()}
            >
              Refresh preview
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={actions.generateBulkPurchaseInvoice.isPending}
              onClick={() =>
                void run(async () => {
                  const costIds = charges
                    .filter((c) => Boolean(c.is_cost) && isUuid(c.id))
                    .map((c) => c.id);
                  await actions.generateBulkPurchaseInvoice.mutateAsync(
                    costIds.length ? { charge_ids: costIds } : {},
                  );
                  closeDialog();
                }, 'Bulk purchase invoices generated.')
              }
            >
              {actions.generateBulkPurchaseInvoice.isPending
                ? 'Generating…'
                : 'Generate bulk PIs'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#64748b]">
            Preview groups pending cost lines / vouchers by vendor (GET
            /jobs/:id/invoices/purchase/bulk). Generate creates one DRAFT purchase
            invoice per vendor + currency.
          </p>
          {bulkPurchasePreviewQuery.isLoading ||
          bulkPurchasePreviewQuery.isFetching ? (
            <p className="text-[13px] text-[#64748b]">Loading bulk PI preview…</p>
          ) : bulkPurchasePreviewQuery.isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(bulkPurchasePreviewQuery.error)}
            </p>
          ) : (
            <ApiDataView
              data={bulkPurchasePreviewQuery.data}
              emptyLabel="No bulk purchase preview data."
              maxHeightClass="max-h-96"
            />
          )}
        </div>
      </Modal>

      {/* Addl. Chg% — creates extra charge line as % of a base charge */}
      <Modal
        open={dialog === 'addlChg'}
        onClose={closeDialog}
        title="Additional Charge %"
        size="sm"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={mutations.create.isPending}
              onClick={() => void submitAddlChg()}
            >
              Add Charge
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="block text-sm">
            <span className={FIELD_LABEL}>Base charge</span>
            <select
              className={FIELD_CONTROL}
              value={addlBaseChargeId}
              onChange={(e) => setAddlBaseChargeId(e.target.value)}
            >
              <option value="">Select charge…</option>
              {charges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.description || c.charge_code || c.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Additional %"
            type="number"
            value={addlPercent}
            onChange={(e) => setAddlPercent(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(sideEdit)}
        onClose={() => setSideEdit(null)}
        title={sideEdit ? `Edit ${sideEdit.side}` : 'Edit'}
        size="md"
        footer={
          <>
            <Button type="button" variant="danger" onClick={() => setSideEdit(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={
                !sideEdit ||
                mutations.updateSale.isPending ||
                mutations.updateCost.isPending
              }
              onClick={() => void saveSideEdit()}
            >
              Save
            </Button>
          </>
        }
      >
        {sideEdit ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              value={sideEdit.amount}
              onChange={(e) =>
                setSideEdit((s) => (s ? { ...s, amount: e.target.value } : s))
              }
            />
            <Input
              label="Tax amount"
              type="number"
              value={sideEdit.taxAmount}
              onChange={(e) =>
                setSideEdit((s) => (s ? { ...s, taxAmount: e.target.value } : s))
              }
            />
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                Dr / Cr
              </span>
              <select
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={sideEdit.drCr}
                onChange={(e) =>
                  setSideEdit((s) => (s ? { ...s, drCr: e.target.value } : s))
                }
              >
                <option value="CR">CR</option>
                <option value="DR">DR</option>
              </select>
            </label>
            <Input
              label="Remarks"
              value={sideEdit.remarks}
              onChange={(e) =>
                setSideEdit((s) => (s ? { ...s, remarks: e.target.value } : s))
              }
              className="sm:col-span-2"
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={attachModalOpen}
        onClose={() => setAttachModalOpen(false)}
        title={`Add ${attachSide} attachment`}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="danger"
              onClick={() => setAttachModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="create"
              disabled={
                !attachChargeId.trim() ||
                (!attachPickFile &&
                  (!attachFileName.trim() || !attachFileUrl.trim())) ||
                actions.createChargeAttachment.isPending ||
                actions.uploadChargeAttachmentFile.isPending
              }
              onClick={() => void submitChargeAttachment()}
            >
              Upload & attach
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <Input label="Charge id" value={attachChargeId} readOnly />
          {attachListQuery.data && attachListQuery.data.length > 0 ? (
            <ul className="space-y-1 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-3 py-2">
              {attachListQuery.data.map((att, idx) => {
                const url =
                  resolveJobDocumentFileUrl(
                    {
                      file_url: att.file_url,
                      s3_key: att.s3_key,
                      file_name: att.file_name,
                    },
                    tenantId,
                  ) || att.file_url;
                return (
                  <li
                    key={att.id || `${att.file_name}-${idx}`}
                    className="flex items-center justify-between gap-2 text-[13px]"
                  >
                    <span className="min-w-0 truncate" title={att.file_name}>
                      {att.file_name}
                    </span>
                    {url ? (
                      <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-[var(--fresa-header-text,#0A2942)] underline"
                        onClick={() =>
                          void downloadStoredFile(url, {
                            displayName: att.file_name,
                          })
                        }
                      >
                        Download
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : attachListQuery.isFetching ? (
            <p className="text-[12px] text-[var(--color-neutral-400)]">
              Loading attachments…
            </p>
          ) : (
            <p className="text-[12px] text-[var(--color-neutral-400)]">
              No attachments on this side yet.
            </p>
          )}
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Choose file
            </span>
            <input
              type="file"
              className="block w-full text-[13px] file:mr-2 file:rounded-sm file:border-0 file:bg-[var(--color-primary,#0A2942)] file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = '';
                setAttachPickFile(file);
                if (file) setAttachFileName(file.name);
              }}
            />
            {attachPickFile ? (
              <span className="text-[12px] text-[var(--color-neutral-600)]">
                {attachPickFile.name}
              </span>
            ) : (
              <span className="text-[12px] text-[var(--color-neutral-400)]">
                Or enter name + URL below
              </span>
            )}
          </label>
          <Input
            label="File name"
            value={attachFileName}
            onChange={(e) => setAttachFileName(e.target.value)}
          />
          <Input
            label="File URL"
            value={attachFileUrl}
            onChange={(e) => setAttachFileUrl(e.target.value)}
          />
        </div>
      </Modal>

      <JobInvoiceFormModal
        open={Boolean(invoiceForm)}
        onClose={() => setInvoiceForm(null)}
        jobId={job.id}
        kind={invoiceForm?.kind ?? 'sale'}
        allowPdf={invoiceForm?.allowPdf}
        chargeIds={charges
          .filter((c) =>
            invoiceForm?.kind === 'sale' ? !c.is_cost : Boolean(c.is_cost),
          )
          .map((c) => c.id)
          .filter((id) => isUuid(id))}
        onSaved={() => {
          setMsg(
            invoiceForm?.kind === 'sale'
              ? 'Sales invoice form saved as DRAFT.'
              : 'Purchase / vendor invoice form saved as DRAFT.',
          );
          onChanged?.();
          void chargesQuery.refetch();
        }}
      />

      <AddChargeCodeModal
        open={addChargeCodeOpen}
        nested
        onClose={() => setAddChargeCodeOpen(false)}
        onCreated={(record) => {
          const id = String(record.id ?? '');
          if (!isUuid(id)) return;
          if (addChargeCodeTarget === 'profitShare') {
            setPsChargeCodeId(id);
            setPsPreview(null);
            return;
          }
          if (addChargeCodeTarget === 'prorate') {
            setProrateCodeId(id);
            return;
          }
          setChargeCodeId(id);
          const desc = String(
            record.description ?? record.name ?? record.code ?? '',
          ).trim();
          if (desc && !description.trim()) setDescription(desc);
        }}
      />
    </div>
  );
}
