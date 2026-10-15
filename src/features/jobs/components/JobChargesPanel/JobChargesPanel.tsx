import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { erpTable } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { useJobActions, useJobChargeMutations } from '../../hooks/useJobActions';
import {
  useJobCharges,
  useJobChargesHistory,
  useJobShipmentsList,
} from '../../hooks/useJobs';
import type {
  CreateJobChargesCompositeDto,
  Job,
  JobCharge,
} from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { normalizeJobCharges } from '../../utils/normalizeJob';
import { ApiDataView } from '../ApiDataView';

/** Fresa Sale column — full header + cell tint */
const SALE_TH =
  'bg-[#FF751F] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px]';
const SALE_TD =
  'bg-[#FFE8CC] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums';
/** Fresa Cost column — full header + cell tint */
const COST_TH =
  'bg-[#0EA5E9] text-white text-left font-semibold px-2 py-1.5 whitespace-nowrap text-[11px]';
const COST_TD =
  'bg-[#D9F1FB] px-3 py-1.5 text-[13px] text-[#334155] align-middle tabular-nums';
const FIELD_LABEL =
  'mb-1 block text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]';
const FIELD_CONTROL =
  'w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 py-1.5 text-[13px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]';
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
  | null;

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

/** Normalize profit-share preview payload into Sale / Cost summary fields. */
function parseProfitSharePreview(raw: unknown): {
  saleAmount?: number;
  costAmount?: number;
  currency?: string;
  grossProfit?: number;
  details: Record<string, unknown>;
} {
  const rec = asRecord(raw) ?? {};
  const sale = asRecord(rec.sale) ?? asRecord(rec.sale_details) ?? asRecord(rec.saleDetails);
  const cost = asRecord(rec.cost) ?? asRecord(rec.cost_details) ?? asRecord(rec.costDetails);
  const saleAmount =
    pickNum(rec, 'sale_amount', 'saleAmount', 'total_sale', 'totalSale') ??
    pickNum(sale, 'amount', 'total', 'line_total', 'lineTotal');
  const costAmount =
    pickNum(rec, 'cost_amount', 'costAmount', 'total_cost', 'totalCost') ??
    pickNum(cost, 'amount', 'total', 'line_total', 'lineTotal');
  const currency =
    pickStr(rec, 'currency', 'currency_code', 'currencyCode') ||
    pickStr(sale, 'currency', 'currency_code', 'currencyCode') ||
    pickStr(cost, 'currency', 'currency_code', 'currencyCode') ||
    undefined;
  const grossProfit =
    pickNum(rec, 'gross_profit', 'grossProfit', 'profit', 'gp') ??
    (saleAmount != null && costAmount != null ? saleAmount - costAmount : undefined);
  return { saleAmount, costAmount, currency, grossProfit, details: rec };
}

interface JobChargesPanelProps {
  job: Job;
  onChanged?: () => void;
}

export function JobChargesPanel({ job, onChanged }: JobChargesPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const chargesQuery = useJobCharges(job.id);
  const chargesHistoryQuery = useJobChargesHistory(job.id, showHistory);
  const shipmentsQuery = useJobShipmentsList(job.id);
  const mutations = useJobChargeMutations(job.id);
  const actions = useJobActions(job.id);

  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
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
    if (chargesQuery.data && chargesQuery.data.length > 0) return chargesQuery.data;
    return job.charges ?? [];
  }, [chargesQuery.data, job.charges]);

  const shipmentOpts = useMemo(
    () => shipmentOptions(shipmentsQuery.data),
    [shipmentsQuery.data],
  );

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

  const chargeCodeOpts = useMemo(
    () =>
      chargeCodes
        .filter((c) => isUuid(String(c.id)))
        .map((c) => ({
          id: String(c.id),
          label: String(c.code ?? c.name ?? c.id),
          name: String(c.name ?? c.code ?? ''),
        })),
    [chargeCodes],
  );

  const [dialog, setDialog] = useState<DialogKey>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Add charge — Fresa Charge / Sale / Cost tabs → POST composite
  const [addTab, setAddTab] = useState<'charge' | 'sale' | 'cost'>('charge');
  const [chargeCodeId, setChargeCodeId] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [ppCc, setPpCc] = useState<'PP' | 'CC' | ''>('');
  const [saleBillTo, setSaleBillTo] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleCurrency, setSaleCurrency] = useState('AED');
  const [saleExRate, setSaleExRate] = useState('1');
  const [costVendor, setCostVendor] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costCurrency, setCostCurrency] = useState('AED');
  const [costExRate, setCostExRate] = useState('1');

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
  const [psPreview, setPsPreview] = useState<ReturnType<
    typeof parseProfitSharePreview
  > | null>(null);

  // Prorate
  const [prorateCodeId, setProrateCodeId] = useState('');
  const [prorateChargeId, setProrateChargeId] = useState('');

  // Storage / attachments (secondary)
  const [storageUpto, setStorageUpto] = useState('');
  const [storagePreview, setStoragePreview] = useState<unknown>(null);
  const [attachChargeId, setAttachChargeId] = useState('');
  const [attachFileName, setAttachFileName] = useState('');
  const [attachFileUrl, setAttachFileUrl] = useState('');

  const closeDialog = () => setDialog(null);

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
    setSaleBillTo(job.billing_party_id || job.shipper_id || '');
    setSaleAmount('');
    setSaleCurrency(job.currency_code || 'AED');
    setSaleExRate('1');
    setCostVendor('');
    setCostAmount('');
    setCostCurrency(job.currency_code || 'AED');
    setCostExRate('1');
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
    setDialog(key);
  };

  const addCharge = async () => {
    if (!isUuid(chargeCodeId.trim())) {
      setError('Select a Freight / charge code on the Charge tab.');
      setAddTab('charge');
      return;
    }
    const desc =
      description.trim() ||
      chargeCodeOpts.find((c) => c.id === chargeCodeId.trim())?.name ||
      chargeCodeOpts.find((c) => c.id === chargeCodeId.trim())?.label ||
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

    const dto: CreateJobChargesCompositeDto = {
      charge: {
        charge_code_id: chargeCodeId.trim(),
        description: desc,
        quantity: Number.isFinite(qty) ? qty : 1,
        ...(unit.trim() ? { unit: unit.trim() } : {}),
        ...(ppCc ? { pp_cc: ppCc } : {}),
      },
      ...(saleAmt != null && Number.isFinite(saleAmt)
        ? {
            sale: {
              amount: saleAmt,
              qty: Number.isFinite(qty) ? qty : 1,
              currency: saleCurrency.trim().toUpperCase() || 'AED',
              ex_rate: Number(saleExRate) || 1,
              ...(isUuid(saleBillTo.trim()) ? { bill_to: saleBillTo.trim() } : {}),
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
      setError('Provide a from job, shipment, or quotation UUID.');
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
        'Select Profit Share Agent (must be Carrier, Agent, or Supplier).',
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

  const submitProrate = async () => {
    const code = prorateCodeId.trim();
    const chargeId = prorateChargeId.trim();
    if (!isUuid(code) && !isUuid(chargeId)) {
      setError('Provide charge code or job charge UUID.');
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

  const toggleGjc = (id: string) => {
    setGjcSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}

      {/* Fresa Costing toolbar — Add navy; Get* amber/brown; Profit orange; invoices colored */}
      <div className="flex flex-wrap gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-toolbar-bg,#EEF3F9)] px-3 py-2.5">
        <Button type="button" size="sm" variant="create" onClick={() => openDialog('add')}>
          + Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="warning"
          onClick={() => openDialog('getJobCharges')}
        >
          Get Job Charges
        </Button>
        <Button
          type="button"
          size="sm"
          variant="warning"
          onClick={() => openDialog('getCharges')}
        >
          Get Charges
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          onClick={() => openDialog('copyCharges')}
        >
          Copy Charges
        </Button>
        <Button
          type="button"
          size="sm"
          variant="warning"
          onClick={() => openDialog('profitShare')}
        >
          Profit Share
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          onClick={() => openDialog('prorate')}
        >
          + Generate Prorate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={actions.cancelProrateToShipments.isPending}
          onClick={() =>
            void run(
              () => actions.cancelProrateToShipments.mutateAsync({}),
              'Prorate cancelled.',
            )
          }
        >
          X Cancel Prorate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="warning"
          disabled={actions.createSaleInvoiceFromJob.isPending}
          onClick={() =>
            void run(
              () => actions.createSaleInvoiceFromJob.mutateAsync({}),
              'Sale invoice created from job.',
            )
          }
        >
          + Generate Sales Invoice
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          disabled={actions.createPurchaseInvoiceFromJob.isPending}
          onClick={() =>
            void run(
              () => actions.createPurchaseInvoiceFromJob.mutateAsync({}),
              'Purchase invoice created from job.',
            )
          }
        >
          + Generate Purchase Invoice
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? 'Hide History' : 'Costing History'}
        </Button>
      </div>

      {/* Charge grid — Fresa Costing table chrome */}
      <Card
        padding="none"
        className="border-[var(--fresa-border,#C9D3DF)] shadow-none overflow-hidden"
      >
        <CardHeader className="mb-0 border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-thead-bg,#E9EEF2)] px-4 py-2.5">
          <CardTitle className="text-[var(--fresa-header-text,#0A2942)]">
            Costing
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {chargesQuery.isLoading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              Loading charges…
            </p>
          ) : charges.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-neutral-400)]">
              No charges yet. Use Get Job Charges to pull from a shipment.
            </p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr>
                  <th className={erpTable.th}>Charge</th>
                  <th className={erpTable.th}>Code</th>
                  <th className={`${SALE_TH}`}>Sale</th>
                  <th className={`${COST_TH}`}>Cost</th>
                  <th className={erpTable.th}>Party</th>
                  <th className={`${erpTable.th} text-right`}>Qty</th>
                  <th className={`${erpTable.th} text-right`}>Amount / Qty</th>
                  <th className={erpTable.th}>CCY</th>
                  <th className={erpTable.th} />
                </tr>
              </thead>
              <tbody>
                {charges.map((c: JobCharge) => (
                  <tr key={c.id} className={erpTable.row}>
                    <td className={`${erpTable.td} font-medium`}>
                      {c.description || '—'}
                    </td>
                    <td className={erpTable.td}>
                      {c.charge_code ||
                        (c.charge_code_id ? c.charge_code_id.slice(0, 8) : '—')}
                    </td>
                    <td className={SALE_TD}>
                      {!c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                    </td>
                    <td className={COST_TD}>
                      {c.is_cost ? (c.line_total ?? c.unit_price) : '—'}
                    </td>
                    <td className={erpTable.td}>
                      {c.party_name ||
                        (c.party_id ? c.party_id.slice(0, 8) : '—')}
                    </td>
                    <td className={`${erpTable.td} text-right tabular-nums`}>
                      {c.quantity ?? '—'}
                    </td>
                    <td className={`${erpTable.td} text-right tabular-nums`}>
                      {c.unit_price}
                    </td>
                    <td className={erpTable.td}>{c.currency_code}</td>
                    <td className={erpTable.td}>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="warning"
                          onClick={() =>
                            void run(
                              () =>
                                mutations.updateSale.mutateAsync({
                                  chargeId: c.id,
                                  dto: {
                                    description: c.description,
                                    unit_price: c.unit_price,
                                    currency_code: c.currency_code,
                                    quantity: c.quantity,
                                  },
                                }),
                              'Sale side updated.',
                            )
                          }
                        >
                          Sale
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="edit"
                          onClick={() =>
                            void run(
                              () =>
                                mutations.updateCost.mutateAsync({
                                  chargeId: c.id,
                                  dto: {
                                    description: c.description,
                                    unit_price: c.unit_price,
                                    currency_code: c.currency_code,
                                    quantity: c.quantity,
                                  },
                                }),
                              'Cost side updated.',
                            )
                          }
                        >
                          Cost
                        </Button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showHistory ? (
        <Card>
          <CardHeader>
            <CardTitle>Charge history</CardTitle>
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
          <Input
            label="Charge id"
            value={attachChargeId}
            onChange={(e) => setAttachChargeId(e.target.value)}
            placeholder="Charge UUID"
          />
          <Input
            label="File name"
            value={attachFileName}
            onChange={(e) => setAttachFileName(e.target.value)}
          />
          <Input
            label="File URL"
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
              !attachFileName.trim() ||
              !attachFileUrl.trim() ||
              actions.createChargeAttachment.isPending
            }
            onClick={() =>
              void run(
                () =>
                  actions.createChargeAttachment.mutateAsync({
                    chargeId: attachChargeId.trim(),
                    dto: {
                      file_name: attachFileName.trim(),
                      file_url: attachFileUrl.trim(),
                    },
                  }),
                'Attachment added.',
              )
            }
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
        size="lg"
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
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className={FIELD_LABEL}>Charge (Freight Charge)</span>
                <select
                  className={FIELD_CONTROL}
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
              </label>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            </div>
          ) : null}

          {addTab === 'sale' ? (
            <div className="grid gap-3 sm:grid-cols-2 rounded-sm border border-[#FF751F]/40 bg-[#FFF7ED] p-3">
              <label className="block text-sm sm:col-span-2">
                <span className={FIELD_LABEL}>Party Account (Bill-to)</span>
                <select
                  className={FIELD_CONTROL}
                  value={saleBillTo}
                  onChange={(e) => setSaleBillTo(e.target.value)}
                >
                  <option value="">Select party account…</option>
                  {partyAccountOpts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code ? `${p.name} (${p.code})` : p.name}
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
            </div>
          ) : null}

          {addTab === 'cost' ? (
            <div className="grid gap-3 sm:grid-cols-2 rounded-sm border border-[#0EA5E9]/40 bg-[#F0F9FF] p-3">
              <label className="block text-sm sm:col-span-2">
                <span className={FIELD_LABEL}>Vendor</span>
                <select
                  className={FIELD_CONTROL}
                  value={costVendor}
                  onChange={(e) => setCostVendor(e.target.value)}
                >
                  <option value="">Select vendor…</option>
                  {vendorOpts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code
                        ? `${p.name} (${p.code}) — ${p.party_type}`
                        : `${p.name} — ${p.party_type}`}
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
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Get Job Charges — Fresa: Type=Shipment → Shipment No. → checkbox grid → Submit */}
      <Modal
        open={dialog === 'getJobCharges'}
        onClose={closeDialog}
        title="Get Job Charges"
        size="xl"
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
          <Input
            label="From job UUID"
            value={copyFromJobId}
            onChange={(e) => setCopyFromJobId(e.target.value)}
          />
          <Input
            label="From shipment UUID"
            value={copyFromShipmentId}
            onChange={(e) => setCopyFromShipmentId(e.target.value)}
          />
          <Input
            label="From quotation UUID"
            value={copyFromQuotationId}
            onChange={(e) => setCopyFromQuotationId(e.target.value)}
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

      {/* Profit Share Calculator — Fresa blog steps 4–7 */}
      <Modal
        open={dialog === 'profitShare'}
        onClose={closeDialog}
        title="Profit Share Calculator"
        size="lg"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="edit"
              disabled={
                actions.profitSharePreview.isPending || !isUuid(psChargeCodeId)
              }
              onClick={() => void runProfitPreview()}
            >
              Calculate Profit Share
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
          <label className="block text-sm">
            <span className={FIELD_LABEL}>
              Profit Share Calculation Charge Code
            </span>
            <select
              className={FIELD_CONTROL}
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
          </label>

          {psPreview ? (
            <div className="overflow-hidden rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr>
                    <th className={SALE_TH}>Sale</th>
                    <th className={SALE_TH}>Currency</th>
                    <th className={COST_TH}>Cost</th>
                    <th className={COST_TH}>Currency</th>
                    <th className={erpTable.th}>Gross Profit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={erpTable.row}>
                    <td className={SALE_TD}>
                      {psPreview.saleAmount != null
                        ? psPreview.saleAmount
                        : '—'}
                    </td>
                    <td className={SALE_TD}>{psPreview.currency || '—'}</td>
                    <td className={COST_TD}>
                      {psPreview.costAmount != null
                        ? psPreview.costAmount
                        : '—'}
                    </td>
                    <td className={COST_TD}>{psPreview.currency || '—'}</td>
                    <td className={`${erpTable.td} tabular-nums font-medium`}>
                      {psPreview.grossProfit != null
                        ? psPreview.grossProfit
                        : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[12px] text-[var(--color-neutral-500)]">
              Select a charge code, then click Calculate Profit Share to load Sale
              and Cost details.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 border-t border-[var(--fresa-border,#C9D3DF)] pt-3">
            <Input
              label="Profit Share Percentage"
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
                <option value="">Select agent (Carrier / Agent / Supplier)…</option>
                {profitShareAgentOpts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code
                      ? `${p.name} (${p.code}) — ${p.party_type}`
                      : `${p.name} — ${p.party_type}`}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-[var(--color-neutral-500)]">
                Note: Profit Share Agent must be a Carrier, Agent, or Supplier.
              </span>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className={FIELD_LABEL}>Profit Share A/C</span>
              <select
                className={FIELD_CONTROL}
                value={psAccountId}
                onChange={(e) => setPsAccountId(e.target.value)}
              >
                <option value="">Select account (optional)…</option>
                {partyAccountOpts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.name} (${p.code})` : p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </Modal>

      {/* Prorate */}
      <Modal
        open={dialog === 'prorate'}
        onClose={closeDialog}
        title="Prorate to Shipments"
        size="sm"
        footer={
          <>
            <Button type="button" variant="danger" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={actions.prorateToShipments.isPending}
              onClick={() => void submitProrate()}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <Input
            label="Charge code UUID"
            value={prorateCodeId}
            onChange={(e) => setProrateCodeId(e.target.value)}
          />
          <Input
            label="Job charge UUID (optional)"
            value={prorateChargeId}
            onChange={(e) => setProrateChargeId(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
